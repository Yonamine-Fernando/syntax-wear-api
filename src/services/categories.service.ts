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

  const numPage = Math.max(Number(page), 1);
  const numLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
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

export const createCategory = async (data: Prisma.CategoryCreateInput) => {
  const slugExists = await prisma.category.findUnique({
    where: { slug: data.slug },
  });

  if (slugExists) {
    throw new Error("Slug já existe, Escolha outro nome para a categoria");
  }

  const category = await prisma.category.create({
    data,
  });

  return category;
};

export const updateCategory = async (id: string, data: Prisma.CategoryUpdateInput) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error("Categoria não encontrada");
  }

  if (data.slug) {
    const slugExists = await prisma.category.findUnique({
      where: { slug: data.slug as string },
    });

    if (slugExists && slugExists.id !== id) {
      throw new Error("Slug já existe, Escolha outro nome para a categoria");
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data,
  });

  return updatedCategory;
};

export const deleteCategory = async (id: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error("Categoria não encontrada");
  }

  // Soft Delete: Atualiza o status em vez de excluir a linha
  const deletedCategory = await prisma.category.update({
    where: { id },
    data: { active: false },
  });

  return deletedCategory;
};
