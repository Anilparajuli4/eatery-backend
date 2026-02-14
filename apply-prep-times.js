const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Updating preparation times by category...");

        // Category-based prep times
        const categoryTimes = {
            'BEEF_BURGERS': 18,
            'CHICKEN_BURGERS': 18,
            'STEAK_SANDWICHES': 20,
            'FISH_BURGERS': 15,
            'VEGGIE_BURGERS': 15,
            'ROLLS': 10,
            'WRAPS': 12,
            'HOT_FOOD': 10,
            'SALADS': 8,
            'SEAFOOD': 15,
            'LOADED_FRIES': 12,
            'CHICKEN_WINGS': 15,
            'KIDS_MENU': 10,
            'SIDES': 8,
            'MILKSHAKES': 5,
            'SOFT_DRINKS': 2
        };

        for (const [category, time] of Object.entries(categoryTimes)) {
            const count = await prisma.$executeRawUnsafe(
                `UPDATE "Product" SET "prepTime" = $1 WHERE category = $2::"Category"`,
                time, category
            );
            console.log(`Updated ${count} items in ${category} to ${time} min.`);
        }

        // Specific popular items get tailored times
        await prisma.$executeRaw`UPDATE "Product" SET "prepTime" = 22 WHERE name LIKE '%Stacker%'`;
        await prisma.$executeRaw`UPDATE "Product" SET "prepTime" = 25 WHERE name LIKE '%Loaded%'`;

        console.log("Updating featured status...");
        // Mark some items as popular for FeaturedItems component
        await prisma.$executeRaw`UPDATE "Product" SET "isPopular" = true WHERE id IN (SELECT id FROM "Product" LIMIT 8)`;

        console.log("Varied prep times applied successfully!");
    } catch (e) {
        console.error("Error applying prep times:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
