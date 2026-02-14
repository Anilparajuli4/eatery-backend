// import { PrismaClient, Category } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

// Local Category definition to bypass stale Prisma Client types
const Category = {
    BEEF_BURGERS: 'BEEF_BURGERS',
    STEAK_SANDWICHES: 'STEAK_SANDWICHES',
    CHICKEN_BURGERS: 'CHICKEN_BURGERS',
    FISH_BURGERS: 'FISH_BURGERS',
    VEGGIE_BURGERS: 'VEGGIE_BURGERS',
    ROLLS: 'ROLLS',
    WRAPS: 'WRAPS',
    HOT_FOOD: 'HOT_FOOD',
    SALADS: 'SALADS',
    SEAFOOD: 'SEAFOOD',
    LOADED_FRIES: 'LOADED_FRIES',
    CHICKEN_WINGS: 'CHICKEN_WINGS',
    KIDS_MENU: 'KIDS_MENU',
    SIDES: 'SIDES',
    MILKSHAKES: 'MILKSHAKES',
    SOFT_DRINKS: 'SOFT_DRINKS'
} as const;

const prisma = new PrismaClient();

async function seedMenu() {
    try {
        console.log('🌱 Starting menu seeding...\n');

        // Legacy migration removed

        // Clear existing related records to avoid foreign key constraints
        console.log('Clearing existing orders and items...');
        await prisma.stockHistory.deleteMany({});
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});

        // Clear existing products
        await prisma.product.deleteMany({});
        console.log('Cleared existing products\n');

        const products = [
            // BEEF BURGERS
            {
                name: 'Smash Cheese Burger',
                description: 'Beef patty, American Cheese, Caramelised onion, Tomato sauce and mustard',
                price: 10.00,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Classic Aussie',
                description: 'Beef patty, American Cheese, Caramelised onion, Lettuce, Tomato, Beetroot, BBQ & Herb Mayo',
                price: 13.50,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'BSquare Crunch',
                description: 'Beef patty, Lettuce, American Cheese, Crispy Onion, Pickles & BSquare burger sauce',
                price: 14.50,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'The Lot Stacker',
                description: 'Beef patty, Lettuce, Tomato, Caramelised onion, Smokey Bacon, Egg, Pineapple, Pickles, BBQ & BSquare sauce',
                price: 16.50,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'
            },
            {
                name: 'Double Meat Stacker',
                description: '2x Beef patty, Bacon, Cheese & BSquare Sauce',
                price: 16.50,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
            },

            // STEAK SANDWICHES
            {
                name: 'Classic Aussie Steak Sando',
                description: 'Steak, Lettuce, Tomato, Beetroot & Sauce (BBQ, Tomato, Garlic Aioli, BSquare)',
                price: 13.50,
                category: Category.STEAK_SANDWICHES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Loaded Steak Sando',
                description: 'Steak, Lettuce, Tomato, Caramelised Onion, Bacon, Egg, Cheese & Sauce (BBQ, Tomato, Garlic Aioli, BSquare)',
                price: 17.50,
                category: Category.STEAK_SANDWICHES,
                stock: 999,
                isAvailable: true,
            },

            // CHICKEN BURGERS
            {
                name: 'Classic Golden Crunch',
                description: 'Crispy chicken, Lettuce, Mayo',
                price: 12.00,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1525164286253-04e68b9d94bb?w=800&q=80'
            },
            {
                name: 'Southern Heat',
                description: 'Crispy chicken, Cabbage Slaw, Pickles & BSquare mayo',
                price: 13.50,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Portuguese Grill',
                description: 'Marinated Grill Chicken, Lettuce, Tomato, Onion, Cheese & BSquare mayo',
                price: 15.50,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1598182121876-59de571bc88b?w=800&q=80'
            },
            {
                name: 'Loaded Grill',
                description: 'Marinated chicken, Lettuce, Tomato, Onion, Cheese, Bacon, Avo & Peri-Peri Sauce',
                price: 17.50,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Smokey Chook',
                description: 'Crispy chicken, Bacon, Lettuce, Cheese & Aioli',
                price: 14.00,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1626700051175-656a4335c1a7?w=800&q=80'
            },

            // FISH BURGERS
            {
                name: 'Crispy Fish',
                description: 'Housemade Battered Fish, Lettuce, Tomato, Onion & Aioli',
                price: 14.50,
                category: Category.FISH_BURGERS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Calamari Crunch',
                description: 'Crispy Calamari, Slaw, Pickles & Sweet Chilli Aioli',
                price: 14.50,
                category: Category.FISH_BURGERS,
                stock: 999,
                isAvailable: true,
            },

            // VEGGIE BURGERS
            {
                name: 'Green Gold Halloumi',
                description: 'Grilled Halloumi, Lettuce, Tomato, Onion, Roasted Capsicum, Avo, Pesto & Aioli',
                price: 15.50,
                category: Category.VEGGIE_BURGERS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Veggie Magic',
                description: 'Crispy housemade veggie patty, Lettuce, Tomato, Cheese & BSquare Sauce',
                price: 14.50,
                category: Category.VEGGIE_BURGERS,
                stock: 999,
                isAvailable: true,
            },

            // ROLLS
            {
                name: 'Bacon & Egg',
                description: 'Bacon, Egg & Sauce',
                price: 10.00,
                category: Category.ROLLS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Mega Bacon & Egg',
                description: 'Double Bacon, Double Egg, Cheese, Hashbrown & Sauce',
                price: 15.00,
                category: Category.ROLLS,
                stock: 999,
                isAvailable: true,
            },

            // WRAPS
            {
                name: 'Classic Chicken Wrap',
                description: 'Grilled chicken, Lettuce, Mayo',
                price: 12.50,
                category: Category.WRAPS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Loaded Schnitzel Wrap',
                description: 'Housemade chicken Schnitzel, Lettuce, Avo, Bacon, Cheese & Sweet Chilli Mayo',
                price: 15.50,
                category: Category.WRAPS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Veggie Wrap',
                description: 'Veggie patty, Lettuce, Tomato, Onion & BSquare Sauce',
                price: 14.00,
                category: Category.WRAPS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Twister Wrap',
                description: 'Crispy chicken, Spinach, Cheese, Avo & Peri-Peri Sauce',
                price: 15.00,
                category: Category.WRAPS,
                stock: 999,
                isAvailable: true,
            },

            // HOT FOOD
            {
                name: 'Fried Rice',
                description: 'Delicious fried rice',
                price: 9.50,
                category: Category.HOT_FOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Lasagna',
                description: 'Classic lasagna',
                price: 9.50,
                category: Category.HOT_FOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Baked Potato',
                description: 'Baked potato with toppings',
                price: 9.50,
                category: Category.HOT_FOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Roasted Veges',
                description: 'Roasted vegetables',
                price: 9.50,
                category: Category.HOT_FOOD,
                stock: 999,
                isAvailable: true,
            },

            // SALADS
            {
                name: 'Chicken Avo Salad',
                description: 'Fresh salad with chicken and avocado',
                price: 7.50,
                category: Category.SALADS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Green Garden Salad',
                description: 'Fresh garden salad',
                price: 7.50,
                category: Category.SALADS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Caesar Salad',
                description: 'Classic Caesar salad',
                price: 7.50,
                category: Category.SALADS,
                stock: 999,
                isAvailable: true,
            },

            // SEAFOOD
            {
                name: 'Battered Fish',
                description: 'Housemade battered fish',
                price: 11.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Grilled Fish',
                description: 'Lightly coated in flour',
                price: 11.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Calamari Rings',
                description: '3 pieces of calamari rings',
                price: 7.50,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Prawn Cutlets',
                description: '2 pieces of prawn cutlets',
                price: 6.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Fish Bites',
                description: 'Crispy fish bites',
                price: 3.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Fish & Chips Combo',
                description: 'Choice of fish (Battered/Grilled) & Small Chips',
                price: 15.50,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Seafood Basket',
                description: '2 fish bites, 2 calamari rings, 1 prawn cutlet, Small chips, lemon & tartar sauce',
                price: 15.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Fish, Chips & Salad Pack',
                description: 'Choice of fish (Battered/Grilled), garden salad, Chips, lemon & tartar sauce',
                price: 19.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
            },

            // LOADED FRIES
            {
                name: 'Cheese Loaded Fries',
                description: 'Chips, Cheese Sauce & garnish',
                price: 12.00,
                category: Category.LOADED_FRIES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'BBQ Loaded Fries',
                description: 'Chips, Beef and Bacon, BBQ and burger cheese sauce, pickles and garnish',
                price: 15.00,
                category: Category.LOADED_FRIES,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80'
            },
            {
                name: 'Peri-Peri Loaded Fries',
                description: 'Chips, boneless chicken, Peri-peri cheese sauce, pickles & Garnish',
                price: 15.00,
                category: Category.LOADED_FRIES,
                stock: 999,
                isAvailable: true,
            },

            // CHICKEN WINGS
            {
                name: 'BBQ Chicken Wings',
                description: 'BBQ flavored chicken wings',
                price: 7.00,
                category: Category.CHICKEN_WINGS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Peri-Peri Chicken Wings',
                description: 'Peri-Peri flavored chicken wings',
                price: 7.00,
                category: Category.CHICKEN_WINGS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Buffalo Chicken Wings',
                description: 'Buffalo flavored chicken wings',
                price: 7.00,
                category: Category.CHICKEN_WINGS,
                stock: 999,
                isAvailable: true,
            },

            // KIDS MENU
            {
                name: 'Kids Cheese Burger',
                description: 'Kid-sized cheese burger',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Kids Chicken Crunch',
                description: 'Kid-sized chicken burger',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Kids Fish and Chips',
                description: 'Kid-sized fish and chips',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Kids Nuggets and Chips',
                description: 'Kid-sized nuggets and chips',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Kids Chicken Wrap',
                description: 'Kid-sized chicken wrap',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
            },

            // SIDES
            {
                name: 'Chips - Small',
                description: 'Small serving of chips',
                price: 5.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Chips - Large',
                description: 'Large serving of chips',
                price: 7.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80'
            },
            {
                name: 'Chiko Rolls',
                description: 'Crispy chiko rolls',
                price: 4.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Spring Rolls',
                description: 'Crispy spring rolls',
                price: 4.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Dim Sims',
                description: 'Meat/Garlic/Veggie Dim Sims',
                price: 2.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Hash Browns',
                description: 'Crispy hash browns',
                price: 2.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Chicken Nuggets',
                description: '6 pieces of chicken nuggets',
                price: 6.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80'
            },
            {
                name: 'Mozzarella Sticks',
                description: '3 pieces of mozzarella sticks',
                price: 7.00,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1531749964062-fce7a623a083?w=800&q=80'
            },
            {
                name: 'Chicken Tenders',
                description: '3 pieces of chicken tenders',
                price: 7.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Housemade Schnitzel',
                description: 'Housemade chicken schnitzel',
                price: 8.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Crispy Boneless',
                description: 'Crispy boneless chicken',
                price: 7.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
            },

            // MILKSHAKES
            {
                name: 'Vanilla Milkshake',
                description: 'Classic vanilla milkshake',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Strawberry Milkshake',
                description: 'Classic strawberry milkshake',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Cookie n Cream Milkshake',
                description: 'Cookie and cream milkshake',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Banana Milkshake',
                description: 'Classic banana milkshake',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Chocolate Milkshake',
                description: 'Classic chocolate milkshake',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
            },

            // SOFT DRINKS
            {
                name: 'Soft Drink Can',
                description: '375ml can',
                price: 3.00,
                category: Category.SOFT_DRINKS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Soft Drink Bottle',
                description: '600ml bottle',
                price: 4.00,
                category: Category.SOFT_DRINKS,
                stock: 999,
                isAvailable: true,
            },
            {
                name: 'Soft Drink Large Bottle',
                description: '1.25L bottle',
                price: 5.00,
                category: Category.SOFT_DRINKS,
                stock: 999,
                isAvailable: true,
            },
        ];

        const CategoryImages: Record<string, string> = {
            [Category.BEEF_BURGERS]: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80',
            [Category.CHICKEN_BURGERS]: 'https://images.unsplash.com/photo-1626700051175-656a4335c1a7?w=800&q=80',
            [Category.STEAK_SANDWICHES]: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80',
            [Category.FISH_BURGERS]: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
            [Category.VEGGIE_BURGERS]: 'https://images.unsplash.com/photo-1584947844648-6d2c16139cdb?w=800&q=80',
            [Category.ROLLS]: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=800&q=80',
            [Category.WRAPS]: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=800&q=80',
            [Category.HOT_FOOD]: 'https://images.unsplash.com/photo-1544333346-64e4fe1c26b6?w=800&q=80',
            [Category.SALADS]: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
            [Category.SEAFOOD]: 'https://images.unsplash.com/photo-1625944230945-1744a4693b3c?w=800&q=80',
            [Category.LOADED_FRIES]: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80',
            [Category.CHICKEN_WINGS]: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
            [Category.KIDS_MENU]: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
            [Category.SIDES]: 'https://images.unsplash.com/photo-1573806119324-da17cc86c63d?w=800&q=80',
            [Category.MILKSHAKES]: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80',
            [Category.SOFT_DRINKS]: 'https://images.unsplash.com/photo-1527960471264-93ad9965a452?w=800&q=80'
        };

        console.log(`Creating ${products.length} products...\n`);

        let created = 0;
        for (const product of products) {
            // Assign category image if not specifically provided
            const productData = {
                ...product,
                image: (product as any).image || CategoryImages[product.category] || null
            };

            await prisma.product.create({ data: productData as any });
            created++;
            if (created % 10 === 0) {
                console.log(`✓ Created ${created}/${products.length} products...`);
            }
        }

        console.log(`\n✅ Successfully seeded ${created} products!`);

        // Show summary by category
        const categories = await prisma.product.groupBy({
            by: ['category'],
            _count: true,
        });

        console.log('\n📊 Products by category:');
        categories.forEach(cat => {
            console.log(`   ${cat.category}: ${cat._count} items`);
        });

    } catch (error) {
        console.error('❌ Error seeding menu:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedMenu();
