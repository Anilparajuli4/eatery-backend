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
    isPopular: z.boolean().optional(),
    stock: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    prepTime: z.number().int().min(1).max(60).optional()
});

export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const category = req.query.category as string;
        const search = req.query.search as string;

        const where: any = {};
        if (category && category !== 'all') {
            where.category = category;
        }
        if (req.query.isPopular === 'true') {
            where.isPopular = true;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const sortBy = (req.query.sortBy as string) || 'createdAt';
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

        const [products, totalItems] = await Promise.all([
            prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { [sortBy]: sortOrder }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            items: products,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error("GET /api/products Error:", error);
        res.status(500).json({
            message: 'Error fetching products',
            error: error instanceof Error ? error.message : 'Unknown error'
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
        console.log(`Updating product ${id} with body:`, req.body);
        const data = productSchema.partial().parse(req.body);
        console.log("Parsed data:", data);
        const userId = (req as any).user?.id;

        const result = await prisma.$transaction(async (tx) => {
            // Get current product state
            const currentProduct = await tx.product.findUnique({ where: { id: Number(id) } });
            if (!currentProduct) throw new Error('Product not found');

            // Check if stock is changing
            if (data.stock !== undefined && data.stock !== currentProduct.stock) {
                const stockDiff = data.stock - currentProduct.stock;
                console.log(`Stock changing for product ${id}: ${currentProduct.stock} -> ${data.stock} (diff: ${stockDiff})`);

                await (tx as any).stockHistory.create({
                    data: {
                        productId: currentProduct.id,
                        change: stockDiff,
                        reason: 'MANUAL_ADJUSTMENT',
                        previousStock: currentProduct.stock,
                        newStock: data.stock,
                        userId: userId ? Number(userId) : null,
                        notes: 'Updated via Admin Product Edit'
                    }
                });
            }

            const product = await tx.product.update({
                where: { id: Number(id) },
                data: {
                    ...data,
                    lastRestocked: (data.stock !== undefined && data.stock > currentProduct.stock)
                        ? new Date()
                        : undefined
                } as any
            });

            return product;
        });

        res.json(result);
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(400).json({
            message: 'Error updating product',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
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

export const getCategories = async (req: Request, res: Response) => {
    try {
        const counts = await prisma.product.groupBy({
            by: ['category'],
            _count: {
                _all: true
            }
        });

        const categories = [
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
        ];

        const response = categories.map(cat => ({
            key: cat,
            count: counts.find(c => c.category === cat)?._count._all || 0
        }));

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
};
