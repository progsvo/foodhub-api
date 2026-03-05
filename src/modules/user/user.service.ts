import { prisma } from "../../lib/prisma";

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

const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userSelect,
    });

    if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }

    return user;
};

interface IUpdateProfile {
    name?: string;
    phone?: string;
    image?: string | null;
}

const updateUserProfile = async (userId: string, data: IUpdateProfile) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: userSelect,
    });

    return user;
};

export const userService = {
    getUserProfile,
    updateUserProfile,
};
