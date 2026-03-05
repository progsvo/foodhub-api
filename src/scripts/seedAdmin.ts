import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

async function seedAdmin() {
    try {
        const adminData = {
            name: "Admin",
            email: "admin@foodhub.com",
            role: UserRole.ADMIN,
            password: "admin1234",
        };

        const existingUser = await prisma.user.findUnique({
            where: { email: adminData.email },
        });

        if (existingUser) {
            throw new Error("Admin user already exists!");
        }

        const response = await fetch(`${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: process.env.APP_URL || "http://localhost:3000",
            },
            body: JSON.stringify(adminData),
        });

        if (response.ok) {
            await prisma.user.update({
                where: { email: adminData.email },
                data: { emailVerified: true },
            });
            console.log("Admin user seeded successfully");
        } else {
            const error = await response.json();
            console.error("Failed to seed admin:", error);
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
