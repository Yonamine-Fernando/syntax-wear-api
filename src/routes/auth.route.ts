import { FastifyInstance } from "fastify/types/instance.js";
import { login, register } from "../controllers/auth.controller.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      schema: {
        tags: ["Auth"],
        description: "Registra um novo usuário e retorna um token JWT",
        body: {
          type: "object",
          required: ["firstName", "lastName", "email", "password", "cpf", "birthDate", "phone"],
          properties: {
            firstName: { type: "string", description: "João" },
            lastName: { type: "string", description: "Silva" },
            email: { type: "string", description: "Email do usuário" },
            password: { type: "string", description: "Senha do usuário" },
            cpf: { type: "string", description: "CPF do usuário" },
            birthDate: { type: "string", description: "Data de nascimento do usuário (YYYY-MM-DD)" },
            phone: { type: "string", description: "Telefone do usuário" },
          },
        },
      },
    },
    register,
  );

  fastify.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        description: "Faz login de um usuário e retorna um token JWT",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", description: "Email do usuário" },
            password: { type: "string", description: "Senha do usuário" },
          },
        },
      },
    },
    login,
  );
}
