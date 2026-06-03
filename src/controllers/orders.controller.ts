import { FastifyReply, FastifyRequest } from "fastify";
import { createOrder, deleteOrder, getOrderById, getOrders, updateOrder } from "../services/orders.service.js";
import { CreateOrderRequest, OrderFilters, UpdateOrderRequest } from "../types/index.js";
import { createOrderSchema, orderListSchema, orderParamSchema, updateOrderSchema } from "../utils/validators.js";

export const listOrders = async (request: FastifyRequest<{ Querystring: OrderFilters }>, reply: FastifyReply) => {
  const filters = orderListSchema.parse(request.query);
  const result = await getOrders(filters);

  reply.status(200).send(result);
};

export const getOrder = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const { id } = orderParamSchema.parse(request.params);
  const order = await getOrderById(id);

  reply.status(200).send(order);
};

export const createOrderController = async (
  request: FastifyRequest<{ Body: CreateOrderRequest }>,
  reply: FastifyReply,
) => {
  const payload = createOrderSchema.parse(request.body);
  const userId = (request.user as { userId: string }).userId;

  const order = await createOrder(userId, payload);

  reply.status(201).send(order);
};

export const updateOrderController = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateOrderRequest }>,
  reply: FastifyReply,
) => {
  const { id } = orderParamSchema.parse(request.params);
  const payload = updateOrderSchema.parse(request.body);
  const user = request.user as { userId: string; role?: string };
  const userId = user.userId;
  const userRole = user.role || "USER";

  const order = await updateOrder(id, userId, userRole, payload);

  reply.status(200).send(order);
};

export const deleteOrderController = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const { id } = orderParamSchema.parse(request.params);
  const user = request.user as { userId: string; role?: string };
  const userId = user.userId;
  const userRole = user.role || "USER";

  await deleteOrder(id, userId, userRole);

  reply.status(204).send();
};
