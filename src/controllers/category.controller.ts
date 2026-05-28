import { FastifyReply, FastifyRequest } from "fastify";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../services/categories.service.js";
import { CategoryFilters } from "../types/index.js";
import { categoryListSchema, CreateCategory, createCategorySchema } from "../utils/validators.js";
import slugify from "slugify";

export const listCategories = async (
  request: FastifyRequest<{ Querystring: CategoryFilters }>,
  reply: FastifyReply,
) => {
  const filters = categoryListSchema.parse(request.query);
  const result = await getCategories(filters);

  reply.status(200).send(result);
};

export const getCategory = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const category = await getCategoryById(request.params.id);
  reply.status(200).send(category);
};

export const createNewCategory = async (request: FastifyRequest<{ Body: CreateCategory }>, reply: FastifyReply) => {
  const body = request.body;

  body.slug = slugify(body.name, {
    lower: true,
    strict: true,
    locale: "pt",
  });

  const validate = createCategorySchema.parse(body);

  await createCategory(validate);

  reply.status(200).send({ message: "Categoria criada com sucesso" });
};

export const updateExistingCategory = async (
  request: FastifyRequest<{ Params: { id: string }; Body: Partial<CreateCategory> }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  // 1. Clonamos o body recebido para podermos manipulá-lo com segurança
  const bodyData = { ...request.body };

  // 2. Regra de Negócio: Se o usuário enviou um novo nome, geramos o slug AGORA!
  if (bodyData.name) {
    bodyData.slug = slugify(bodyData.name, {
      lower: true,
      strict: true,
      locale: "pt",
    });
  }

  const validate = createCategorySchema.partial().parse(bodyData);

  // 4. Chamamos o Service
  const category = await updateCategory(id, validate);

  reply.status(200).send(category);
};

export const deleteExistingCategory = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  await deleteCategory(id);

  reply.status(200).send({ message: "Categoria removida com sucesso" });
};
