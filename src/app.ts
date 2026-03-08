import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { userRouter } from "./modules/user/user.router";
import { providerRouter } from "./modules/provider/provider.router";
import { categoryRouter } from "./modules/category/category.router";
import { mealRouter, providerMealRouter } from "./modules/meal/meal.router";
import { cartRouter } from "./modules/cart/cart.router";
import { orderRouter, providerOrderRouter } from "./modules/order/order.router";
import { reviewRouter } from "./modules/review/review.router";
import { adminRouter } from "./modules/admin/admin.router";

const app = express();

const allowedOrigins = [
    process.env.APP_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
].filter(Boolean) as string[];

// In development, also allow any localhost/127.0.0.1 origin
const isDev = process.env.NODE_ENV !== "production";
const originFn = (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    cb(null, false);
};

app.use(cors({
    origin: originFn,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}));
app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/users", userRouter);
app.use("/api/providers", providerRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/meals", mealRouter);
app.use("/api/provider/meals", providerMealRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/provider/orders", providerOrderRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use(notFound);
app.use(errorHandler);

export default app;
