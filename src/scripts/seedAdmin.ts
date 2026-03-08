import "dotenv/config";
import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

const RESET_FLAG = process.argv.includes("--reset");
const AUTH_URL = process.env.BETTER_AUTH_URL ?? process.env.APP_URL ?? "http://localhost:5000";

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
            if (RESET_FLAG) {
                // Delete admin and recreate with correct password (fixes "Invalid password" when admin was created by seedData with password123)
                await prisma.user.delete({ where: { email: adminData.email } });
                console.log("Deleted existing admin - recreating with password admin1234...");
            } else {
                // Admin exists - ensure emailVerified so they can log in
                await prisma.user.update({
                    where: { email: adminData.email },
                    data: { emailVerified: true, status: "ACTIVE", role: UserRole.ADMIN },
                });
                console.log("Admin user already exists - ensured emailVerified and role");
                console.log("If you get 'Invalid password', run: npm run seed:admin -- --reset");
                console.log("Try logging in with password123, or run: npm run seed:admin -- --reset");
                return;
            }
        }

        const response = await fetch(`${AUTH_URL}/api/auth/sign-up/email`, {
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
    } catch (error: unknown) {
        const cause = error instanceof Error && "cause" in error ? (error as { cause?: { code?: string } }).cause : null;
        if (cause && typeof cause === "object" && "code" in cause && cause.code === "ECONNREFUSED") {
            console.error("Connection refused. Make sure the API server is running (npm run dev) before seeding.");
        }
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
