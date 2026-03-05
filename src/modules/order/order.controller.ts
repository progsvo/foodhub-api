import { NextFunction, Request, Response } from "express";
import { orderService } from "./order.service";

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await orderService.createOrder(req.user!.id, req.body);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: orders,
        });
    } catch (error) {
        next(error);
    }
};

const getCustomerOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await orderService.getCustomerOrders(req.user!.id, req.query);

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

const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.getOrderById(req.user!.id, req.params.id as string);

        res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

const getProviderOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await orderService.getProviderOrders(req.user!.id, req.query);

        res.status(200).json({
            success: true,
            message: "Provider orders fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.updateOrderStatus(req.user!.id, req.params.id as string, req.body.status);

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const orderController = {
    createOrder,
    getCustomerOrders,
    getOrderById,
    getProviderOrders,
    updateOrderStatus,
};
