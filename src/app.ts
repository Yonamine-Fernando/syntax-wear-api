// ESM
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import "dotenv/config";
import Fastify from "fastify";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.route.js";
import categoryRoutes from "./routes/categories.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import productRoutes from "./routes/products.routes.js";

export const buildApp = async () => {
  const fastify = Fastify({
    logger: true,
  });

  const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:3000"];
  const allowCredentials = process.env.CORS_ALLOW_CREDENTIALS === "true";

  fastify.register(jwt, {
    secret: process.env.JWT_SECRET!,
    sign: { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  });

  fastify.register(cors, {
    origin: corsOrigins,
    credentials: allowCredentials,
  });

  fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  fastify.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Syntax Wear API",
        description: "API for e-commerce Syntax Wear",
        version: "1.0.0",
      },
      servers: [],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Autenticação via Token JWT",
          },
        },
      },
    },
  });

  fastify.register(productRoutes, { prefix: "/products" });
  fastify.register(categoryRoutes, { prefix: "/categories" });
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(orderRoutes, { prefix: "/orders" });

  fastify.get("/", async () => ({
    message: "E-commerce Syntaxe Wear API",
    version: "1.0.0",
    status: "running",
  }));

  fastify.register(scalar, {
    routePrefix: "/api-docs",
    configuration: {
      theme: "kepler",
    },
  });

  fastify.get("/healt", async () => ({
    status: "ok",
    uptime: process.uptime(),
    timeStamp: new Date().toISOString(),
  }));

  fastify.setErrorHandler(errorHandler);

  await fastify.ready();

  return fastify;
};
