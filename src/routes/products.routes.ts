import { FastifyInstance } from "fastify";
import { listProducts } from "../controllers/product.controller.js";

export default async function productRoutes(Fastfy: FastifyInstance) {
  Fastfy.get("/", listProducts);
}
