import { FastifyReply, FastifyRequest } from "fastify";
import { getCategories, getCategoryById } from "../services/categories.service.js";
import { CategoryFilters } from "../types/index.js";
import { categoryListSchema } from "../utils/validators.js";

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
