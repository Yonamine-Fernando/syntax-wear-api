# Plano de CRUD de Categorias

## Objetivo

Planejar a implementação de um CRUD de categorias para o backend Syntax Wear, seguindo o padrão do CRUD de produtos já existente e as regras do repositório.

## Escopo

- Modelagem de `Category` no Prisma
- Serviço de categorias
- Controlador de categorias
- Rotas para categorias
- Regras de negócio em português
- Operações protegidas por autenticação JWT

## 1. Modelagem e banco

- Criar modelo `Category` com:
  - `id: String` UUID
  - `name: String`
  - `slug: String` único
  - `description: String?`
  - `active: Boolean @default(true)`
  - `createdAt: DateTime @default(now())`
- Garantir soft delete via `active = false`
- Atualizar `Product` para referenciar `categoryId` e relação `category`
- Planejar migração Prisma e geração de client

## 2. Service

- Criar serviço de categorias com funções:
  - `getCategories(filters?)`
  - `getCategoryById(id: string)`
  - `createCategory(data)`
  - `updateCategory(id, data)`
  - `deleteCategory(id)`
- Regras do service:
  - tipagem forte com Prisma
  - validar slug único
  - não usar `any`

## 3. Controller

- Criar controller de categorias
- Validar entrada com Zod antes de chamar o service
- Métodos previstos:
  - `listCategories`
  - `getCategory`
  - `createCategory`
  - `updateCategory`
  - `deleteCategory`
- Mensagens de retorno e erro em português
- Gerar `slug` de categoria antes da validação

## 4. Rotas

- Criar `categories.routes.ts`
- Rotas:
  - `GET /categories`
  - `GET /categories/:id`
  - `POST /categories`
  - `PUT /categories/:id`
  - `DELETE /categories/:id`
- Aplicar middleware `authenticate`
- Proteger `POST`, `PUT` e `DELETE` com JWT
- Registrar a rota em `src/app.ts`

## 5. Verificação

- Conferir `prisma/schema.prisma`
- Executar migração e `prisma generate`
- Confirmar registro das rotas
- Testar manualmente CRUD de categorias

## Decisões confirmadas

- Categoria deve ser obrigatória em `Product` desde a primeira versão.
- Exclusão de categoria deve ser lógica (soft delete) usando `active = false`.
- Segurança: `POST`, `PUT` e `DELETE` devem ser protegidos pela validação do token JWT via `authenticate`.
- Pode ser necessário adicionar checagem de `role` ADMIN para rotas administrativas conforme o PRD.
