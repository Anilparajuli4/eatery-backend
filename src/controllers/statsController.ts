import { Request, Response } from 'express';
import { prisma } from '../server';

export const getStats = async (req: Request, res: Response) => {
    try {
        // 1. Total Revenue (sum of all completed orders)
        // Note: For now summing all orders, ideally filter by status 'COMPLETED' or 'PAID'
        const revenueAgg = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: 'COMPLETED' }
        });
        const totalRevenue = revenueAgg._sum.total || 0;

        // 2. Total Orders
        const totalOrders = await prisma.order.count();
        const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });

        // 3. Menu Items
        const totalProducts = await prisma.product.count();
        // New this month (simple approx)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const newProducts = await prisma.product.count({
            where: { createdAt: { gte: startOfMonth } }
        });

        // 4. Recent Orders
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        // 5. Weekly Sales (Last 7 days)
        // This is complex in Prisma/SQL, simplified logic here: get orders last 7 days and aggregate in code
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyOrders = await prisma.order.findMany({
            where: { createdAt: { gte: sevenDaysAgo }, status: 'COMPLETED' },
            select: { total: true, createdAt: true }
        });

        // Format for chart: { day: 'Mon', amount: 123 }
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const salesMap = new Map<string, number>();

        // Initialize map with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            salesMap.set(days[d.getDay()], 0);
        }

        weeklyOrders.forEach(order => {
            const dayName = days[new Date(order.createdAt).getDay()];
            salesMap.set(dayName, (salesMap.get(dayName) || 0) + order.total);
        });

        const weeklySales = Array.from(salesMap.entries()).map(([day, amount]) => ({
            day,
            amount
        })).reverse(); // Reversing might be needed depending on UI, but map iteration order is insertion order usually

        // 6. Top Selling Items
        // This requires grouping by orderItem.productId. Prisma has limited support for deep aggregation.
        // Simplified: Fetch all OrderItems, group in JS. suitable for small scale.
        const orderItems = await prisma.orderItem.findMany({
            include: { product: { select: { name: true } } }
        });

        const productSales = new Map<string, { name: string, sold: number, revenue: number }>();

        orderItems.forEach(item => {
            const key = item.productId.toString();
            const existing = productSales.get(key) || { name: item.product.name, sold: 0, revenue: 0 };
            productSales.set(key, {
                name: item.product.name,
                sold: existing.sold + item.quantity,
                revenue: existing.revenue + (item.price * item.quantity)
            });
        });

        const topSellingItems = Array.from(productSales.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({
            revenue: totalRevenue,
            totalOrders,
            pendingOrders,
            avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            menuItems: totalProducts,
            newMenuItems: newProducts,
            recentOrders,
            weeklySales,
            topSellingItems
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};
