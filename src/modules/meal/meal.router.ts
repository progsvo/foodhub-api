import express from "express";
import { mealController } from "./meal.controller";
import auth, { UserRole } from "../../middleware/auth";
import validate from "../../middleware/validate";
import {
    createMealSchema,
    updateMealSchema,
    mealParamsSchema,
    getMealsQuerySchema,
} from "./meal.validation";

const publicRouter = express.Router();

publicRouter.get("/", validate({ query: getMealsQuerySchema }), mealController.getAllMeals);
publicRouter.get("/:id", mealController.getMealById);

const providerRouter = express.Router();

providerRouter.post("/", auth(UserRole.PROVIDER), validate({ body: createMealSchema }), mealController.createMeal);
providerRouter.put("/:id", auth(UserRole.PROVIDER), validate({ params: mealParamsSchema, body: updateMealSchema }), mealController.updateMeal);
providerRouter.delete("/:id", auth(UserRole.PROVIDER), validate({ params: mealParamsSchema }), mealController.deleteMeal);

export const mealRouter = publicRouter;
export const providerMealRouter = providerRouter;
