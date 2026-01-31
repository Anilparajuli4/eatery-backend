import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { z } from 'zod';
import { Role } from '@prisma/client';


const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
    role: z.enum(['USER', 'ADMIN', 'STAFF']).optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: (role as Role) || 'USER'

            }
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        // Mock Google user logic: find or create a user with a specific mock email
        const mockEmail = 'google-user@example.com';
        let user = await prisma.user.findUnique({ where: { email: mockEmail } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: mockEmail,
                    password: 'google_mock_password', // Mock password, not used for login anyway
                    name: 'Google User',
                    role: 'USER'
                }
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Google login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Google Login Mock Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
