import process from "node:process";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const products = [
    {
      name: "Camiseta Básica",
      description: "Camiseta 100% algodão, confortável para o dia a dia.",
      price: "39.90",
      stock: 50,
      size: ["S", "M", "L"],
      color: "Branco",
      image_url: "https://example.com/images/camiseta-basica.jpg",
    },
    {
      name: "Calça Jeans Slim",
      description: "Modelagem slim, tecido com elastano.",
      price: "149.90",
      stock: 30,
      size: ["M", "L", "XL"],
      color: "Azul",
      image_url: "https://example.com/images/calca-jeans-slim.jpg",
    },
    {
      name: "Moletom Oversized",
      description: "Moletom quentinho com capuz.",
      price: "199.90",
      stock: 20,
      size: ["M", "L"],
      color: "Cinza",
      image_url: "https://example.com/images/moletom-oversized.jpg",
    },
    {
      name: "Tênis Casual",
      description: "Tênis para uso urbano com sola macia.",
      price: "249.90",
      stock: 15,
      size: ["40", "41", "42"],
      color: "Preto",
      image_url: "https://example.com/images/tenis-casual.jpg",
    },
    {
      name: "Jaqueta Corta-vento",
      description: "Leve e resistente à água.",
      price: "179.90",
      stock: 12,
      size: ["S", "M", "L", "XL"],
      color: "Verde",
      image_url: "https://example.com/images/jaqueta-corta-vento.jpg",
    },
    {
      name: "Regata Fitness",
      description: "Tecido dry-fit, ideal para treinos.",
      price: "29.90",
      stock: 80,
      size: ["S", "M", "L"],
      color: "Preto",
      image_url: "https://example.com/images/regata-fitness.jpg",
    },
    {
      name: "Shorts Esportivo",
      description: "Shorts leve com forro interno.",
      price: "59.90",
      stock: 45,
      size: ["M", "L"],
      color: "Azul-Marinho",
      image_url: "https://example.com/images/shorts-esportivo.jpg",
    },
    {
      name: "Boné Trucker",
      description: "Boné com mesh traseiro e aba curva.",
      price: "49.90",
      stock: 60,
      size: ["Único"],
      color: "Bege",
      image_url: "https://example.com/images/bone-trucker.jpg",
    },
    {
      name: "Meia Esportiva (3 pares)",
      description: "Pacote com 3 pares, amortecimento no calcanhar.",
      price: "24.90",
      stock: 120,
      size: ["M", "L"],
      color: "Branco",
      image_url: "https://example.com/images/meia-esportiva.jpg",
    },
    {
      name: "Cinto de Couro",
      description: "Cinto de couro legítimo com fivela metálica.",
      price: "89.90",
      stock: 25,
      size: ["M", "L", "XL"],
      color: "Marrom",
      image_url: "https://example.com/images/cinto-couro.jpg",
    },
  ];

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });

  console.log(`Inserted ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
