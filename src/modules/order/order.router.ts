import express from "express";
import { orderController } from "./order.controller";
import auth, { UserRole } from "../../middleware/auth";
import validate from "../../middleware/validate";
import { createOrderSchema, getOrdersQuerySchema, orderParamsSchema, getProviderOrdersQuerySchema, updateOrderStatusSchema } from "./order.validation";

const customerRouter = express.Router();

customerRouter.post("/", auth(UserRole.CUSTOMER), validate({ body: createOrderSchema }), orderController.createOrder);
customerRouter.get("/", auth(UserRole.CUSTOMER), validate({ query: getOrdersQuerySchema }), orderController.getCustomerOrders);
customerRouter.get("/:id", auth(UserRole.CUSTOMER), validate({ params: orderParamsSchema }), orderController.getOrderById);

const providerRouter = express.Router();

providerRouter.get("/", auth(UserRole.PROVIDER), validate({ query: getProviderOrdersQuerySchema }), orderController.getProviderOrders);
providerRouter.patch("/:id", auth(UserRole.PROVIDER), validate({ params: orderParamsSchema, body: updateOrderStatusSchema }), orderController.updateOrderStatus);

export const orderRouter = customerRouter;
export const providerOrderRouter = providerRouter;
