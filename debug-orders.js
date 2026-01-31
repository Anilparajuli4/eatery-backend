const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const orders = await prisma.order.findMany({
            include: { items: true }
        });
        console.log("Total orders:", orders.length);
        const statusCounts = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
        console.log("Orders by status:", JSON.stringify(statusCounts, null, 2));

        const users = await prisma.user.findMany();
        console.log("Users and their roles:");
        users.forEach(u => console.log(`- ${u.name} (${u.email}): ${u.role}`));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
