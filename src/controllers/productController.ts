import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().positive(),
    category: z.enum([
        'BEEF_BURGERS',
        'STEAK_SANDWICHES',
        'CHICKEN_BURGERS',
        'FISH_BURGERS',
        'VEGGIE_BURGERS',
        'ROLLS',
        'WRAPS',
        'HOT_FOOD',
        'SALADS',
        'SEAFOOD',
        'LOADED_FRIES',
        'CHICKEN_WINGS',
        'KIDS_MENU',
        'SIDES',
        'MILKSHAKES',
        'SOFT_DRINKS'
    ]),
    image: z.string().optional(),
    isAvailable: z.boolean().optional(),
    stock: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional()
});

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error("GET /api/products Error:", error);
        res.status(500).json({
            message: 'Error fetching products',
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error
        });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const data = productSchema.parse(req.body);
        const product = await prisma.product.create({ data: data as any });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Validation error', error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = productSchema.partial().parse(req.body);
        const userId = (req as any).user?.id;

        const result = await prisma.$transaction(async (tx) => {
            // Get current product state
            const currentProduct = await tx.product.findUnique({ where: { id: Number(id) } });
            if (!currentProduct) throw new Error('Product not found');

            // Check if stock is changing
            if (data.stock !== undefined && data.stock !== currentProduct.stock) {
                const stockDiff = data.stock - currentProduct.stock;

                await (tx as any).stockHistory.create({
                    data: {
                        productId: currentProduct.id,
                        change: stockDiff,
                        reason: 'MANUAL_ADJUSTMENT', // Or could be passed in body
                        previousStock: currentProduct.stock,
                        newStock: data.stock,
                        userId: userId,
                        notes: 'Updated via Admin Product Edit'
                    }
                });

                // Update lastRestocked if stock increased
                if (stockDiff > 0) {
                    // We need to extend the type or just let prisma handle it if input allows
                    // Ideally we should update the schema Zod definition if we want to pass it explicitly, 
                    // but here we can just inject it into the update data or do it in the query.
                    // The `data` object comes from zod parse, so we can't easily add properties if strict.
                    // But prisma update `data` argument is flexible.
                }
            }

            const product = await tx.product.update({
                where: { id: Number(id) },
                data: {
                    ...data,
                    lastRestocked: (data.stock !== undefined && data.stock > currentProduct.stock)
                        ? new Date()
                        : undefined // Prisma ignores undefined
                } as any
            });

            return product;
        });

        res.json(result);
    } catch (error) {
        console.error("Update Product Error:", error);
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
