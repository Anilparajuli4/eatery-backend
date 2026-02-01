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
    customerAddress: z.string().min(5, 'Address is too short').refine(val => val.trim().split(/\s+/).length >= 2, {
        message: 'Address must include at least two words (e.g., Street and City)'
    })
});

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16',
});

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, customerName, customerPhone, customerAddress } = orderSchema.parse(req.body);
        const userId = (req as any).user?.id; // Optional if guest checkout allowed

        // Calculate total and formatted items with stock validation
        let total = 0;
        const formattedItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product ${item.productId} not found`);

            // Phase 1: Critical Stock Validation
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

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'usd',
            description: `Order regarding food items for User ID: ${userId || 'Guest'}`,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Create order but DON'T deduct stock yet (wait for payment)
        // Optionally reservation could be done here, but simpler to check again at payment or use transactions
        const order = await prisma.order.create({
            data: {
                userId,
                customerName,
                customerPhone,
                customerAddress,
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

        // Notify Admins & Staff via Socket
        const io = (req as any).io;
        io.to('admin_room').to('staff_room').emit('new_order', order);

        res.status(201).json({
            order,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(400).json({ message: 'Error creating order', error });
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
            });

            // Notify Admins & Staff
            const io = (req as any).io;
            io.to('admin_room').to('staff_room').emit('new_order', result);
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

        // Admins and Staff see all orders, Users see their own
        const where = (user.role === 'ADMIN' || user.role === 'STAFF') ? {} : { userId: user.id };

        const orders = await prisma.order.findMany({
            where,
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
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

        // Notify the specific user
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
