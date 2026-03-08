import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

interface ICreateMeal {
    name: string;
    description?: string;
    price: number;
    image?: string | null;
    cuisine?: string;
    dietaryPreference?: string;
    categoryId: string;
    isAvailable?: boolean;
}

interface IUpdateMeal {
    name?: string;
    description?: string;
    price?: number;
    image?: string | null;
    cuisine?: string;
    dietaryPreference?: string;
    categoryId?: string;
    isAvailable?: boolean;
}

interface IGetMealsQuery {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    cuisine?: string;
    dietaryPreference?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    categoryId?: string;
    providerId?: string;
}

const userSafeSelect = {
    id: true,
    name: true,
    image: true,
};

const getProviderProfile = async (userId: string) => {
    const profile = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (!profile) {
        throw Object.assign(new Error("Provider profile not found. Please create a provider profile first."), { statusCode: 404 });
    }

    return profile;
};

const verifyMealOwnership = async (mealId: string, providerId: string) => {
    const meal = await prisma.meal.findUnique({ where: { id: mealId } });

    if (!meal) {
        throw Object.assign(new Error("Meal not found"), { statusCode: 404 });
    }

    if (meal.providerId !== providerId) {
        throw Object.assign(new Error("You don't have permission to modify this meal"), { statusCode: 403 });
    }

    return meal;
};

const createMeal = async (userId: string, data: ICreateMeal) => {
    const profile = await getProviderProfile(userId);

    const meal = await prisma.meal.create({
        data: {
            ...data,
            providerId: profile.id,
        },
        include: {
            provider: { include: { user: { select: userSafeSelect } } },
            category: true,
        },
    });

    return meal;
};

const updateMeal = async (userId: string, mealId: string, data: IUpdateMeal) => {
    const profile = await getProviderProfile(userId);
    await verifyMealOwnership(mealId, profile.id);

    const meal = await prisma.meal.update({
        where: { id: mealId },
        data,
        include: {
            provider: { include: { user: { select: userSafeSelect } } },
            category: true,
        },
    });

    return meal;
};

const deleteMeal = async (userId: string, mealId: string) => {
    const profile = await getProviderProfile(userId);
    await verifyMealOwnership(mealId, profile.id);

    await prisma.meal.delete({ where: { id: mealId } });
};

const getAllMeals = async (query: IGetMealsQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    const where: any = {};
    // When providerId is set (provider viewing own meals), show all meals. Otherwise filter by isAvailable.
    if (!query.providerId) {
        where.isAvailable = true;
    }

    if (query.search) {
        where.name = { contains: query.search, mode: "insensitive" };
    }
    if (query.cuisine) {
        where.cuisine = { contains: query.cuisine, mode: "insensitive" };
    }
    if (query.dietaryPreference) {
        where.dietaryPreference = { contains: query.dietaryPreference, mode: "insensitive" };
    }
    if (query.minPrice || query.maxPrice) {
        where.price = {};
        if (query.minPrice) where.price.gte = Number(query.minPrice);
        if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }
    if (query.categoryId) {
        where.categoryId = query.categoryId;
    }
    if (query.providerId) {
        where.providerId = query.providerId;
    }

    const [data, total] = await Promise.all([
        prisma.meal.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                provider: { include: { user: { select: userSafeSelect } } },
                category: true,
            },
        }),
        prisma.meal.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total },
    };
};

const getMealById = async (id: string) => {
    const meal = await prisma.meal.findUnique({
        where: { id },
        include: {
            provider: { include: { user: { select: userSafeSelect } } },
            category: true,
            reviews: {
                include: { user: { select: { id: true, name: true, image: true } } },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!meal) {
        throw Object.assign(new Error("Meal not found"), { statusCode: 404 });
    }

    return meal;
};

export const mealService = {
    createMeal,
    updateMeal,
    deleteMeal,
    getAllMeals,
    getMealById,
};
