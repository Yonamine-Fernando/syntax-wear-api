import { Prisma } from "@prisma/client";
import { OrderFilters } from "../types/index.js";
import { prisma } from "../utils/prisma.js";

export const getOrders = async (filters: OrderFilters = {}) => {
  const { page = 1, limit = 10, status, userId, startDate, endDate } = filters;

  const where: Prisma.OrderWhereInput = {
    active: true, // Retorna apenas pedidos ativos (não excluídos)
  };

  if (status) {
    where.status = status;
  }

  if (userId) {
    where.userId = userId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  const numPage = Number(page);
  const numLimit = Number(limit);
  const skip = (numPage - 1) * numLimit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: numLimit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    total,
    page: numPage,
    limit: numLimit,
    totalPages: Math.ceil(total / numLimit),
  };
};

export const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, cpf: true, phone: true },
      },
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  if (!order || !order.active) {
    throw new Error("Pedido não encontrado");
  }

  return order;
};
