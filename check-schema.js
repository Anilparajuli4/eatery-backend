const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Order'
        `;
        console.log("Columns in 'Order' table:");
        console.log(columns);

        const orders = await prisma.order.findMany({ take: 1 });
        console.log("Sample order:", JSON.stringify(orders[0], null, 2));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
