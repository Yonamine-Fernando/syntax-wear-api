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
import productRoutes from "./routes/products.routes.js";

const PORT = parseInt(process.env.PORT ?? "3000");

const fastify = Fastify({
  logger: true,
});
fastify.register(jwt, {
  secret: process.env.JWT_SECRET!,
});

fastify.register(cors, {
  origin: true,
  credentials: true,
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
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "servidor de desenvolvimento",
      },
    ],
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

// Declare a route
fastify.get("/", async (request, reply) => {
  return {
    message: "E-commerce Syntaxe Wear API",
    version: "1.0.0",
    status: "running",
  };
});

fastify.register(scalar, {
  routePrefix: "/api-docs",
  configuration: {
    theme: "kepler",
  },
});

fastify.get("/healt", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timeStamp: new Date().toISOString(),
  };
});

fastify.setErrorHandler(errorHandler);

// Run the server!
fastify.listen({ port: PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

export default fastify;
