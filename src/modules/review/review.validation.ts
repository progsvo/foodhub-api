import * as yup from "yup";

export const createReviewSchema = yup.object({
    mealId: yup.string().required("Meal ID is required"),
    rating: yup
        .number()
        .required("Rating is required")
        .integer("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must not exceed 5"),
    comment: yup.string().optional().trim().max(1000, "Comment must not exceed 1000 characters"),
});

export const getReviewsQuerySchema = yup.object({
    page: yup.number().optional().integer().min(1),
    limit: yup.number().optional().integer().min(1).max(100),
    sortBy: yup.string().optional().oneOf(["createdAt", "rating"]),
    sortOrder: yup.string().optional().oneOf(["asc", "desc"]),
});

export const reviewMealParamsSchema = yup.object({
    mealId: yup.string().required("Meal ID is required"),
});
