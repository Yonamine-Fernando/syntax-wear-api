import { FastifyInstance } from "fastify";
import { getCategory, listCategories } from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

export default async function categoryRoutes(fastify: FastifyInstance) {
  //fastify.addHook("onRequest", authenticate);
  fastify.get("/", categoryListRouteSchema, listCategories);
  fastify.get("/:id", categoryRouteSchema, getCategory);
}

const categoryListRouteSchema = {
  schema: {
    tags: ["Categories"],
    description: "Listar categorias",
    querystring: {
      type: "object",
      properties: {
        page: { type: "string", description: "Página de resultados" },
        limit: { type: "string", description: "Quantidade de itens por página" },
        search: { type: "string", description: "Texto de busca" },
      },
    },
    response: {
      200: {
        description: "Lista de categorias retornada",
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                slug: { type: "string" },
                description: { type: "string" },
                active: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
          total: { type: "number" },
          page: { type: "number" },
          limit: { type: "number" },
          totalPages: { type: "number" },
        },
      },
    },
  },
};

const categoryRouteSchema = {
  schema: {
    tags: ["Categories"],
    description: "Obter categoria pelo ID",
    params: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    },
    response: {
      200: {
        description: "Categoria encontrada",
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          active: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      400: {
        description: "Requisição inválida",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
