import { NextFunction, Request, Response } from "express";
import { providerService } from "./provider.service";

const createProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await providerService.createProviderProfile(req.user!.id, req.body);

        res.status(201).json({
            success: true,
            message: "Provider profile created successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await providerService.updateProviderProfile(req.user!.id, req.body);

        res.status(200).json({
            success: true,
            message: "Provider profile updated successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

const getAllProviders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await providerService.getAllProviders((req as any).validatedQuery ?? req.query);

        res.status(200).json({
            success: true,
            message: "Providers fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

const getProviderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const provider = await providerService.getProviderById(req.params.id as string);

        res.status(200).json({
            success: true,
            message: "Provider fetched successfully",
            data: provider,
        });
    } catch (error) {
        next(error);
    }
};

export const providerController = {
    createProfile,
    updateProfile,
    getAllProviders,
    getProviderById,
};
