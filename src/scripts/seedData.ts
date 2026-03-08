import "dotenv/config";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

const RESET_FLAG = process.argv.includes("--reset");
const AUTH_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:5000";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

const CUSTOMER_PASSWORD = "customer123";
const PROVIDER_PASSWORD = "provider123";

const SEED_EMAILS = ["customer@foodhub.com", "maria@foodhub.com", "joe@foodhub.com"];

// Admin is created by seed:admin. This script creates customer and providers only.
const usersToCreate = [
    { name: "John Customer", email: "customer@foodhub.com", role: UserRole.CUSTOMER, password: CUSTOMER_PASSWORD },
    { name: "Maria's Kitchen", email: "maria@foodhub.com", role: UserRole.PROVIDER, password: PROVIDER_PASSWORD },
    { name: "Joe's Diner", email: "joe@foodhub.com", role: UserRole.PROVIDER, password: PROVIDER_PASSWORD },
];

const categoriesData = [
    { name: "Italian", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80" },
    { name: "Asian", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80" },
    { name: "American", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" },
    { name: "Mexican", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
    { name: "Desserts", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80" },
];

async function resetSeedUsers() {
    const users = await prisma.user.findMany({
        where: { email: { in: SEED_EMAILS } },
        include: { providerProfile: true },
    });
    if (users.length === 0) return;
    const customer = users.find((u) => u.email === "customer@foodhub.com");
    const maria = users.find((u) => u.email === "maria@foodhub.com");
    const joe = users.find((u) => u.email === "joe@foodhub.com");
    const providerIds = [maria?.providerProfile?.id, joe?.providerProfile?.id].filter(Boolean) as string[];
    const userIds = users.map((u) => u.id);

    await prisma.$transaction(async (tx) => {
        const ordersToDelete = await tx.order.findMany({
            where: {
                OR: [{ userId: { in: userIds } }, { providerId: { in: providerIds } }],
            },
        });
        const orderIds = ordersToDelete.map((o) => o.id);
        if (orderIds.length > 0) {
            await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
            await tx.order.deleteMany({ where: { id: { in: orderIds } } });
        }
        await tx.review.deleteMany({ where: { userId: { in: userIds } } });
        if (providerIds.length > 0) {
            await tx.meal.deleteMany({ where: { providerId: { in: providerIds } } });
            await tx.providerProfile.deleteMany({ where: { userId: { in: userIds } } });
        }
        await tx.cart.deleteMany({ where: { userId: { in: userIds } } });
        await tx.user.deleteMany({ where: { email: { in: SEED_EMAILS } } });
    });
    console.log("Deleted existing seed users - recreating with correct passwords...");
}

async function createUsers() {
    console.log("Creating users...");
    if (RESET_FLAG) await resetSeedUsers();
    const created: Record<string, string> = {};

    for (const user of usersToCreate) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing) {
            await prisma.user.update({
                where: { email: user.email },
                data: { emailVerified: true, status: "ACTIVE", role: user.role },
            });
            created[user.email] = existing.id;
            console.log(`  User ${user.email} already exists - ensured emailVerified and role`);
            if (user === usersToCreate[usersToCreate.length - 1]) {
                console.log("  If login fails, run: npm run seed:data -- --reset");
            }
            continue;
        }

        const password = "password" in user ? (user as { password: string }).password : CUSTOMER_PASSWORD;
        const res = await fetch(`${AUTH_URL}/api/auth/sign-up/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Origin: APP_URL },
            body: JSON.stringify({ ...user, password }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(`Failed to create user ${user.email}: ${JSON.stringify(err)}`);
        }

        const u = await prisma.user.findUnique({ where: { email: user.email } });
        if (!u) throw new Error(`User ${user.email} not found after sign-up`);
        created[user.email] = u.id;

        await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: true },
        });
        console.log(`  Created user: ${user.email}`);
    }
    return created;
}

async function createCategories() {
    console.log("Creating categories...");
    const created: Record<string, string> = {};
    for (const c of categoriesData) {
        const cat = await prisma.category.upsert({
            where: { name: c.name },
            create: c,
            update: { image: c.image },
        });
        created[c.name] = cat.id;
    }
    return created;
}

async function createProviderProfiles(userIds: Record<string, string>) {
    console.log("Creating provider profiles...");
    const mariaId = userIds["maria@foodhub.com"];
    const joeId = userIds["joe@foodhub.com"];
    if (!mariaId || !joeId) throw new Error("Provider users not found");

    const maria = await prisma.providerProfile.upsert({
        where: { userId: mariaId },
        create: {
            userId: mariaId,
            businessName: "Maria's Kitchen",
            description: "Homestyle Italian and Mediterranean cuisine. Fresh ingredients, made with love.",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
            address: "123 Main St, Downtown",
        },
        update: {},
    });
    const joe = await prisma.providerProfile.upsert({
        where: { userId: joeId },
        create: {
            userId: joeId,
            businessName: "Joe's Diner",
            description: "Classic American comfort food. Burgers, fries, and milkshakes.",
            image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
            address: "456 Oak Ave, Midtown",
        },
        update: {},
    });
    return { maria: maria.id, joe: joe.id };
}

async function createMeals(
    categoryIds: Record<string, string>,
    providerIds: { maria: string; joe: string }
) {
    console.log("Creating meals...");
    const meals = [
        { name: "Spaghetti Carbonara", description: "Creamy pasta with bacon and parmesan", price: 12.99, cuisine: "Italian", dietaryPreference: null, category: "Italian", provider: "maria" as const, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80" },
        { name: "Margherita Pizza", description: "Fresh tomato, mozzarella, basil", price: 14.99, cuisine: "Italian", dietaryPreference: "Vegetarian", category: "Italian", provider: "maria" as const, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80" },
        { name: "Chicken Pad Thai", description: "Stir-fried rice noodles with peanuts", price: 11.99, cuisine: "Asian", dietaryPreference: null, category: "Asian", provider: "maria" as const, image: "https://images.unsplash.com/photo-1559314801-0efdaa4f6c45?w=600&q=80" },
        { name: "Caesar Salad", description: "Romaine, parmesan, croutons, Caesar dressing", price: 9.99, cuisine: "American", dietaryPreference: "Vegetarian", category: "American", provider: "maria" as const, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80" },
        { name: "Classic Burger", description: "Beef patty, lettuce, tomato, cheese", price: 13.99, cuisine: "American", dietaryPreference: null, category: "American", provider: "joe" as const, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80" },
        { name: "Fish & Chips", description: "Crispy battered cod with fries", price: 15.99, cuisine: "American", dietaryPreference: null, category: "American", provider: "joe" as const, image: "https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=600&q=80" },
        { name: "Tacos al Pastor", description: "Marinated pork tacos with pineapple", price: 10.99, cuisine: "Mexican", dietaryPreference: null, category: "Mexican", provider: "joe" as const, image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80" },
        { name: "Chocolate Brownie", description: "Warm brownie with vanilla ice cream", price: 6.99, cuisine: null, dietaryPreference: "Vegetarian", category: "Desserts", provider: "joe" as const, image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80" },
    ];

    const created: string[] = [];
    for (const m of meals) {
        const existing = await prisma.meal.findFirst({
            where: { name: m.name, providerId: providerIds[m.provider] },
        });
        if (existing) {
            if (m.name === "Chocolate Brownie" && existing.image !== m.image) {
                await prisma.meal.update({
                    where: { id: existing.id },
                    data: { image: m.image },
                });
            }
            created.push(existing.id);
            continue;
        }
        const meal = await prisma.meal.create({
            data: {
                name: m.name,
                description: m.description,
                price: m.price,
                cuisine: m.cuisine,
                dietaryPreference: m.dietaryPreference,
                image: m.image,
                providerId: providerIds[m.provider],
                categoryId: categoryIds[m.category],
            },
        });
        created.push(meal.id);
    }
    return created;
}

async function createOrdersAndReviews(
    userIds: Record<string, string>,
    providerIds: { maria: string; joe: string },
    mealIds: string[]
) {
    const customerId = userIds["customer@foodhub.com"];
    if (!customerId) throw new Error("Customer user not found");

    const meals = await prisma.meal.findMany({ where: { id: { in: mealIds } }, take: 6 });
    if (meals.length < 3) throw new Error("Not enough meals for orders");

    console.log("Creating orders and reviews...");

    const existingOrder = await prisma.order.findFirst({
        where: { userId: customerId, status: "DELIVERED" },
    });
    if (existingOrder) {
        console.log("  Orders and reviews already exist, skipping");
        return;
    }

    const order1 = await prisma.order.create({
        data: {
            userId: customerId,
            providerId: providerIds.maria,
            status: "DELIVERED",
            deliveryAddress: "789 Customer Lane, Apt 4",
            totalAmount: meals[0].price + meals[1].price,
            items: {
                create: [
                    { mealId: meals[0].id, mealName: meals[0].name, mealPrice: meals[0].price, quantity: 1 },
                    { mealId: meals[1].id, mealName: meals[1].name, mealPrice: meals[1].price, quantity: 1 },
                ],
            },
        },
    });

    const order2 = await prisma.order.create({
        data: {
            userId: customerId,
            providerId: providerIds.joe,
            status: "DELIVERED",
            deliveryAddress: "789 Customer Lane, Apt 4",
            totalAmount: meals[2].price + meals[3].price,
            items: {
                create: [
                    { mealId: meals[2].id, mealName: meals[2].name, mealPrice: meals[2].price, quantity: 1 },
                    { mealId: meals[3].id, mealName: meals[3].name, mealPrice: meals[3].price, quantity: 1 },
                ],
            },
        },
    });

    await prisma.review.createMany({
        data: [
            { userId: customerId, mealId: meals[0].id, rating: 5, comment: "Amazing carbonara! Best I've had." },
            { userId: customerId, mealId: meals[1].id, rating: 4, comment: "Great pizza, would order again." },
            { userId: customerId, mealId: meals[2].id, rating: 5, comment: "Authentic pad thai, very flavorful." },
            { userId: customerId, mealId: meals[3].id, rating: 4, comment: "Fresh and delicious salad." },
        ],
        skipDuplicates: true,
    });

    console.log("  Created 2 delivered orders and 4 reviews");
}

async function main() {
    try {
        console.log("Starting seed... (API must be running at", AUTH_URL, ")");
        const userIds = await createUsers();
        const categoryIds = await createCategories();
        const providerIds = await createProviderProfiles(userIds);
        const mealIds = await createMeals(categoryIds, providerIds);
        await createOrdersAndReviews(userIds, providerIds, mealIds);
        console.log("\nSeed completed successfully!");
        console.log("\nLogin credentials:");
        usersToCreate.forEach((u) => {
            const pw = "password" in u ? (u as { password: string }).password : CUSTOMER_PASSWORD;
            console.log(`  ${u.email} (${u.role}) - password: ${pw}`);
        });
    } catch (error) {
        console.error("Seed failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
