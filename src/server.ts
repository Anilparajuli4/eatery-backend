import express, { Request, Response, NextFunction } from 'express';
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
const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
// Allow comma-separated origins from env, and remove trailing slashes
const allowedOrigins = rawFrontendUrl.split(',').map(url => url.trim().replace(/\/$/, ""));

console.log('Allowing CORS origins:', allowedOrigins);

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (origin.endsWith('.vercel.app') && (origin.includes('eatery') || origin.includes('anil-parajulis-projects') || origin.includes('bsquery'))) {
            // Dynamically allow Vercel preview deployments
            console.log('Allowing Vercel preview origin:', origin);
            callback(null, true);
        } else if (origin.includes('localhost')) {
            // Allow localhost for development
            console.log('Allowing localhost origin:', origin);
            callback(null, true);
        } else {
            console.log('Blocked CORS origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
};

const io = new Server(httpServer, {
    cors: corsOptions as any
});

app.use(cors(corsOptions as any));

// Request Logger for Debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});

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

// Debug endpoint to check environment configuration
app.get('/api/debug/config', (req, res) => {
    res.json({
        corsOrigins: allowedOrigins,
        port: process.env.PORT,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV
    });
});

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import inventoryRoutes from './routes/inventoryRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);

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

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { prisma, io };
