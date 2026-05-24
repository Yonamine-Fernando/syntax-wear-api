import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Limpando banco de dados para evitar duplicatas...");
  // DELETA PRIMEIRO OS PRODUTOS (FILHOS), DEPOIS AS CATEGORIAS (PAIS)
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("Criando categorias...");

  const catRoupas = await prisma.category.create({
    data: { name: "Roupas Casuais", slug: "roupas-casuais", description: "Moda para o dia a dia", active: true },
  });

  const catEsportes = await prisma.category.create({
    data: { name: "Esportes", slug: "esportes", description: "Roupas e acessórios para treino", active: true },
  });

  const catAcessorios = await prisma.category.create({
    data: { name: "Acessórios", slug: "acessorios", description: "Complementos para o seu estilo", active: true },
  });

  const catCalcados = await prisma.category.create({
    data: { name: "Calçados", slug: "calcados", description: "Tênis e sapatos", active: true },
  });

  console.log("Criando produtos...");

  const products = [
    {
      name: "Camiseta Básica",
      description: "Camiseta 100% algodão, confortável para o dia a dia.",
      price: "39.90",
      stock: 50,
      size: ["S", "M", "L"],
      color: "Branco",
      imageUrl: "https://example.com/images/camiseta-basica.jpg",
      slug: "camiseta-basica",
      active: true,
      categoryId: catRoupas.id, // VINCULADO!
    },
    {
      name: "Calça Jeans Slim",
      description: "Modelagem slim, tecido com elastano.",
      price: "149.90",
      stock: 30,
      size: ["M", "L", "XL"],
      color: "Azul",
      imageUrl: "https://example.com/images/calca-jeans-slim.jpg",
      slug: "calca-jeans-slim",
      active: true,
      categoryId: catRoupas.id,
    },
    {
      name: "Moletom Oversized",
      description: "Moletom quentinho com capuz.",
      price: "199.90",
      stock: 20,
      size: ["M", "L"],
      color: "Cinza",
      imageUrl: "https://example.com/images/moletom-oversized.jpg",
      slug: "moletom-oversized",
      active: true,
      categoryId: catRoupas.id,
    },
    {
      name: "Jaqueta Corta-vento",
      description: "Leve e resistente à água.",
      price: "179.90",
      stock: 12,
      size: ["S", "M", "L", "XL"],
      color: "Verde",
      imageUrl: "https://example.com/images/jaqueta-corta-vento.jpg",
      slug: "jaqueta-corta-vento",
      active: true,
      categoryId: catRoupas.id,
    },
    {
      name: "Regata Fitness",
      description: "Tecido dry-fit, ideal para treinos.",
      price: "29.90",
      stock: 80,
      size: ["S", "M", "L"],
      color: "Preto",
      imageUrl: "https://example.com/images/regata-fitness.jpg",
      slug: "regata-fitness",
      active: true,
      categoryId: catEsportes.id, // VINCULADO!
    },
    {
      name: "Shorts Esportivo",
      description: "Shorts leve com forro interno.",
      price: "59.90",
      stock: 45,
      size: ["M", "L"],
      color: "Azul-Marinho",
      imageUrl: "https://example.com/images/shorts-esportivo.jpg",
      slug: "shorts-esportivo",
      active: true,
      categoryId: catEsportes.id,
    },
    {
      name: "Meia Esportiva (3 pares)",
      description: "Pacote com 3 pares, amortecimento no calcanhar.",
      price: "24.90",
      stock: 120,
      size: ["M", "L"],
      color: "Branco",
      imageUrl: "https://example.com/images/meia-esportiva.jpg",
      slug: "meia-esportiva-3-pares",
      active: true,
      categoryId: catEsportes.id,
    },
    {
      name: "Tênis Casual",
      description: "Tênis para uso urbano com sola macia.",
      price: "249.90",
      stock: 15,
      size: ["40", "41", "42"],
      color: "Preto",
      imageUrl: "https://example.com/images/tenis-casual.jpg",
      slug: "tenis-casual",
      active: true,
      categoryId: catCalcados.id, // VINCULADO!
    },
    {
      name: "Boné Trucker",
      description: "Boné com mesh traseiro e aba curva.",
      price: "49.90",
      stock: 60,
      size: ["Único"],
      color: "Bege",
      imageUrl: "https://example.com/images/bone-trucker.jpg",
      slug: "bone-trucker",
      active: true,
      categoryId: catAcessorios.id, // VINCULADO!
    },
    {
      name: "Cinto de Couro",
      description: "Cinto de couro legítimo com fivela metálica.",
      price: "89.90",
      stock: 25,
      size: ["M", "L", "XL"],
      color: "Marrom",
      imageUrl: "https://example.com/images/cinto-couro.jpg",
      slug: "cinto-de-couro",
      active: true,
      categoryId: catAcessorios.id,
    },
  ];

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true,
  });

  console.log(`Sucesso! 4 Categorias e ${products.length} Produtos inseridos com vínculos.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
