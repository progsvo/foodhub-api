import * as yup from "yup";

export const createCategorySchema = yup.object({
    name: yup.string().required("Category name is required").trim().min(2).max(100),
    image: yup.string().optional().nullable().trim().url("Image must be a valid URL"),
});

export const updateCategorySchema = yup.object({
    name: yup.string().optional().trim().min(2).max(100),
    image: yup.string().optional().nullable().trim().url("Image must be a valid URL"),
});

export const getCategoriesQuerySchema = yup.object({
    page: yup.number().optional().min(1),
    limit: yup.number().optional().min(1).max(100),
    sortBy: yup.string().optional().oneOf(["createdAt", "name"]),
    sortOrder: yup.string().optional().oneOf(["asc", "desc"]),
    search: yup.string().optional().trim(),
});

export const categoryParamsSchema = yup.object({
    id: yup.string().required("Category ID is required"),
});
