import express from "express";
import { cartController } from "./cart.controller";
import auth, { UserRole } from "../../middleware/auth";
import validate from "../../middleware/validate";
import { addToCartSchema, removeFromCartParamsSchema } from "./cart.validation";

const router = express.Router();

router.post("/items", auth(UserRole.CUSTOMER), validate({ body: addToCartSchema }), cartController.addToCart);
router.get("/", auth(UserRole.CUSTOMER), cartController.getCart);
router.delete("/items/:mealId", auth(UserRole.CUSTOMER), validate({ params: removeFromCartParamsSchema }), cartController.removeFromCart);

export const cartRouter = router;
