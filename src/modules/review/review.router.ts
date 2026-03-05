import express from "express";
import { reviewController } from "./review.controller";
import auth, { UserRole } from "../../middleware/auth";
import validate from "../../middleware/validate";
import { createReviewSchema, getReviewsQuerySchema, reviewMealParamsSchema } from "./review.validation";

const router = express.Router();

router.post("/", auth(UserRole.CUSTOMER), validate({ body: createReviewSchema }), reviewController.createReview);
router.get("/meal/:mealId", validate({ params: reviewMealParamsSchema, query: getReviewsQuerySchema }), reviewController.getMealReviews);

export const reviewRouter = router;
