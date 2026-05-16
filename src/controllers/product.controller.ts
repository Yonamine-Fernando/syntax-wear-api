import { FastifyReply, FastifyRequest } from "fastify";
import { getProductById, getProducts } from "../services/products.service.js";
import { ProductFilters } from "../types/index.js";
import { productListSchema } from "../utils/validators.js";
import { request } from "node:http";

export const listProducts = async (request: FastifyRequest<{ Querystring: ProductFilters }>, reply: FastifyReply) => {
  const filters = productListSchema.parse(request.query);
  const result = await getProducts(filters as ProductFilters);
  reply.status(200).send(result);
};

export const getProduct = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const product = await getProductById(request.params.id);
  reply.status(200).send(product);
};
