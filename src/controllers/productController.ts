import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().positive(),
    category: z.enum(['BEEF_BURGERS', 'CHICKEN_BURGERS', 'SEAFOOD', 'LOADED_FRIES', 'SIDES', 'DRINKS']),
    image: z.string().optional(),
    isAvailable: z.boolean().optional()
});

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error("GET /api/products Error:", error);
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const data = productSchema.parse(req.body);
        const product = await prisma.product.create({ data });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = productSchema.partial().parse(req.body);
        const product = await prisma.product.update({
            where: { id: Number(id) },
            data
        });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id: Number(id) } });
        res.sendStatus(204);
    } catch (error) {
        res.status(400).json({ message: 'Error deleting product' });
    }
};
