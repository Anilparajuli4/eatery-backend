import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';

const orderSchema = z.object({
    items: z.array(z.object({
        productId: z.number(),
        quantity: z.number()
    })),
    customerName: z.string().min(1, 'Name is required'),
    customerPhone: z.string().length(10, 'Phone must be exactly 10 digits').regex(/^[0-9]+$/, 'Phone must contain only numbers'),
    customerAddress: z.string().optional(),
    specialInstruction: z.string().optional(),
    paymentMethod: z.string().optional()
});

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16',
});

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, customerName, customerPhone, customerAddress, specialInstruction, paymentMethod = 'STRIPE' } = orderSchema.parse(req.body);
        const userId = (req as any).user?.id;

        // 1. Initial Stock Validation & Formatting
        let total = 0;
        const formattedItems: { productId: number; quantity: number; price: number }[] = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product ${item.productId} not found`);

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
                    error: 'INSUFFICIENT_STOCK'
                });
            }

            if (!product.isAvailable) {
                return res.status(400).json({
                    message: `${product.name} is currently unavailable`,
                    error: 'PRODUCT_UNAVAILABLE'
                });
            }

            total += product.price * item.quantity;
            formattedItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        const isCash = paymentMethod.toUpperCase() === 'CASH';

        if (isCash) {
            // CASH FLOW: Create order and deduct stock immediately
            const order = await prisma.$transaction(async (tx) => {
                // Create Order
                const newOrder = await tx.order.create({
                    data: {
                        userId: userId || null,
                        customerName,
                        customerPhone,
                        customerAddress,
                        specialInstruction,
                        paymentMethod: 'CASH',
                        total,
                        status: 'PENDING',
                        paymentStatus: 'PENDING',
                        items: {
                            create: formattedItems
                        }
                    },
                    include: { items: { include: { product: true } } }
                });

                // Deduct Stock
                for (const item of formattedItems) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!product) continue;

                    const newStock = Math.max(0, product.stock - item.quantity);
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: newStock,
                            isAvailable: newStock > 0
                        }
                    });

                    // Log Stock History
                    await (tx as any).stockHistory.create({
                        data: {
                            productId: item.productId,
                            change: -item.quantity,
                            reason: 'CASH_SALE_PENDING',
                            previousStock: product.stock,
                            newStock: newStock,
                            orderId: newOrder.id,
                            notes: `Cash Order #${newOrder.id} - Pending Payment`
                        }
                    });
                }
                return newOrder;
            }, {
                timeout: 20000 // 20 seconds
            });

            // Notify Admins & Staff
            const io = (req as any).io;
            io.to('admin_room').to('staff_room').emit('new_order', order);
            io.to('admin_room').to('staff_room').emit('notification', {
                title: 'New Cash Order',
                message: `Order #${order.id} for ${customerName} (Cash on Pickup)`,
                type: 'NEW_ORDER'
            });

            return res.status(201).json({ order, clientSecret: null });
        } else {
            // STRIPE FLOW: Create Payment Intent, then Order
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(total * 100),
                currency: 'usd',
                description: `Order regarding food items for User ID: ${userId || 'Guest'}`,
                automatic_payment_methods: { enabled: true },
            });

            const order = await prisma.order.create({
                data: {
                    userId: userId || null,
                    customerName,
                    customerPhone,
                    customerAddress,
                    specialInstruction,
                    paymentMethod: paymentMethod || 'STRIPE',
                    total,
                    status: 'PENDING',
                    paymentStatus: 'PENDING',
                    paymentId: paymentIntent.id,
                    items: {
                        create: formattedItems
                    }
                },
                include: { items: { include: { product: true } } }
            });

            const io = (req as any).io;
            io.to('admin_room').to('staff_room').emit('new_order', order);

            return res.status(201).json({
                order,
                clientSecret: paymentIntent.client_secret
            });
        }
    } catch (error: any) {
        console.error("Order Creation Error:", error);
        res.status(400).json({
            message: 'Error creating order',
            error: error.message || error
        });
    }
};

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: { items: true }
        });

        if (!order || !order.paymentId) {
            return res.status(404).json({ message: 'Order not found or invalid' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentId);

        if (paymentIntent.status === 'succeeded') {
            // Use transaction to update order and deduct stock atomically
            const result = await prisma.$transaction(async (tx) => {
                // 1. Update Order Status
                const updatedOrder = await tx.order.update({
                    where: { id: order.id },
                    data: {
                        paymentStatus: 'PAID',
                        status: 'PREPARING' // Auto-move to preparing
                    },
                    include: { items: { include: { product: true } } }
                });

                // 2. Deduct Stock for each item
                for (const item of order.items) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!product) continue;

                    const newStock = Math.max(0, product.stock - item.quantity);
                    const isAvailable = newStock > 0;

                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: newStock,
                            isAvailable: isAvailable
                        }
                    });

                    // 3. Log Stock History
                    await (tx as any).stockHistory.create({
                        data: {
                            productId: item.productId,
                            change: -item.quantity,
                            reason: 'SALE',
                            previousStock: product.stock,
                            newStock: product.stock - item.quantity,
                            orderId: order.id,
                            notes: `Order #${order.id}`
                        }
                    });
                }

                return updatedOrder;
            }, {
                timeout: 20000 // 20 seconds
            });

            // Notify Admins & Staff
            const io = (req as any).io;
            io.to('admin_room').to('staff_room').emit('new_order', result);

            // Notify the specific order room (for real-time status update in user UI)
            io.to(`order_${result.id}`).emit('order_status_update', result);

            io.to('admin_room').to('staff_room').emit('notification', {
                title: 'New Order Received',
                message: `Order #${result.id} has been paid and is ready for preparation.`,
                type: 'ORDER_PAID'
            });

            return res.json({ status: 'paid', order: result });
        }

        res.json({ status: paymentIntent.status, order });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { ids } = req.query;

        console.log('getOrders - User from token:', user ? JSON.stringify(user) : 'Guest');

        let where: any = {};

        let idArray: number[] = [];
        if (ids) {
            if (Array.isArray(ids)) {
                idArray = ids.map(id => parseInt(id as string)).filter(id => !isNaN(id));
            } else {
                idArray = (ids as string).split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            }
        }

        if (user) {
            if (user.role === 'ADMIN' || user.role === 'STAFF') {
                where = {};
            } else if (idArray.length > 0) {
                where = {
                    OR: [
                        { userId: Number(user.id) },
                        {
                            id: { in: idArray },
                            userId: null
                        }
                    ]
                };
            } else {
                where = { userId: Number(user.id) };
            }
        } else if (idArray.length > 0) {
            where = {
                id: { in: idArray },
                userId: null
            };
        } else {
            return res.json([]);
        }

        console.log('getOrders - Querying with where:', JSON.stringify(where));

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('getOrders - Found orders:', orders.length);

        res.json(orders);
    } catch (error: any) {
        console.error("CRITICAL ERROR FETCHING ORDERS:", error);

        // Provide enough detail for debugging but keep it safe
        const errorMessage = error instanceof Error ? error.message : String(error);

        res.status(500).json({
            message: 'Error fetching orders',
            error: errorMessage,
            code: error.code // Prisma error code if available
        });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { id: Number(id) },
            data: { status },
            include: { items: { include: { product: true } } }
        });

        // Notify User & Staff/Admins
        const io = (req as any).io;

        // Notify the specific user or guest session
        io.to(`order_${order.id}`).emit('order_status_update', order);

        if (order.userId) {
            io.to(`user_${order.userId}`).emit('order_status_update', order);

            if (status === 'READY') {
                io.to(`user_${order.userId}`).emit('notification', {
                    title: 'Food is Ready!',
                    message: `Order #${order.id} is ready for pickup/delivery.`,
                    type: 'ORDER_READY'
                });
            }
        }

        // Notify Admins/Staff for UI sync
        io.to('admin_room').to('staff_room').emit('order_updated', order);

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: 'Error updating order status' });
    }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        const order = await prisma.order.update({
            where: { id: Number(id) },
            data: { paymentStatus },
            include: { items: { include: { product: true } } }
        });

        // Notify Admins/Staff
        const io = (req as any).io;
        io.to('admin_room').to('staff_room').emit('order_updated', order);

        // Notify the specific order room (for guests/logged-in users)
        io.to(`order_${order.id}`).emit('order_status_update', order);

        // Notify User if they are logged in
        if (order.userId) {
            io.to(`user_${order.userId}`).emit('order_status_update', order);
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment status' });
    }
};
