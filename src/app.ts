// ESM
import Fastify from "fastify";
import "dotenv/config";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const PORT = parseInt(process.env.PORT ?? "3000");

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: true,
  credentials: true,
});

fastify.register(helmet, {
  contentSecurityPolicy: false,
});

// Declare a route
fastify.get("/", async (request, reply) => {
  return {
    message: "E-commerce Syntaxe Wear API",
    version: "1.0.0",
    status: "running",
  };
});

fastify.get("/healt", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timeStamp: new Date().toISOString(),
  };
});

// Run the server!
fastify.listen({ port: PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});

export default fastify;
