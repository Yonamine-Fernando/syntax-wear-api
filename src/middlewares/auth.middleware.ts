import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../utils/prisma.js";

export const authenticate = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  try {
    const decoded = await request.jwtVerify<{ userId: string }>();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });
    if (!user) {
      reply.status(401).send({ message: "Usuario não encontrado" });
      return;
    }
    request.user = user;
  } catch (err) {
    reply.status(401).send({ message: "Token inválido ou experido" });
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
