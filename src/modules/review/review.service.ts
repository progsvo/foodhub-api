import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

interface ICreateReview {
    mealId: string;
    rating: number;
    comment?: string;
}

interface IGetReviewsQuery {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
}

const createReview = async (userId: string, data: ICreateReview) => {
    const meal = await prisma.meal.findUnique({ where: { id: data.mealId } });

    if (!meal) {
        throw Object.assign(new Error("Meal not found"), { statusCode: 404 });
    }

    const deliveredOrder = await prisma.order.findFirst({
        where: {
            userId,
            status: "DELIVERED",
            items: { some: { mealId: data.mealId } },
        },
    });

    if (!deliveredOrder) {
        throw Object.assign(
            new Error("You can only review meals from delivered orders"),
            { statusCode: 400 },
        );
    }

    try {
        const review = await prisma.review.create({
            data: {
                userId,
                mealId: data.mealId,
                rating: data.rating,
                comment: data.comment ?? null,
            },
            include: {
                user: { select: { id: true, name: true, image: true } },
                meal: { select: { id: true, name: true, image: true } },
            },
        });

        return review;
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw Object.assign(
                new Error("You have already reviewed this meal"),
                { statusCode: 409 },
            );
        }
        throw error;
    }
};

const getMealReviews = async (mealId: string, query: IGetReviewsQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    const where = { mealId };

    const [data, total] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, image: true } },
            },
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.review.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total },
    };
};

export const reviewService = {
    createReview,
    getMealReviews,
};
