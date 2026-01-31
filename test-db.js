const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log("Database connection successful");
        const users = await prisma.user.findMany();
        console.log("Found users:", users.length);
    } catch (e) {
        console.error("Database connection failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
