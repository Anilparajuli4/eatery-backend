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
                description: '140 Gram Smashed Pure beef patty, American Cheese, Caramelised onion, Tomato sauce and mustard',
                price: 10.00,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eea50f6?w=800&q=80'
            },
            {
                name: 'Classic Aussie',
                description: 'Beef patty, American Cheese, Caramelised onion, Lettuce, Tomato, Beetroot, BBQ & Herb Mayo',
                price: 13.50,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'
            },
            {
                name: 'BSquare Crunch',
                description: 'Beef patty, Lettuce, American Cheese, Crispy Onion, Pickles & BSquare burger sauce',
                price: 14.50,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80'
            },
            {
                name: 'The Lot Stacker',
                description: 'Beef patty, Lettuce, Tomato, Caramelised onion, Smokey Bacon, Egg, Pineapple, Pickles, BBQ & BSquare sauce',
                price: 16.50,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
                isPopular: true,
                image: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800&q=80'
            },
            {
                name: 'Double Meat Stacker',
                description: '2x (Beef patty, Bacon, Cheese) & BSquare Sauce',
                price: 16.50,
                category: Category.BEEF_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&q=80'
            },

            // STEAK SANDWICHES
            {
                name: 'Classic Aussie Steak Sando',
                description: 'Steak, lettuce, tomato, beetroot & Sauce (BBQ, Tomato, Garlic Aioli, BSquare)',
                price: 13.50,
                category: Category.STEAK_SANDWICHES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80'
            },
            {
                name: 'Loaded Steak Sando',
                description: 'Steak, Lettuce, tomato, Caramelised Onion, bacon, egg, cheese & Sauce (BBQ, Tomato, Garlic Aioli, BSquare)',
                price: 17.50,
                category: Category.STEAK_SANDWICHES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80'
            },

            // CHICKEN BURGERS
            {
                name: 'Classic Golden Crunch',
                description: 'Crispy chicken, Lettuce, Mayo',
                price: 12.00,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1626700051175-656a4335c1a7?w=800&q=80'
            },
            {
                name: 'Southern Heat',
                description: 'Crispy chicken, Cabbage Slaw, Pickles & Bsquare mayo',
                price: 13.50,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1598182121876-59de571bc88b?w=800&q=80'
            },
            {
                name: 'Portuguese Grill',
                description: 'Marinated Grill Chicken, Lettuce, Tomato, Onion, Cheese & Bsquare mayo',
                price: 15.50,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1598182121077-742894be6fc1?w=800&q=80'
            },
            {
                name: 'Loaded Grill',
                description: 'Marinated chicken, Lettuce, Tomato, Onion, cheese, Bacon, Avo & Peri-Peri Sauce',
                price: 17.50,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=800&q=80'
            },
            {
                name: 'Smokey Chook',
                description: 'Crispy chicken, Bacon, Lettuce, Cheese & Aioli',
                price: 14.00,
                category: Category.CHICKEN_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1525164286253-04e68b9d94bb?w=800&q=80'
            },

            // FISH BURGERS
            {
                name: 'Crispy Fish',
                description: 'Housemade Battered Fish, Lettuce, Tomato, onion & Aioli',
                price: 14.50,
                category: Category.FISH_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80'
            },
            {
                name: 'Calamari Crunch',
                description: 'Crispy Calamari, Slaw, Pickles & Sweet Chilli Aioli',
                price: 14.50,
                category: Category.FISH_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80'
            },

            // VEGGIE BURGERS
            {
                name: 'Green Gold Halloumi',
                description: 'Grilled Halloumi, Lettuce, Tomato, Onion, Roasted capsicum, Avo, Pesto & Aioli',
                price: 15.50,
                category: Category.VEGGIE_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1584947844648-6d2c16139cdb?w=800&q=80'
            },
            {
                name: 'Veggie Magic',
                description: 'Crispy housemade veggie patty, Lettuce, Tomato, cheese & Bsquare Sauce',
                price: 14.50,
                category: Category.VEGGIE_BURGERS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1520072959219-c5956f675b42?w=800&q=80'
            },

            // ROLLS
            {
                name: 'Bacon & Egg Roll',
                description: 'Bacon, Egg & Sauce',
                price: 10.00,
                category: Category.ROLLS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1627375267339-3dc72886fdb4?w=800&q=80'
            },
            {
                name: 'Mega Bacon & Egg Roll',
                description: 'Double Bacon, Double Egg, Cheese, Hashbrown & Sauce',
                price: 15.00,
                category: Category.ROLLS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1510346366100-8451b6bc9320?w=800&q=80'
            },

            // WRAPS
            {
                name: 'Classic Chicken Wrap',
                description: 'Grilled chicken, Lettuce, Mayo',
                price: 12.50,
                category: Category.WRAPS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=800&q=80'
            },
            {
                name: 'Loaded Schnitzel Wrap',
                description: 'Housemade chicken Schnitzel, Lettuce, Avo, Bacon, Cheese & Sweet Chilli mayo',
                price: 15.50,
                category: Category.WRAPS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=800&q=80'
            },
            {
                name: 'Veggie Wrap',
                description: 'Veggie patty, Lettuce, Tomato, Onion & BSquare Sauce',
                price: 14.00,
                category: Category.WRAPS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80'
            },
            {
                name: 'Twister Wrap',
                description: 'Crispy chicken, Spinach, Cheese, Avo & Peri-peri Sauce',
                price: 15.00,
                category: Category.WRAPS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=800&q=80'
            },

            // HOT FOOD
            {
                name: 'Fried Rice',
                description: 'Freshly made fried rice',
                price: 9.50,
                category: Category.HOT_FOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80'
            },
            {
                name: 'Lasagna',
                description: 'Traditional beef lasagna',
                price: 9.50,
                category: Category.HOT_FOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800&q=80'
            },
            {
                name: 'Baked Potato',
                description: 'Loaded baked potato',
                price: 9.50,
                category: Category.HOT_FOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1628151249767-e6f987d3a0f9?w=800&q=80'
            },
            {
                name: 'Roasted Veges',
                description: 'Seasonal roasted vegetables',
                price: 9.50,
                category: Category.HOT_FOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&q=80'
            },

            // SALADS
            {
                name: 'Chicken Avo Salad',
                description: 'Grilled chicken with fresh avocado and mixed greens',
                price: 7.50,
                category: Category.SALADS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
            },
            {
                name: 'Green Garden Salad',
                description: 'Fresh mixed garden greens',
                price: 7.50,
                category: Category.SALADS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80'
            },
            {
                name: 'Ceasar Salad',
                description: 'Classic Caesar salad with parmesan and croutons',
                price: 7.50,
                category: Category.SALADS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80'
            },

            // SEAFOOD
            {
                name: 'Battered Fish',
                description: 'Housemade battered fish fillet',
                price: 11.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80'
            },
            {
                name: 'Grilled Fish',
                description: 'Fresh grilled fish (lightly coated in flour)',
                price: 11.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80'
            },
            {
                name: 'Calamari Rings (3 pcs)',
                description: 'Three crispy calamari rings',
                price: 7.50,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80'
            },
            {
                name: 'Prawn Cutlets (2 pcs)',
                description: 'Two succulent prawn cutlets',
                price: 6.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80'
            },
            {
                name: 'Fish Bites',
                description: 'Crispy fish bites (per piece)',
                price: 3.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80'
            },
            {
                name: 'Fish & Chips Pack',
                description: 'Choice of fish (Battered/Grilled) & Small Chips',
                price: 15.50,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1606990393282-36c9dd814035?w=800&q=80'
            },
            {
                name: 'Seafood Basket',
                description: '2 fish bites, 2 calamari rings, 1 prawn cutlet, Small chips, lemon & tartar sauce',
                price: 15.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80'
            },
            {
                name: 'Fish, Chips and Salad Pack',
                description: 'Choice of fish (Battered/Grilled), garden salad, Chips, lemon & tartar sauce',
                price: 19.00,
                category: Category.SEAFOOD,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1606990393282-36c9dd814035?w=800&q=80'
            },

            // LOADED FRIES
            {
                name: 'Cheese Loaded Fries',
                description: 'Chips, Cheese Sauce & garnish',
                price: 12.00,
                category: Category.LOADED_FRIES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80'
            },
            {
                name: 'BBQ Loaded Fries',
                description: 'Chips, Beef and Bacon, BBQ and burger cheese sauce, pickles and garnish',
                price: 15.00,
                category: Category.LOADED_FRIES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80'
            },
            {
                name: 'Peri-Peri Loaded Fries',
                description: 'Chips, boneless chicken, Peri-peri cheese sauce, pickles & Garnish',
                price: 15.00,
                category: Category.LOADED_FRIES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80'
            },

            // CHICKEN WINGS
            {
                name: 'BBQ Chicken Wings',
                description: 'Juicy wings with BBQ sauce',
                price: 7.00,
                category: Category.CHICKEN_WINGS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80'
            },
            {
                name: 'Peri-Peri Chicken Wings',
                description: 'Spicy wings with Peri-Peri sauce',
                price: 7.00,
                category: Category.CHICKEN_WINGS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80'
            },
            {
                name: 'Buffalo Chicken Wings',
                description: 'Classic wings with Buffalo sauce',
                price: 7.00,
                category: Category.CHICKEN_WINGS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80'
            },

            // KIDS MENU
            {
                name: 'Kids Cheese Burger',
                description: 'Perfectly sized for kids',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
            },
            {
                name: 'Kids Chicken Crunch',
                description: 'Kid-friendly crispy chicken',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
            },
            {
                name: 'Kids Fish and Chips',
                description: 'Mini fish and chips portion',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
            },
            {
                name: 'Kids Nuggets and Chips',
                description: 'Classic chicken nuggets and chips',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
            },
            {
                name: 'Kids Chicken Wrap',
                description: 'Healthy-sized chicken wrap',
                price: 9.50,
                category: Category.KIDS_MENU,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
            },

            // SIDES
            {
                name: 'Chips - Small',
                description: 'Crispy golden chips (Small)',
                price: 5.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80'
            },
            {
                name: 'Chips - Large',
                description: 'Crispy golden chips (Large)',
                price: 7.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80'
            },
            {
                name: 'Calamari (3pcs)',
                description: 'Three crispy calamari rings',
                price: 7.00,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80'
            },
            {
                name: 'Fish Bite',
                description: 'One crispy fish bite',
                price: 3.00,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80'
            },
            {
                name: 'Prawn Cutlets (2pcs)',
                description: 'Two crispy prawn cutlets',
                price: 6.00,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80'
            },
            {
                name: 'Chico Rolls',
                description: 'Classic Australian Chico roll',
                price: 4.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80'
            },
            {
                name: 'Spring Rolls',
                description: 'Crispy vegetable spring rolls',
                price: 4.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&q=80'
            },
            {
                name: 'Dim Sims',
                description: 'Meat/Garlic/Veggie choice',
                price: 2.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80'
            },
            {
                name: 'Hashbrowns',
                description: 'Crispy golden hashbrown',
                price: 2.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1574969884448-fe5bce3d0d51?w=800&q=80'
            },
            {
                name: 'Chicken Nuggets (6pcs)',
                description: 'Six piece chicken nuggets',
                price: 6.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80'
            },
            {
                name: 'Mozerella Sticks (3pcs)',
                description: 'Three crispy mozzarella sticks',
                price: 7.00,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d414?w=800&q=80'
            },
            {
                name: 'Chicken Tenders (3pcs)',
                description: 'Three juicy chicken tenders',
                price: 7.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80'
            },
            {
                name: 'Housemade Schnitzel',
                description: 'Large crispy housemade chicken schnitzel',
                price: 8.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d414?w=800&q=80'
            },
            {
                name: 'Crispy Boneless',
                description: 'Boneless crispy chicken pieces',
                price: 7.50,
                category: Category.SIDES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80'
            },

            // MILKSHAKES
            {
                name: 'Vanilla Milkshake',
                description: 'Classic creamy vanilla',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80'
            },
            {
                name: 'Strawberry Milkshake',
                description: 'Fresh strawberry flavor',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80'
            },
            {
                name: 'Cookie n Cream Milkshake',
                description: 'Crushed cookies and cream',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80'
            },
            {
                name: 'Banana Milkshake',
                description: 'Sweet banana flavor',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80'
            },
            {
                name: 'Chocolate Milkshake',
                description: 'Rich chocolate flavor',
                price: 6.50,
                category: Category.MILKSHAKES,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80'
            },

            // SOFT DRINKS
            {
                name: 'Soft Drink Can',
                description: '375ml Cans',
                price: 3.00,
                category: Category.SOFT_DRINKS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80'
            },
            {
                name: 'Soft Drink Bottle (600ml)',
                description: '600ml Bottle',
                price: 4.00,
                category: Category.SOFT_DRINKS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80'
            },
            {
                name: 'Soft Drink Bottle (1.25L)',
                description: 'Large 1.25L Bottle',
                price: 5.00,
                category: Category.SOFT_DRINKS,
                stock: 999,
                isAvailable: true,
                image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800&q=80'
            }
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
            [Category.MILKSHAKES]: 'https://images.unsplash.com/photo-1553787499-6f9133860012?w=800&q=80',
            [Category.SOFT_DRINKS]: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80'
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
