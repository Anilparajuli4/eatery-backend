const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Testing with number ID:");
        const res1 = await prisma.order.findMany({ where: { userId: 1 } });
        console.log("Result 1 count:", res1.length);

        console.log("\nTesting with string ID:");
        const res2 = await prisma.order.findMany({ where: { userId: "1" } });
        console.log("Result 2 count:", res2.length);

    } catch (e) {
        console.error("Caught error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
