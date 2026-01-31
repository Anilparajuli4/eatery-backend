const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const productsCount = await prisma.product.count();
        console.log("Products count:", productsCount);
        const products = await prisma.product.findMany({ take: 5 });
        console.log("Sample products:", JSON.stringify(products, null, 2));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
