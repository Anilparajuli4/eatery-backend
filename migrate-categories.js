const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateCategories() {
    try {
        // Update all products with DRINKS category to SOFT_DRINKS
        const result = await prisma.$executeRaw`
      UPDATE "Product" 
      SET category = 'SOFT_DRINKS' 
      WHERE category = 'DRINKS'
    `;

        console.log(`Migrated ${result} products from DRINKS to SOFT_DRINKS`);

        // Show all products
        const products = await prisma.product.findMany();
        console.log('\nCurrent products:');
        products.forEach(p => {
            console.log(`- ${p.name} (${p.category})`);
        });

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateCategories();
