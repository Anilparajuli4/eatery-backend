import { Request, Response } from 'express';
import { prisma } from '../server';

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // 1. Revenue Breakdown by Category
        // Aligning with statsController: Filter by 'COMPLETED' status to match Dashboard numbers
        const orderItems = await prisma.orderItem.findMany({
            where: {
                order: {
                    status: 'COMPLETED'
                }
            },
            include: {
                product: {
                    select: { category: true, name: true }
                }
            }
        });

        const revenueByCategory = new Map<string, number>();
        let calculatedTotalFromItems = 0;

        orderItems.forEach(item => {
            const category = item.product.category;
            const revenue = item.price * item.quantity;
            revenueByCategory.set(category, (revenueByCategory.get(category) || 0) + revenue);
            calculatedTotalFromItems += revenue;
        });

        // Fetch official Total Revenue from Order Total (Authoritative source matching Dashboard)
        const revenueAgg = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: 'COMPLETED' }
        });
        const totalRevenue = revenueAgg._sum.total || 0;

        const categoryBreakdown = Array.from(revenueByCategory.entries())
            .map(([category, revenue]) => ({
                category: category.replace(/_/g, ' '),
                revenue,
                // Use calculatedTotalFromItems for percentage to ensure 100% distribution within the pie/chart
                percentage: calculatedTotalFromItems > 0 ? Math.round((revenue / calculatedTotalFromItems) * 100) : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);

        // 2. Peak Hours
        // Fetch all orders createdAt
        const allOrders = await prisma.order.findMany({
            where: { status: { not: 'CANCELLED' } },
            select: { createdAt: true }
        });

        const hoursMap = new Array(24).fill(0);
        allOrders.forEach(order => {
            const hour = new Date(order.createdAt).getHours();
            hoursMap[hour]++;
        });

        // Format for UI (showing top 5 peak blocks or full distribution? UI shows list)
        // Let's create specific blocks from UI like "11:00 AM - 12:00 PM"
        const totalOrdersCount = allOrders.length;
        const peakHours = hoursMap.map((count, hour) => {
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            const nextHour = (hour + 1) % 24;
            const nextAmpm = nextHour >= 12 ? 'PM' : 'AM';
            const nextDisplayHour = nextHour % 12 || 12;

            return {
                hour: `${displayHour}:00 ${ampm} - ${nextDisplayHour}:00 ${nextAmpm}`,
                orders: count,
                percentage: totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0,
                rawHour: hour
            };
        })
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 5); // Take top 5

        // 3. Customer Insights
        const distinctUsers = await prisma.user.count({ where: { role: 'USER' } });
        const newCustomersToday = await prisma.user.count({
            where: {
                role: 'USER',
                createdAt: { gte: startOfDay }
            }
        });

        // Simple approximate return rate: Users with > 1 order / Total Users with orders
        // Or just using total orders / unique users as avg frequency
        const usersWithOrders = await prisma.order.groupBy({
            by: ['userId'],
            where: { userId: { not: null } },
            _count: { id: true }
        });

        const returningCustomers = usersWithOrders.filter(u => u._count.id > 1).length;
        const totalCustomersWithOrders = usersWithOrders.length;
        const returnRate = totalCustomersWithOrders > 0
            ? Math.round((returningCustomers / totalCustomersWithOrders) * 100)
            : 0;

        // 4. Weekly Performance (Best Days)
        const weeklyStats = await prisma.order.findMany({
            where: {
                status: 'COMPLETED',
                // Last 30 days to get a good average for "Best Days"
                createdAt: { gte: new Date(new Date().setDate(today.getDate() - 30)) }
            },
            select: {
                createdAt: true,
                total: true
            }
        });

        const dayStats = new Map<string, { revenue: number, orders: number }>();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        days.forEach(day => dayStats.set(day, { revenue: 0, orders: 0 }));

        weeklyStats.forEach(order => {
            const dayName = days[new Date(order.createdAt).getDay()];
            const stat = dayStats.get(dayName)!;
            stat.revenue += order.total;
            stat.orders += 1;
        });

        const bestDays = Array.from(dayStats.entries())
            .map(([day, stats]) => ({
                day,
                revenue: stats.revenue,
                orders: stats.orders
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3); // Top 3

        // 5. Payment Methods
        const stripeOrders = await prisma.order.count({ where: { paymentId: { not: null } } });
        const cashOrders = await prisma.order.count({ where: { paymentId: null } }); // Assuming null is cash/manual
        const totalPaymentOrders = stripeOrders + cashOrders;

        const paymentMethods = [
            {
                method: 'Card Payment',
                amount: 0, // We need amount too? Query aggregates if needed.
                percentage: totalPaymentOrders > 0 ? Math.round((stripeOrders / totalPaymentOrders) * 100) : 0
            },
            {
                method: 'Cash',
                amount: 0,
                percentage: totalPaymentOrders > 0 ? Math.round((cashOrders / totalPaymentOrders) * 100) : 0
            }
        ];
        // To get amounts, we'd do aggregation by paymentId null/not-null.
        // Let's do a quick aggregate for accuracy
        const stripeRevenue = await prisma.order.aggregate({
            _sum: { total: true },
            where: { paymentId: { not: null }, status: 'COMPLETED' }
        });
        const cashRevenue = await prisma.order.aggregate({
            _sum: { total: true },
            where: { paymentId: null, status: 'COMPLETED' } // Assuming null is cash/manual
        });

        paymentMethods[0].amount = stripeRevenue._sum.total || 0;
        paymentMethods[1].amount = cashRevenue._sum.total || 0;


        res.json({
            categoryBreakdown,
            totalRevenue,
            peakHours,
            customerInsights: {
                totalCustomers: distinctUsers,
                newToday: newCustomersToday,
                returnRate,
                avgRating: 4.8 // Mocked until we have reviews
            },
            bestDays,
            paymentMethods
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};
