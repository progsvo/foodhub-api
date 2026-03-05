import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

interface ICreateOrder {
    deliveryAddress: string;
}

interface IGetOrdersQuery {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
}

const orderInclude = {
    items: {
        include: {
            meal: { select: { id: true, image: true } },
        },
    },
    provider: {
        include: {
            user: { select: { id: true, name: true, image: true } },
        },
    },
};

const createOrder = async (userId: string, data: ICreateOrder) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    meal: {
                        include: { provider: true },
                    },
                },
            },
        },
    });

    if (!cart || cart.items.length === 0) {
        throw Object.assign(new Error("Cart is empty"), { statusCode: 400 });
    }

    const groupedByProvider = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
        const providerId = item.meal.providerId;
        if (!groupedByProvider.has(providerId)) {
            groupedByProvider.set(providerId, []);
        }
        groupedByProvider.get(providerId)!.push(item);
    }

    const orderDataByProvider = Array.from(groupedByProvider.entries()).map(
        ([providerId, items]) => ({
            providerId,
            totalAmount: Math.round(
                items.reduce((sum, item) => sum + item.meal.price * item.quantity, 0) * 100,
            ) / 100,
            orderItems: items.map((item) => ({
                mealId: item.mealId,
                mealName: item.meal.name,
                mealPrice: item.meal.price,
                quantity: item.quantity,
            })),
        }),
    );

    const orders = await prisma.$transaction(async (tx) => {
        const createdOrders = [];

        for (const orderData of orderDataByProvider) {
            const order = await tx.order.create({
                data: {
                    userId,
                    providerId: orderData.providerId,
                    deliveryAddress: data.deliveryAddress,
                    totalAmount: orderData.totalAmount,
                    items: { create: orderData.orderItems },
                },
                include: orderInclude,
            });

            createdOrders.push(order);
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return createdOrders;
    });

    return orders;
};

const getCustomerOrders = async (userId: string, query: IGetOrdersQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    const where: any = { userId };

    if (query.status) {
        where.status = query.status;
    }

    const [data, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
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

const getOrderById = async (userId: string, orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: orderInclude,
    });

    if (!order) {
        throw Object.assign(new Error("Order not found"), { statusCode: 404 });
    }

    if (order.userId !== userId) {
        throw Object.assign(new Error("You don't have permission to view this order"), { statusCode: 403 });
    }

    return order;
};

export const orderService = {
    createOrder,
    getCustomerOrders,
    getOrderById,
};
