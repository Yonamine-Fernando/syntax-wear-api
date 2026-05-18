import fastify, { FastifyInstance } from "fastify";
import { createNewProduct, getProduct, listProducts } from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export default async function productRoutes(fastify: FastifyInstance) {
  // fastify.addHook("onRequest", authenticate);
  fastify.get("/", productListRouteSchema, listProducts);
  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["Products"],
        description: "Obter um produto pelo ID",
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Produto encontrado",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              size: { type: "string" },
              color: { type: "string" },
              imageUrl: { type: "string" },
              price: { type: "number" },
              createAt: { type: "string", format: "date-time" },
              stock: { type: "number" },
              description: { type: "string" },
            },
          },
          400: {
            description: "Requisição invalida",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          401: {
            description: "Não autorizado",
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    getProduct,
  );
  fastify.post(
    "/",
    {
      schema: {
        tags: ["products"],
        description: "criar produto",
        required: ["name", "description", "price", "stock"],
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "number" },
            color: { type: "string" },
            image: { type: "string" },
            active: { type: "boolean" },
            size: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
    createNewProduct,
  );
}

const productListRouteSchema = {
  schema: {
    tags: ["Products"],
    description: "Listar produtos com filtros e paginação",
    querystring: {
      type: "object",
      additionalProperties: true,
      properties: {
        page: { type: "string", description: "Página de resultados" },
        limit: { type: "string", description: "Quantidade de itens por página" },
        minPrice: { type: "string", description: "Preço mínimo" },
        maxPrice: { type: "string", description: "Preço máximo" },
        sizes: {
          oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
          description: "Tamanhos para filtro",
        },
        colors: {
          oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
          description: "Cores para filtro",
        },
        search: { type: "string", description: "Texto para busca" },
        minCreatedAt: { type: "string", format: "date", description: "Data inicial de criação (YYYY-MM-DD)" },
        maxCreatedAt: { type: "string", format: "date", description: "Data final de criação (YYYY-MM-DD)" },
        sortBy: {
          type: "string",
          description: "Ordenar por",
          enum: ["price", "name", "created_at", "stock"],
        },
        sortOrder: {
          type: "string",
          description: "Ordem de ordenação",
          enum: ["asc", "desc"],
        },
      },
    },
    response: {
      200: {
        description: "Lista de produtos retornada com paginação",
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                size: { type: "string" },
                color: { type: "string" },
                imageUrl: { type: "string" },
                price: { type: "number" },
                createdAt: { type: "string", format: "date-time" },
                stock: { type: "number" },
                description: { type: "string" },
              },
            },
          },
          total: { type: "number" },
          page: { type: "number" },
          limit: { type: "number" },
          totalPages: { type: "number" },
        },
      },
      400: {
        description: "Requisição inválida",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      401: {
        description: "Não autorizado",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
