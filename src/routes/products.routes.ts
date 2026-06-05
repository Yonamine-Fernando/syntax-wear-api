import { FastifyInstance } from "fastify";
import {
  createNewProduct,
  deleteExistingProduct,
  getProduct,
  listProducts,
  updateExistingProduct,
} from "../controllers/product.controller.js";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import { CreateProduct, ProductFilters } from "../types/index.js";

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: ProductFilters }>("/", productListRouteSchema, listProducts);
  fastify.get<{ Params: { id: string } }>(
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
              categoryId: { type: "string" },
              category: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
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
  fastify.post<{ Body: CreateProduct }>(
    "/",
    {
      schema: {
        tags: ["Products"],
        description: "criar produto",
        body: {
          type: "object",
          required: ["name", "description", "price", "stock", "categoryId"],
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
            categoryId: { type: "string" },
          },
        },
      },
    },
    createNewProduct,
  );

  fastify.put<{ Params: { id: string }; Body: Partial<CreateProduct> }>(
    "/:id",
    {
      schema: {
        tags: ["Products"],
        description: "atualizar produto",
        body: {
          type: "object",
          required: ["name", "description", "price", "stock"],
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
            categoryId: { type: "string" },
          },
        },
      },
      preHandler: [authenticate, authorizeAdmin],
    },
    updateExistingProduct,
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      schema: {
        tags: ["Products"],
        description: "deletar produto",
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
      preHandler: [authenticate, authorizeAdmin],
    },
    deleteExistingProduct,
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
                categoryId: { type: "string" },
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
