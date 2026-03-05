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

const app = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/users", userRouter);
app.use("/api/providers", providerRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/meals", mealRouter);
app.use("/api/provider/meals", providerMealRouter);
app.use("/api/cart", cartRouter);
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use(notFound);
app.use(errorHandler);

export default app;
