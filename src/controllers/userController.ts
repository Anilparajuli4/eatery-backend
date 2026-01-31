import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';

const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['USER', 'ADMIN']).optional()
});

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = updateUserSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: Number(id) } });
        res.sendStatus(204);
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user' });
    }
};
