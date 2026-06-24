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
  console.log("🧹 Limpando banco de dados para evitar duplicatas...");

  // 🚨 ORDEM CRÍTICA: Filhos antes dos Pais
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  // Não apagamos os usuários com deleteMany para não quebrar sessões antigas caso existam,
  // usaremos o upsert abaixo para garantir que eles existam ou sejam atualizados.

  console.log("👥 Criando 3 Usuários...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@syntaxwear.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "Syntax",
      email: "admin@syntaxwear.com",
      passwordHash: "hash_seguro_123",
      cpf: "00000000001",
      phone: "11999999991",
      role: "ADMIN",
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: "joao@email.com" },
    update: {},
    create: {
      firstName: "João",
      lastName: "Silva",
      email: "joao@email.com",
      passwordHash: "hash_seguro_123",
      cpf: "00000000002",
      phone: "11999999992",
      role: "USER",
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "maria@email.com" },
    update: {},
    create: {
      firstName: "Maria",
      lastName: "Oliveira",
      email: "maria@email.com",
      passwordHash: "hash_seguro_123",
      cpf: "00000000003",
      phone: "11999999993",
      role: "USER",
    },
  });

  console.log("🏷️ Criando 8 Categorias...");

  const categorias = await Promise.all([
    prisma.category.create({
      data: { name: "Roupas Casuais", slug: "roupas-casuais", description: "Moda para o dia a dia", active: true },
    }),
    prisma.category.create({
      data: { name: "Esportes", slug: "esportes", description: "Roupas e acessórios para treino", active: true },
    }),
    prisma.category.create({
      data: { name: "Acessórios", slug: "acessorios", description: "Complementos para o seu estilo", active: true },
    }),
    prisma.category.create({
      data: { name: "Calçados", slug: "calcados", description: "Tênis e sapatos", active: true },
    }),
    prisma.category.create({
      data: { name: "Inverno", slug: "inverno", description: "Roupas para o frio", active: true },
    }),
    prisma.category.create({
      data: { name: "Moda Íntima", slug: "moda-intima", description: "Conforto e qualidade", active: true },
    }),
    prisma.category.create({
      data: { name: "Praia", slug: "praia", description: "Moda praia e natação", active: true },
    }),
    prisma.category.create({
      data: { name: "Social", slug: "social", description: "Roupas para eventos e trabalho", active: true },
    }),
  ]);

  const [catCasuais, catEsportes, catAcessorios, catCalcados, catInverno, catIntima, catPraia, catSocial] = categorias;

  console.log("👕 Criando 10 Produtos (com Imagens e Cores)...");

  const productsData = [
    {
      name: "Camiseta Básica",
      price: 39.9,
      stock: 50,
      slug: "camiseta-basica",
      categoryId: catCasuais.id,
      description: "100% algodão.",
      size: ["M", "L"],
      color: "Branco",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Camiseta+Basica",
      active: true,
    },
    {
      name: "Calça Jeans Slim",
      price: 149.9,
      stock: 30,
      slug: "calca-jeans-slim",
      categoryId: catCasuais.id,
      description: "Jeans premium.",
      size: ["40", "42"],
      color: "Azul Marinho",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Calca+Jeans",
      active: true,
    },
    {
      name: "Regata Fitness",
      price: 29.9,
      stock: 80,
      slug: "regata-fitness",
      categoryId: catEsportes.id,
      description: "Dry-fit.",
      size: ["S", "M"],
      color: "Preto",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Regata+Fitness",
      active: true,
    },
    {
      name: "Tênis Casual",
      price: 249.9,
      stock: 15,
      slug: "tenis-casual",
      categoryId: catCalcados.id,
      description: "Sola macia.",
      size: ["41", "42"],
      color: "Branco/Cinza",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Tenis+Casual",
      active: true,
    },
    {
      name: "Boné Trucker",
      price: 49.9,
      stock: 60,
      slug: "bone-trucker",
      categoryId: catAcessorios.id,
      description: "Aba curva.",
      size: ["Único"],
      color: "Preto",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Bone+Trucker",
      active: true,
    },
    {
      name: "Jaqueta Corta-vento",
      price: 179.9,
      stock: 12,
      slug: "jaqueta-corta-vento",
      categoryId: catInverno.id,
      description: "Resistente à água.",
      size: ["M", "L"],
      color: "Preto",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Jaqueta",
      active: true,
    },
    {
      name: "Cueca Boxer (3 pares)",
      price: 59.9,
      stock: 100,
      slug: "cueca-boxer",
      categoryId: catIntima.id,
      description: "Algodão com elastano.",
      size: ["M", "L"],
      color: "Sortidas",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Cuecas+Boxer",
      active: true,
    },
    {
      name: "Sunga de Praia",
      price: 69.9,
      stock: 40,
      slug: "sunga-praia",
      categoryId: catPraia.id,
      description: "Secagem rápida.",
      size: ["M", "L"],
      color: "Azul Marinho",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Sunga",
      active: true,
    },
    {
      name: "Camisa Social Slim",
      price: 129.9,
      stock: 25,
      slug: "camisa-social",
      categoryId: catSocial.id,
      description: "Fácil de passar.",
      size: ["M", "L"],
      color: "Branco",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Camisa+Social",
      active: true,
    },
    {
      name: "Tênis de Corrida Ultra",
      price: 349.9,
      stock: 20,
      slug: "tenis-corrida",
      categoryId: catCalcados.id,
      description: "Amortecimento máximo.",
      size: ["40", "41"],
      color: "Laranja/Preto",
      imageUrl: "https://placehold.co/600x400/e2e8f0/8a8a8a?text=Tenis+Corrida",
      active: true,
    },
  ];

  await prisma.product.createMany({ data: productsData, skipDuplicates: true });

  // Buscar os produtos recém-criados para podermos vincular aos pedidos
  const p = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

  console.log("📦 Criando 4 Pedidos...");

  if (p.length >= 10) {
    // Pedido 1: João, Status PAGO (2 itens)
    await prisma.order.create({
      data: {
        userId: customer1.id,
        status: "PAID",
        totalPrice: Number(p[0].price) * 2 + Number(p[1].price) * 1,
        items: {
          create: [
            { productId: p[0].id, quantity: 2, unitPrice: Number(p[0].price) },
            { productId: p[1].id, quantity: 1, unitPrice: Number(p[1].price) },
          ],
        },
      },
    });

    // Pedido 2: João, Status ENTREGUE (1 item)
    await prisma.order.create({
      data: {
        userId: customer1.id,
        status: "DELIVERED",
        totalPrice: Number(p[3].price) * 1,
        items: {
          create: [{ productId: p[3].id, quantity: 1, unitPrice: Number(p[3].price) }],
        },
      },
    });

    // Pedido 3: Maria, Status PENDENTE (3 itens)
    await prisma.order.create({
      data: {
        userId: customer2.id,
        status: "PENDING",
        totalPrice: Number(p[5].price) * 1 + Number(p[8].price) * 2 + Number(p[9].price) * 1,
        items: {
          create: [
            { productId: p[5].id, quantity: 1, unitPrice: Number(p[5].price) },
            { productId: p[8].id, quantity: 2, unitPrice: Number(p[8].price) },
            { productId: p[9].id, quantity: 1, unitPrice: Number(p[9].price) },
          ],
        },
      },
    });

    // Pedido 4: Maria, Status CANCELADO (1 item)
    await prisma.order.create({
      data: {
        userId: customer2.id,
        status: "CANCELLED",
        totalPrice: Number(p[4].price) * 1,
        items: {
          create: [{ productId: p[4].id, quantity: 1, unitPrice: Number(p[4].price) }],
        },
      },
    });
  }

  console.log("✅ Seed finalizado com sucesso absoluto! 3 Usuários, 8 Categorias, 10 Produtos e 4 Pedidos criados.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
