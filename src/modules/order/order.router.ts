import express from "express";
import { orderController } from "./order.controller";
import auth, { UserRole } from "../../middleware/auth";
import validate from "../../middleware/validate";
import { createOrderSchema, getOrdersQuerySchema, orderParamsSchema } from "./order.validation";

const router = express.Router();

router.post("/", auth(UserRole.CUSTOMER), validate({ body: createOrderSchema }), orderController.createOrder);
router.get("/", auth(UserRole.CUSTOMER), validate({ query: getOrdersQuerySchema }), orderController.getCustomerOrders);
router.get("/:id", auth(UserRole.CUSTOMER), validate({ params: orderParamsSchema }), orderController.getOrderById);

export const orderRouter = router;
