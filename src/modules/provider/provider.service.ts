import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

interface ICreateProviderProfile {
    businessName: string;
    description?: string;
    image?: string | null;
    address?: string;
}

interface IUpdateProviderProfile {
    businessName?: string;
    description?: string;
    image?: string | null;
    address?: string;
}

interface IGetAllProvidersQuery {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
}

const userSafeSelect = {
    id: true,
    name: true,
    email: true,
    image: true,
};

const createProviderProfile = async (userId: string, data: ICreateProviderProfile) => {
    const existing = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (existing) {
        throw Object.assign(new Error("Provider profile already exists"), { statusCode: 400 });
    }

    const profile = await prisma.providerProfile.create({
        data: {
            ...data,
            userId,
        },
        include: {
            user: { select: userSafeSelect },
        },
    });

    return profile;
};

const updateProviderProfile = async (userId: string, data: IUpdateProviderProfile) => {
    const existing = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (!existing) {
        throw Object.assign(new Error("Provider profile not found"), { statusCode: 404 });
    }

    const profile = await prisma.providerProfile.update({
        where: { userId },
        data,
        include: {
            user: { select: userSafeSelect },
        },
    });

    return profile;
};

const getAllProviders = async (query: IGetAllProvidersQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    const where = query.search
        ? { businessName: { contains: query.search, mode: "insensitive" as const } }
        : {};

    const [data, total] = await Promise.all([
        prisma.providerProfile.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                user: { select: userSafeSelect },
            },
        }),
        prisma.providerProfile.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total },
    };
};

const getProviderById = async (id: string) => {
    const provider = await prisma.providerProfile.findUnique({
        where: { id },
        include: {
            user: { select: userSafeSelect },
            meals: {
                where: { isAvailable: true },
                include: { category: true },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!provider) {
        throw Object.assign(new Error("Provider not found"), { statusCode: 404 });
    }

    return provider;
};

export const providerService = {
    createProviderProfile,
    updateProviderProfile,
    getAllProviders,
    getProviderById,
};
