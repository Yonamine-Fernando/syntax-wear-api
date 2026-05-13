import { FastifyInstance } from "fastify/types/instance.js";
import { register } from "../controllers/auth.controller.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      schema: {
        tags: ["Auth"],
        description: "Registra um novo usuário e retorna um token JWT",
        body: {
          type: "object",
          required: ["firstName", "lastName", "email", "password", "cpf", "birthdate", "phone"],
          properties: {
            firstName: { type: "string", description: "João" },
            lastName: { type: "string", description: "Silva" },
            email: { type: "string", format: "email", description: "Email do usuário" },
            password: { type: "string", minLength: 6, description: "Senha do usuário" },
            cpf: { type: "string", description: "CPF do usuário" },
            birthdate: { type: "string", format: "date", description: "Data de nascimento do usuário (YYYY-MM-DD)" },
            phone: { type: "string", description: "Telefone do usuário" },
          },
        },
      },
    },
    register,
  );
}
