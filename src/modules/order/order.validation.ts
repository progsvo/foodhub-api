import * as yup from "yup";

export const createOrderSchema = yup.object({
    deliveryAddress: yup
        .string()
        .required("Delivery address is required")
        .trim()
        .min(5, "Delivery address must be at least 5 characters")
        .max(500, "Delivery address must not exceed 500 characters"),
});

export const getOrdersQuerySchema = yup.object({
    page: yup.number().optional().integer().min(1),
    limit: yup.number().optional().integer().min(1).max(100),
    sortBy: yup.string().optional().oneOf(["createdAt"]),
    sortOrder: yup.string().optional().oneOf(["asc", "desc"]),
    status: yup
        .string()
        .optional()
        .oneOf(["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]),
});

export const orderParamsSchema = yup.object({
    id: yup.string().required("Order ID is required"),
});

export const getProviderOrdersQuerySchema = yup.object({
    page: yup.number().optional().integer().min(1),
    limit: yup.number().optional().integer().min(1).max(100),
    sortBy: yup.string().optional().oneOf(["createdAt"]),
    sortOrder: yup.string().optional().oneOf(["asc", "desc"]),
    status: yup
        .string()
        .optional()
        .oneOf(["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]),
});

export const updateOrderStatusSchema = yup.object({
    status: yup
        .string()
        .required("Status is required")
        .oneOf(["PREPARING", "READY", "DELIVERED", "CANCELLED"]),
});
