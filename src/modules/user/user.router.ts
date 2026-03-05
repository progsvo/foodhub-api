import express from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import validate from "../../middleware/validate";
import { updateProfileSchema } from "./user.validation";

const router = express.Router();

router.get("/profile", auth(), userController.getProfile);
router.patch("/profile", auth(), validate({ body: updateProfileSchema }), userController.updateProfile);

export const userRouter = router;
