import * as yup from "yup";

export const getUsersQuerySchema = yup.object({
    page: yup.number().optional().min(1),
    limit: yup.number().optional().min(1),
    sortBy: yup.string().optional().oneOf(["createdAt", "name"]),
    sortOrder: yup.string().optional().oneOf(["asc", "desc"]),
    search: yup.string().optional().trim(),
    role: yup.string().optional().oneOf(["CUSTOMER", "PROVIDER", "ADMIN"]),
    status: yup.string().optional().oneOf(["ACTIVE", "SUSPENDED"]),
});

export const userParamsSchema = yup.object({
    id: yup.string().required("User ID is required"),
});

export const updateUserStatusSchema = yup.object({
    status: yup.string().required("Status is required").oneOf(["ACTIVE", "SUSPENDED"]),
});

export const getAdminOrdersQuerySchema = yup.object({
    page: yup.number().optional().min(1),
    limit: yup.number().optional().min(1),
    sortBy: yup.string().optional().oneOf(["createdAt"]),
    sortOrder: yup.string().optional().oneOf(["asc", "desc"]),
    status: yup.string().optional().oneOf(["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]),
});
