import { FastifyInstance } from "fastify";

import {
  createOrderController,
  getOrder,
  listOrders,
  updateOrderController,
} from "../controllers/orders.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", authenticate);

  fastify.post("/", createOrderRouteSchema, createOrderController);
  fastify.get("/", orderListRouteSchema, listOrders);
  fastify.patch("/:id", updateOrderRouteSchema, updateOrderController);
  fastify.get("/:id", orderRouteSchema, getOrder);
}

const createOrderRouteSchema = {
  schema: {
    tags: ["Orders"],
    description: "Cria um novo pedido para o usuário autenticado",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      required: ["items"],
      properties: {
        items: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            required: ["productId", "quantity"],
            properties: {
              productId: { type: "string", description: "ID do produto em formato UUID" },
              quantity: { type: "number", minimum: 1, description: "Quantidade do produto" },
            },
          },
        },
        shippingAddress: {
          type: "object",
          description: "Endereço de entrega (opcional)",
          properties: {
            street: { type: "string", description: "Rua" },
            number: { type: "string", description: "Número (opcional)" },
            complement: { type: "string", description: "Complemento (opcional)" },
            city: { type: "string", description: "Cidade" },
            state: { type: "string", description: "Estado/UF" },
            zipCode: { type: "string", description: "CEP" },
            country: { type: "string", description: "País" },
          },
        },
        paymentMethod: {
          type: "string",
          description: "Método de pagamento (ex: CREDIT_CARD, DEBIT_CARD, PIX, etc) (opcional)",
        },
      },
    },
    response: {
      201: {
        description: "Pedido criado com sucesso",
        type: "object",
        additionalProperties: true,
      },
      400: {
        description: "Requisição inválida ou dados de pedido incorretos",
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

const updateOrderRouteSchema = {
  schema: {
    tags: ["Orders"],
    description: "Atualiza um pedido existente (Requer Autenticação)",
    security: [{ bearerAuth: [] }],
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "ID do pedido em formato UUID" },
      },
    },
    body: {
      type: "object",
      properties: {
        items: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            required: ["productId", "quantity"],
            properties: {
              productId: { type: "string", description: "ID do produto em formato UUID" },
              quantity: { type: "number", minimum: 1, description: "Quantidade do produto" },
            },
          },
        },
        shippingAddress: {
          type: "object",
          description: "Endereço de entrega (opcional)",
          properties: {
            street: { type: "string", description: "Rua" },
            number: { type: "string", description: "Número (opcional)" },
            complement: { type: "string", description: "Complemento (opcional)" },
            city: { type: "string", description: "Cidade" },
            state: { type: "string", description: "Estado/UF" },
            zipCode: { type: "string", description: "CEP" },
            country: { type: "string", description: "País" },
          },
        },
        paymentMethod: {
          type: "string",
          description: "Método de pagamento (ex: CREDIT_CARD, DEBIT_CARD, PIX, etc) (opcional)",
        },
        status: {
          type: "string",
          enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
          description: "Status do pedido (apenas ADMIN pode atualizar)",
        },
      },
    },
    response: {
      200: {
        description: "Pedido atualizado com sucesso",
        type: "object",
        additionalProperties: true,
      },
      400: {
        description: "Requisição inválida ou dados incorretos",
        type: "object",
        properties: { message: { type: "string" } },
      },
      401: {
        description: "Token ausente ou inválido",
        type: "object",
        properties: { message: { type: "string" } },
      },
      403: {
        description: "Sem permissão para atualizar este pedido",
        type: "object",
        properties: { message: { type: "string" } },
      },
    },
  },
};
