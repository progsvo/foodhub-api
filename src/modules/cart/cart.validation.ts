import * as yup from "yup";

export const addToCartSchema = yup.object({
    mealId: yup.string().required("Meal ID is required"),
    quantity: yup.number().optional().integer().min(1, "Quantity must be at least 1"),
});

export const removeFromCartParamsSchema = yup.object({
    mealId: yup.string().required("Meal ID is required"),
});
