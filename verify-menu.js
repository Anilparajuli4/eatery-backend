const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMenu() {
    try {
        console.log('📊 Menu Verification Report\n');
        console.log('='.repeat(50));

        // Get total count
        const totalCount = await prisma.product.count();
        console.log(`\nTotal Products: ${totalCount}\n`);

        // Get count by category
        const categories = await prisma.product.groupBy({
            by: ['category'],
            _count: true,
            orderBy: {
                category: 'asc'
            }
        });

        console.log('Products by Category:');
        console.log('-'.repeat(50));
        categories.forEach(cat => {
            console.log(`${cat.category.padEnd(20)} : ${cat._count} items`);
        });

        console.log('\n' + '='.repeat(50));
        console.log('\n✅ Menu verification complete!');

    } catch (error) {
        console.error('❌ Error verifying menu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyMenu();
