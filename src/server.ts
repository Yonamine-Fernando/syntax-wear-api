import { buildApp } from "./app.js";

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const HOST = process.env.HOST ?? "0.0.0.0";

const startServer = async () => {
  const app = await buildApp();

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    const localAddress = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`🚀 Server running at ${localAddress}`);
    console.log(`📚 API Docs at ${localAddress}/api-docs`);
    console.log(`🔗 Listening on ${address}`);

    return app;
  } catch (err) {
    // Prefer fastify logger when available
    if (app && typeof (app as any).log?.error === "function") {
      (app as any).log.error(err);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
};

// Start automatically unless running in tests
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default startServer;
export { HOST, PORT };
