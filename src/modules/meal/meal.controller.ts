import { NextFunction, Request, Response } from "express";
import { mealService } from "./meal.service";

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meal = await mealService.createMeal(req.user!.id, req.body);

        res.status(201).json({
            success: true,
            message: "Meal created successfully",
            data: meal,
        });
    } catch (error) {
        next(error);
    }
};

const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meal = await mealService.updateMeal(req.user!.id, req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: "Meal updated successfully",
            data: meal,
        });
    } catch (error) {
        next(error);
    }
};

const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await mealService.deleteMeal(req.user!.id, req.params.id);

        res.status(200).json({
            success: true,
            message: "Meal deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const getAllMeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await mealService.getAllMeals(req.query);

        res.status(200).json({
            success: true,
            message: "Meals fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

const getMealById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meal = await mealService.getMealById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Meal fetched successfully",
            data: meal,
        });
    } catch (error) {
        next(error);
    }
};

export const mealController = {
    createMeal,
    updateMeal,
    deleteMeal,
    getAllMeals,
    getMealById,
};
