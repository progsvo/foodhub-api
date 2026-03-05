import express from "express";
import { categoryController } from "./category.controller";
import auth, { UserRole } from "../../middleware/auth";
import validate from "../../middleware/validate";
import {
    createCategorySchema,
    updateCategorySchema,
    getCategoriesQuerySchema,
    categoryParamsSchema,
} from "./category.validation";

const router = express.Router();

router.post("/", auth(UserRole.ADMIN), validate({ body: createCategorySchema }), categoryController.createCategory);
router.get("/", validate({ query: getCategoriesQuerySchema }), categoryController.getAllCategories);
router.patch("/:id", auth(UserRole.ADMIN), validate({ params: categoryParamsSchema, body: updateCategorySchema }), categoryController.updateCategory);
router.delete("/:id", auth(UserRole.ADMIN), validate({ params: categoryParamsSchema }), categoryController.deleteCategory);

export const categoryRouter = router;
