import { Prisma } from "@prisma/client";
import { CreateOrderRequest, OrderFilters } from "../types/index.js";
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

export const createOrder = async (userId: string, payload: CreateOrderRequest) => {
  const productGroups = payload.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
    return acc;
  }, {});

  const productIds = Object.keys(productGroups);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      active: true,
    },
    select: {
      id: true,
      price: true,
      stock: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("Algum produto não foi encontrado ou está indisponível");
  }

  const orderItems = productIds.map((productId) => {
    const quantity = productGroups[productId];
    const product = products.find((productItem) => productItem.id === productId);

    if (!product) {
      throw new Error("Algum produto não foi encontrado ou está indisponível");
    }

    if (product.stock < quantity) {
      throw new Error(`Estoque insuficiente para o produto ${product.id}`);
    }

    const unitPrice = Number(product.price);
    return {
      productId,
      quantity,
      unitPrice,
    };
  });

  const totalPrice = orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const order = await prisma.$transaction(async (tx) => {
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalPrice,
        ...(payload.shippingAddress && { shippingAddress: JSON.stringify(payload.shippingAddress) }),
        ...(payload.paymentMethod && { paymentMethod: payload.paymentMethod }),
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
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
    });

    return createdOrder;
  });

  return order;
};

export const updateOrder = async (
  orderId: string,
  userId: string,
  userRole: string,
  payload: Partial<CreateOrderRequest> & { status?: string },
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order || !order.active) {
    throw new Error("Pedido não encontrado");
  }

  if (order.userId !== userId && userRole !== "ADMIN") {
    throw new Error("Você não tem permissão para atualizar este pedido");
  }

  if (payload.status && userRole !== "ADMIN") {
    throw new Error("Apenas administradores podem atualizar o status do pedido");
  }

  const updateData: Prisma.OrderUpdateInput = {};

  if (payload.status) {
    updateData.status = payload.status as any;
  }

  if (payload.shippingAddress !== undefined) {
    if (payload.shippingAddress) {
      updateData.shippingAddress = JSON.stringify(payload.shippingAddress);
    }
  }

  if (payload.paymentMethod !== undefined) {
    if (payload.paymentMethod) {
      updateData.paymentMethod = payload.paymentMethod;
    }
  }

  if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
    const productIds = payload.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        active: true,
      },
      select: {
        id: true,
        price: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new Error("Algum produto não foi encontrado ou está indisponível");
    }

    const currentItems = order.items;
    const stockAdjustments: Record<string, number> = {};

    for (const currentItem of currentItems) {
      const newItem = payload.items.find((item) => item.productId === currentItem.productId);
      if (newItem) {
        const diff = newItem.quantity - currentItem.quantity;
        if (diff !== 0) {
          stockAdjustments[currentItem.productId] = diff;
        }
      } else {
        stockAdjustments[currentItem.productId] = -currentItem.quantity;
      }
    }

    for (const newItem of payload.items) {
      if (!currentItems.some((item) => item.productId === newItem.productId)) {
        stockAdjustments[newItem.productId] = newItem.quantity;
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      for (const [productId, adjustment] of Object.entries(stockAdjustments)) {
        const product = products.find((p) => p.id === productId);
        if (product && product.stock + adjustment < 0) {
          throw new Error(`Estoque insuficiente para o produto ${productId}`);
        }

        await tx.product.update({
          where: { id: productId },
          data: {
            stock: { increment: adjustment },
          },
        });
      }

      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      const orderItemsToCreate = payload.items!.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const unitPrice = product ? Number(product.price) : 0;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
        };
      });

      const totalPrice = orderItemsToCreate.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      updateData.items = {
        create: orderItemsToCreate,
      };
      updateData.totalPrice = totalPrice;

      const updated = await tx.order.update({
        where: { id: orderId },
        data: updateData,
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
      });

      return updated;
    });

    return updatedOrder;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
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
  });

  return updated;
};

export const deleteOrder = async (orderId: string, userId: string, userRole: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order || !order.active) {
    throw new Error("Pedido não encontrado");
  }

  if (order.userId !== userId && userRole !== "ADMIN") {
    throw new Error("Você não tem permissão para deletar este pedido");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { active: false },
  });
};
