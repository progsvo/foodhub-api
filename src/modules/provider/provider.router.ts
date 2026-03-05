import express from "express";
import { providerController } from "./provider.controller";
import auth, { UserRole } from "../../middleware/auth";
import validate from "../../middleware/validate";
import { createProfileSchema, updateProfileSchema, getProvidersQuerySchema } from "./provider.validation";

const router = express.Router();

router.post("/profile", auth(UserRole.PROVIDER), validate({ body: createProfileSchema }), providerController.createProfile);
router.patch("/profile", auth(UserRole.PROVIDER), validate({ body: updateProfileSchema }), providerController.updateProfile);
router.get("/", validate({ query: getProvidersQuerySchema }), providerController.getAllProviders);
router.get("/:id", providerController.getProviderById);

export const providerRouter = router;
