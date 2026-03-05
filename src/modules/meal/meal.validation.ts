import * as yup from "yup";

export const createMealSchema = yup.object({
    name: yup.string().required("Meal name is required").trim().min(2).max(200),
    description: yup.string().optional().trim(),
    price: yup.number().required("Price is required").positive("Price must be a positive number"),
    image: yup.string().optional().nullable().trim().url("Image must be a valid URL"),
    cuisine: yup.string().optional().trim(),
    dietaryPreference: yup.string().optional().trim(),
    categoryId: yup.string().required("Category ID is required"),
    isAvailable: yup.boolean().optional(),
});

export const updateMealSchema = yup.object({
    name: yup.string().optional().trim().min(2).max(200),
    description: yup.string().optional().trim(),
    price: yup.number().optional().positive("Price must be a positive number"),
    image: yup.string().optional().nullable().trim().url("Image must be a valid URL"),
    cuisine: yup.string().optional().trim(),
    dietaryPreference: yup.string().optional().trim(),
    categoryId: yup.string().optional(),
    isAvailable: yup.boolean().optional(),
});

export const mealParamsSchema = yup.object({
    id: yup.string().required("Meal ID is required"),
});

export const getMealsQuerySchema = yup.object({
    page: yup.number().optional().min(1),
    limit: yup.number().optional().min(1).max(100),
    sortBy: yup.string().optional().oneOf(["createdAt", "price", "name"]),
    sortOrder: yup.string().optional().oneOf(["asc", "desc"]),
    search: yup.string().optional().trim(),
    cuisine: yup.string().optional().trim(),
    dietaryPreference: yup.string().optional().trim(),
    minPrice: yup.number().optional().min(0),
    maxPrice: yup.number().optional().min(0),
    categoryId: yup.string().optional(),
    providerId: yup.string().optional(),
});
