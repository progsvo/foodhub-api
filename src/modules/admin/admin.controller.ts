import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await adminService.getAllUsers((req as any).validatedQuery ?? req.query);

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await adminService.updateUserStatus(id as string, status);

        res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await adminService.getAllOrders((req as any).validatedQuery ?? req.query);

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllOrders,
};
