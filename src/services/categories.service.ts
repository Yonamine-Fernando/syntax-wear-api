import { Prisma } from "@prisma/client";
import { CategoryFilters } from "../types/index.js";
import { prisma } from "../utils/prisma.js";

export const getCategories = async (filters: CategoryFilters = {}) => {
  const { page = 1, limit = 10, search } = filters;

  const where: Prisma.CategoryWhereInput = {
    active: true,
  };

  if (search && search.trim()) {
    where.name = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  const numPage = Number(page);
  const numLimit = Number(limit);
  const skip = (numPage - 1) * numLimit;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: numLimit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.category.count({ where }),
  ]);

  return {
    data: categories,
    total,
    page: numPage,
    limit: numLimit,
    totalPages: Math.ceil(total / numLimit),
  };
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category || !category.active) {
    throw new Error("Categoria não encontrada");
  }

  return category;
};
