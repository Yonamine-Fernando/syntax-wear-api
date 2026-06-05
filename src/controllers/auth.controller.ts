import { FastifyReply, FastifyRequest } from "fastify";
import { loginUser, registerUser } from "../services/auth.service.js";
import { AuthRequest, RegisterRequest } from "../types/index.js";
import { loginSchema, registerSchema } from "../utils/validators.js";

export const register = async (request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) => {
  const validation = registerSchema.parse(request.body as RegisterRequest);

  const user = await registerUser(validation);

  const token = request.server.jwt.sign({ userId: user.id, role: user.role });

  // Remover campos sensíveis antes de retornar ao cliente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { passwordHash, ...safeUser } = user as any;

  reply.status(201).send({ user: safeUser, token });
};

export const login = async (request: FastifyRequest<{ Body: AuthRequest }>, reply: FastifyReply) => {
  const validation = loginSchema.parse(request.body as AuthRequest);

  const user = await loginUser(validation);

  const token = request.server.jwt.sign({ userId: user.id, role: user.role });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { passwordHash, ...safeUser } = user as any;

  reply.status(200).send({
    user: safeUser,
    token,
  });
};
