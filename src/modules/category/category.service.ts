import { prisma } from "../../lib/prisma";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

interface ICreateCategory {
    name: string;
    image?: string | null;
}

interface IUpdateCategory {
    name?: string;
    image?: string | null;
}

interface IGetCategoriesQuery {
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
}

const createCategory = async (data: ICreateCategory) => {
    const category = await prisma.category.create({ data });
    return category;
};

const getAllCategories = async (query: IGetCategoriesQuery) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(query);

    const where = query.search
        ? { name: { contains: query.search, mode: "insensitive" as const } }
        : {};

    const [data, total] = await Promise.all([
        prisma.category.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
        }),
        prisma.category.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total },
    };
};

const updateCategory = async (id: string, data: IUpdateCategory) => {
    const existing = await prisma.category.findUnique({ where: { id } });

    if (!existing) {
        throw Object.assign(new Error("Category not found"), { statusCode: 404 });
    }

    const category = await prisma.category.update({
        where: { id },
        data,
    });

    return category;
};

const deleteCategory = async (id: string) => {
    const existing = await prisma.category.findUnique({ where: { id } });

    if (!existing) {
        throw Object.assign(new Error("Category not found"), { statusCode: 404 });
    }

    await prisma.category.delete({ where: { id } });
};

export const categoryService = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
};
