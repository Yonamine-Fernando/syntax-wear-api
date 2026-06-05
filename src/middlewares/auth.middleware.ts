import { FastifyReply, FastifyRequest } from "fastify";

export const authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: "Token inválido ou expirado" });
    return;
  }
};

export const authorizeAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const user = request.user as { role?: string } | undefined;
  if (!user || user.role !== "ADMIN") {
    reply.status(403).send({ message: "Acesso negado: permissão insuficiente" });
    return;
  }
};
