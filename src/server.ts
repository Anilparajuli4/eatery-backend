import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Configure CORS
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const io = new Server(httpServer, {
    cors: {
        origin: frontendUrl,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
    }
});

app.use(cors({
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));
app.use(express.json());

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_admin_room', () => {
        socket.join('admin_room');
        console.log('Admin joined room');
    });

    socket.on('join_staff_room', () => {
        socket.join('staff_room');
        console.log('Staff joined room');
    });

    socket.on('join_user_room', (userId) => {
        if (userId) {
            const roomName = `user_${userId}`;
            socket.join(roomName);
            console.log(`User ${userId} joined room ${roomName}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Pass io instance to request
app.use((req, res, next) => {
    (req as any).io = io;
    next();
});

// Health check
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

import statsRoutes from './routes/statsRoutes';
app.use('/api/stats', statsRoutes);

import userRoutes from './routes/userRoutes';
app.use('/api/users', userRoutes);

import uploadRoutes from './routes/uploadRoutes';
app.use('/api/upload', uploadRoutes);

import adminRoutes from './routes/adminRoutes';
app.use('/api/admin', adminRoutes);

import staffRoutes from './routes/staffRoutes';
app.use('/api/staff', staffRoutes);

import path from 'path';

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { prisma, io };
