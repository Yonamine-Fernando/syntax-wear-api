import process from "node:process";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// 1. Cria a conexão usando a URL do seu Pooler (porta 6543)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// 2. Conecta ao adaptador
const adapter = new PrismaPg(pool);

// 3. Exporta o prisma já configurado com a nova arquitetura
export const prisma = new PrismaClient({ adapter });
