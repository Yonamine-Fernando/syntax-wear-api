import { FastifyInstance } from "fastify";
import { listProducts } from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", authenticate);
  fastify.get("/", productListRouteSchema, listProducts);
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
  },
};
