import { FastifyReply, FastifyRequest } from "fastify";
import { getOrders, getOrderById } from "../services/orders.service.js";
import { OrderFilters } from "../types/index.js";
import { orderListSchema, orderParamSchema } from "../utils/validators.js";

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
