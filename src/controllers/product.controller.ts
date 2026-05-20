import { FastifyReply, FastifyRequest } from "fastify";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../services/products.service.js";
import { CreateProduct, ProductFilters } from "../types/index.js";
import { createProductSchema, productListSchema } from "../utils/validators.js";
import slugify from "slugify";

export const listProducts = async (request: FastifyRequest<{ Querystring: ProductFilters }>, reply: FastifyReply) => {
  const filters = productListSchema.parse(request.query);
  const result = await getProducts(filters as ProductFilters);
  reply.status(200).send(result);
};

export const getProduct = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const product = await getProductById(request.params.id);
  reply.status(200).send(product);
};

export const createNewProduct = async (request: FastifyRequest<{ Body: CreateProduct }>, reply: FastifyReply) => {
  const body = request.body;

  body.slug = slugify(body.name, {
    lower: true,
    strict: true,
    locale: "pt",
  });

  const validate = createProductSchema.parse(body);

  await createProduct(validate);

  reply.status(200).send({ message: "Produto criado com sucesso" });
};

export const updateExistingProduct = async (
  request: FastifyRequest<{ Params: { id: string }; Body: Partial<CreateProduct> }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;
  const body = request.body;

  const validate = createProductSchema.partial().parse(body);

  if (validate.name) {
    validate.slug = slugify(validate.name, {
      lower: true,
      strict: true,
      locale: "pt",
    });
  }

  const product = await updateProduct(id, validate);
  reply.status(200).send(product);
};

export const deleteExistingProduct = async (request: FastifyRequest<{ Params: { id: string } }>) => {
  const { id } = request.params;

  await deleteProduct(id);
};
