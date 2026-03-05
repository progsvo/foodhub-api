import express from "express";
import { adminController } from "./admin.controller";
import auth, { UserRole } from "../../middleware/auth";
import validate from "../../middleware/validate";
import {
    getUsersQuerySchema,
    userParamsSchema,
    updateUserStatusSchema,
    getAdminOrdersQuerySchema,
} from "./admin.validation";

const router = express.Router();

router.get(
    "/users",
    auth(UserRole.ADMIN),
    validate({ query: getUsersQuerySchema }),
    adminController.getAllUsers
);

router.patch(
    "/users/:id",
    auth(UserRole.ADMIN),
    validate({ params: userParamsSchema, body: updateUserStatusSchema }),
    adminController.updateUserStatus
);

router.get(
    "/orders",
    auth(UserRole.ADMIN),
    validate({ query: getAdminOrdersQuerySchema }),
    adminController.getAllOrders
);

export const adminRouter = router;
