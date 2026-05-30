import { FastifyInstance } from "fastify";

import { authenticate } from "../middlewares/auth.middleware.js";
import { getOrder, listOrders } from "../controllers/orders.controller.js";

export default async function orderRoutes(fastify: FastifyInstance) {
  // Protege todas as rotas de pedidos com JWT
  //fastify.addHook("onRequest", authenticate);

  fastify.get("/", orderListRouteSchema, listOrders);
  fastify.get("/:id", orderRouteSchema, getOrder);
}

const orderListRouteSchema = {
  schema: {
    tags: ["Orders"],
    description: "Listar pedidos com filtros (Requer Autenticação)",
    security: [{ bearerAuth: [] }],
    querystring: {
      type: "object",
      properties: {
        page: { type: "string", description: "Página de resultados (Padrão: 1)" },
        limit: { type: "string", description: "Quantidade de itens (Padrão: 10)" },
        status: {
          type: "string",
          enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
          description: "Status do pedido",
        },
        userId: { type: "string", description: "Filtrar por ID do cliente (UUID)" },
        startDate: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
        endDate: { type: "string", description: "Data final (YYYY-MM-DD)" },
      },
    },
    response: {
      200: {
        description: "Lista de pedidos retornada com sucesso",
        type: "object",
        properties: {
          data: { type: "array", items: { type: "object", additionalProperties: true } },
          total: { type: "number" },
          page: { type: "number" },
          limit: { type: "number" },
          totalPages: { type: "number" },
        },
      },
      401: {
        description: "Token ausente ou inválido",
        type: "object",
        properties: { message: { type: "string" } },
      },
    },
  },
};

const orderRouteSchema = {
  schema: {
    tags: ["Orders"],
    description: "Obter detalhes completos de um pedido (Requer Autenticação)",
    security: [{ bearerAuth: [] }],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "ID do pedido em formato UUID" },
      },
    },
    response: {
      200: {
        description: "Pedido encontrado",
        type: "object",
        additionalProperties: true,
      },
      400: {
        description: "Requisição inválida ou Pedido não encontrado",
        type: "object",
        properties: { message: { type: "string" } },
      },
      401: {
        description: "Token ausente ou inválido",
        type: "object",
        properties: { message: { type: "string" } },
      },
    },
  },
};
