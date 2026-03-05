import { NextFunction, Request, Response } from "express";
import { cartService } from "./cart.service";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart = await cartService.addToCart(req.user!.id, req.body);

        res.status(200).json({
            success: true,
            message: "Meal added to cart successfully",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart = await cartService.getCart(req.user!.id);

        res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cart = await cartService.removeFromCart(req.user!.id, req.params.mealId);

        res.status(200).json({
            success: true,
            message: "Meal removed from cart successfully",
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

export const cartController = {
    addToCart,
    getCart,
    removeFromCart,
};
