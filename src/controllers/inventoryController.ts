import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';

// Get low stock products
export const getLowStockProducts = async (req: Request, res: Response) => {
    try {
        // Find products where stock is less than or equal to their specific threshold
        // Note: Prisma doesn't support comparing two columns directly in `where` easily in all versions,
        // but we can fetch and filter or use raw query if needed. 
        // For simplicity and safety, we'll fetch all and filter or use a fixed threshold if dynamic is hard.
        // Better approach: Use database computed column or raw query. 
        // Let's rely on application level filtering for now if dataset is small, or raw query for performance.

        // Using raw query for efficient database-side filtering
        const products = await prisma.$queryRaw`
            SELECT * FROM "Product" 
            WHERE "stock" <= "lowStockThreshold"
        `;

        res.json(products);
    } catch (error) {
        console.error("Error fetching low stock products:", error);
        res.status(500).json({ message: 'Error fetching low stock products' });
    }
};

// Bulk stock update
export const bulkUpdateStock = async (req: Request, res: Response) => {
    try {
        const schema = z.object({
            updates: z.array(z.object({
                id: z.number(),
                stock: z.number().min(0),
                reason: z.string().optional()
            }))
        });

        const { updates } = schema.parse(req.body);
        const userId = (req as any).user?.id;

        await prisma.$transaction(async (tx) => {
            for (const update of updates) {
                const product = await tx.product.findUnique({ where: { id: update.id } });
                if (!product) continue;

                const stockDiff = update.stock - product.stock;
                if (stockDiff === 0) continue;

                // Update product
                await tx.product.update({
                    where: { id: update.id },
                    data: {
                        stock: update.stock,
                        lastRestocked: (update.stock > product.stock) ? new Date() : undefined,
                        isAvailable: update.stock > 0
                    } as any
                });

                // Create history entry
                await (tx as any).stockHistory.create({
                    data: {
                        productId: product.id,
                        change: stockDiff,
                        reason: 'MANUAL_ADJUSTMENT',
                        previousStock: product.stock,
                        newStock: update.stock,
                        notes: update.reason || 'Manual update via Inventory Dashboard',
                        userId: 1 // TODO: Get actual admin ID from auth token
                    }
                });
            }
        });

        res.json({ message: 'Stock updated successfully' });
    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(400).json({ message: 'Error updating stock', error });
    }
};

// Get stock history
export const getStockHistory = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        const history = await (prisma as any).stockHistory.findMany({
            where: { productId: Number(productId) },
            orderBy: { createdAt: 'desc' },
            include: {
                product: true,
                // user: { select: { name: true } } // if needed
            }
        });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock history' });
    }
};
