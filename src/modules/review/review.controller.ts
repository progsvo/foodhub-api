import { NextFunction, Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const review = await reviewService.createReview(req.user!.id, req.body);

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: review,
        });
    } catch (error) {
        next(error);
    }
};

const getMealReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await reviewService.getMealReviews(req.params.mealId, req.query);

        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

export const reviewController = {
    createReview,
    getMealReviews,
};
