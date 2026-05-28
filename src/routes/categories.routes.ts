import { FastifyInstance } from "fastify";
import {
  createNewCategory,
  deleteExistingCategory,
  getCategory,
  listCategories,
  updateExistingCategory,
} from "../controllers/category.controller.js";

export default async function categoryRoutes(fastify: FastifyInstance) {
  //fastify.addHook( authenticate);
  fastify.get("/", categoryListRouteSchema, listCategories);
  fastify.get("/:id", categoryRouteSchema, getCategory);
  fastify.post(
    "/",
    {
      schema: {
        tags: ["Categories"],
        description: "Criar uma nova categoria (Apenas ADMIN)",
        body: {
          type: "object",
          required: ["name", "active"],
          properties: {
            name: { type: "string", description: "Nome da categoria" },
            description: { type: "string", description: "Descrição da categoria" },
            active: { type: "boolean", description: "Status da categoria" }, // Agora no lugar certo
          },
        },
        response: {
          201: {
            description: "Categoria criada com sucesso",
            type: "object",
          },
          400: {
            description: "Erro de validação (Zod/Fastify) ou Regra de Negócio",
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    createNewCategory,
  );
  fastify.put("/:id", updateCategoryRouteSchema, updateExistingCategory);
  // Adicione esta linha junto com o seu POST e PUT
  fastify.delete("/:id", deleteCategoryRouteSchema, deleteExistingCategory);
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
const updateCategoryRouteSchema = {
  schema: {
    tags: ["Categories"],
    description: "Atualizar uma categoria existente (Apenas ADMIN)",

    params: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID da categoria em formato UUID" },
      },
      required: ["id"],
    },

    body: {
      type: "object",
      description: "Envie apenas os campos que deseja atualizar",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        active: { type: "boolean" },
        slug: { type: "string" },
      },
    },
    response: {
      200: {
        description: "Categoria atualizada com sucesso",
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
        description: "Erro de validação (Zod/Fastify) ou Regra de Negócio (Slug já existe)",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      401: {
        description: "Não autorizado (Token ausente ou inválido)",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
const deleteCategoryRouteSchema = {
  schema: {
    tags: ["Categories"],
    description: "Desativar uma categoria (Soft Delete - Apenas ADMIN)",
    // security: [{ bearerAuth: [] }], // Descomente quando ativar a autenticação global
    params: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID da categoria em formato UUID" },
      },
      required: ["id"],
    },
    response: {
      200: {
        description: "Categoria desativada com sucesso",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      400: {
        description: "Requisição inválida ou Categoria não encontrada",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      401: {
        description: "Não autorizado (Token ausente ou inválido)",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
