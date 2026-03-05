import { prisma } from "../../lib/prisma";

const cartItemInclude = {
    items: {
        include: {
            meal: {
                include: {
                    provider: {
                        include: {
                            user: { select: { id: true, name: true, image: true } },
                        },
                    },
                    category: true,
                },
            },
        },
        orderBy: { createdAt: "desc" as const },
    },
};

const getOrCreateCart = async (userId: string) => {
    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
    }

    return cart;
};

const formatCartResponse = (cart: any) => {
    const totalPrice = cart.items.reduce(
        (sum: number, item: any) => sum + item.meal.price * item.quantity,
        0,
    );

    return {
        ...cart,
        totalPrice: Math.round(totalPrice * 100) / 100,
    };
};

interface IAddToCart {
    mealId: string;
    quantity?: number;
}

const addToCart = async (userId: string, data: IAddToCart) => {
    const meal = await prisma.meal.findUnique({ where: { id: data.mealId } });

    if (!meal) {
        throw Object.assign(new Error("Meal not found"), { statusCode: 404 });
    }

    if (!meal.isAvailable) {
        throw Object.assign(new Error("Meal is not available"), { statusCode: 400 });
    }

    const cart = await getOrCreateCart(userId);
    const quantity = data.quantity || 1;

    await prisma.cartItem.upsert({
        where: { cartId_mealId: { cartId: cart.id, mealId: data.mealId } },
        update: { quantity },
        create: { cartId: cart.id, mealId: data.mealId, quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: cartItemInclude,
    });

    return formatCartResponse(updatedCart);
};

const getCart = async (userId: string) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: cartItemInclude,
    });

    if (!cart) {
        return { id: null, userId, items: [], totalPrice: 0 };
    }

    return formatCartResponse(cart);
};

const removeFromCart = async (userId: string, mealId: string) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
        throw Object.assign(new Error("Cart not found"), { statusCode: 404 });
    }

    const cartItem = await prisma.cartItem.findUnique({
        where: { cartId_mealId: { cartId: cart.id, mealId } },
    });

    if (!cartItem) {
        throw Object.assign(new Error("Meal not found in cart"), { statusCode: 404 });
    }

    await prisma.cartItem.delete({ where: { id: cartItem.id } });

    const updatedCart = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: cartItemInclude,
    });

    return formatCartResponse(updatedCart);
};

export const cartService = {
    addToCart,
    getCart,
    removeFromCart,
};
