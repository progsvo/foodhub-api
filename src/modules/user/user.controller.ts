import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserProfile(req.user!.id);

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUserProfile(req.user!.id, req.body);

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const userController = {
    getProfile,
    updateProfile,
};
