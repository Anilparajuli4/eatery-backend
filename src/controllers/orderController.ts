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

        // Calculate total and formatted items
        let total = 0;
        const formattedItems = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product ${item.productId} not found`);

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
        const order = await prisma.order.findUnique({ where: { id: Number(id) } });

        if (!order || !order.paymentId) {
            return res.status(404).json({ message: 'Order not found or invalid' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentId);

        if (paymentIntent.status === 'succeeded') {
            const updatedOrder = await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentStatus: 'PAID',
                    status: 'PREPARING' // Auto-move to preparing
                },
                include: { items: { include: { product: true } } }
            });

            // Notify Admins & Staff
            const io = (req as any).io;
            io.to('admin_room').to('staff_room').emit('new_order', updatedOrder);
            io.to('admin_room').to('staff_room').emit('notification', {
                title: 'New Order Received',
                message: `Order #${updatedOrder.id} has been paid and is ready for preparation.`,
                type: 'ORDER_PAID'
            });

            return res.json({ status: 'paid', order: updatedOrder });
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
