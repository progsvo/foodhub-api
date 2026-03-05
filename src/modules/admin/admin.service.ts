import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const userSelect = {
    id: true,
    name: true,
    email: true,
    image: true,
    phone: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    providerProfile: true,
};

interface IGetUsersQuery {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    role?: string;
    status?: string;
}

const getAllUsers = async (query: IGetUsersQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    const where: any = {};

    if (query.role) {
        where.role = query.role;
    }

    if (query.status) {
        where.status = query.status;
    }

    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
        ];
    }

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: userSelect,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.user.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total },
    };
};

const updateUserStatus = async (userId: string, status: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: userSelect,
    });

    return updatedUser;
};

interface IGetAdminOrdersQuery {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
}

const getAllOrders = async (query: IGetAdminOrdersQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    const where: any = {};

    if (query.status) {
        where.status = query.status;
    }

    const [data, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, image: true } },
                provider: {
                    include: {
                        user: { select: { id: true, name: true, image: true } },
                    },
                },
                _count: { select: { items: true } },
            },
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.order.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total },
    };
};

export const adminService = {
    getAllUsers,
    updateUserStatus,
    getAllOrders,
};
