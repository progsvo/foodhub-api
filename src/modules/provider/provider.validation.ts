import * as yup from "yup";

export const createProfileSchema = yup.object({
    businessName: yup.string().required("Business name is required").trim().min(2).max(200),
    description: yup.string().optional().trim(),
    image: yup.string().optional().nullable().trim().url("Image must be a valid URL"),
    address: yup.string().optional().trim(),
});

export const updateProfileSchema = yup.object({
    businessName: yup.string().optional().trim().min(2).max(200),
    description: yup.string().optional().trim(),
    image: yup.string().optional().nullable().trim().url("Image must be a valid URL"),
    address: yup.string().optional().trim(),
});

export const getProvidersQuerySchema = yup.object({
    page: yup.number().optional().min(1),
    limit: yup.number().optional().min(1).max(100),
    sortBy: yup.string().optional().oneOf(["createdAt", "businessName"]),
    sortOrder: yup.string().optional().oneOf(["asc", "desc"]),
    search: yup.string().optional().trim(),
});
