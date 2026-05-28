import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import z, { ZodError } from "zod";

export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof ZodError) {
    console.log("🚨 O ZOD BLOQUEOU A REQUISIÇÃO! MOTIVO:", error.format());
    return reply.status(400).send({
      message: "Erro de validação (Zod)",
      errors: z.treeifyError(error),
    });
  }

  if (error.code === "FST_ERR_VALIDATION") {
    console.log("🚨 O FASTIFY BLOQUEOU A REQUISIÇÃO! MOTIVO:", error.validation);
    return reply.status(400).send({
      message: "Error de validação (fastify)",
      erros: error.validation,
    });
  }
  console.error("🚨 ERRO INTERNO:", error);
  return reply.status(500).send({
    message: "Erro interno do servidor",
    debug: error.message,
  });
};
