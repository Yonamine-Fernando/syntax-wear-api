import { Prisma } from "@prisma/client";
import { CreateProduct, ProductFilters } from "../types/index.js";
import { prisma } from "../utils/prisma.js";

export const getProducts = async (filters: ProductFilters) => {
  const {
    page = 1,
    limit = 10,
    minPrice,
    maxPrice,
    sizes,
    colors,
    search,
    minCreatedAt,
    maxCreatedAt,
    categoryId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  // Tipagem forte (Sem 'any'!)
  const where: Prisma.ProductWhereInput = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Filtros de Preço
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = Number(minPrice);
    if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
  }

  // Filtros de Tamanho
  if (sizes && sizes.length > 0) {
    const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
    where.size = { hasSome: sizeArray };
  }

  // Filtros de Cor
  if (colors && colors.length > 0) {
    const colorArray = Array.isArray(colors) ? colors : [colors];
    where.color = { in: colorArray };
  }

  // Filtros de Data
  if (minCreatedAt || maxCreatedAt) {
    where.createdAt = {};
    if (minCreatedAt) where.createdAt.gte = new Date(minCreatedAt);
    if (maxCreatedAt) where.createdAt.lte = new Date(maxCreatedAt);
  }

  // Motor de Busca (Com a proteção .trim() do curso)
  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Paginação
  const numPage = Number(page);
  const numLimit = Number(limit);
  const skip = (numPage - 1) * numLimit;
  const take = numLimit;

  // Ordenação Segura
  const orderBy: Prisma.ProductOrderByWithRelationInput = {};
  if (sortBy) {
    orderBy[sortBy] = sortOrder || "asc";
  }

  try {
    // A sacada de mestre do curso: Promise.all para performance
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }), // Conta o total que bate com o filtro
    ]);

    // Retorna os dados + Metadados para o Front-end
    return {
      data: products,
      total,
      page: numPage,
      limit: numLimit,
      totalPages: Math.ceil(total / numLimit),
    };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new Error("Produto não encontrado");
  }
  return product;
};

export const createProduct = async (data: CreateProduct) => {
  const existingProduct = await prisma.product.findUnique({
    where: { slug: data.slug },
  });

  if (existingProduct) {
    throw new Error("Slug já existe, Escolha outro nome para o produto");
  }
  const newProduct = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      active: data.active,
      slug: data.slug,
      color: data.colors,
      size: data.sizes,
      images: data.images,
      categoryId: data.categoryId, // O Prisma aceita o ID direto se estiver no schema
    },
  });
  return newProduct;
};
export const updateProduct = async (id: string, data: Partial<CreateProduct>) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });
  if (!existingProduct) {
    throw new Error("Produto não encontrado");
  }

  if (data.slug) {
    const slugExists = await prisma.product.findUnique({
      where: { slug: data.slug },
    });
    if (slugExists && slugExists.id !== id) {
      throw new Error("Slug já existe, Escolha outro nome para o produto");
    }
  }
  const updatedProduct = await prisma.product.update({
    where: { id },
    data,
  });
  return updatedProduct;
};
export const deleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new Error("Produto não encontrado");
  }

  await prisma.product.update({
    where: { id },
    data: { active: false },
  });
};
