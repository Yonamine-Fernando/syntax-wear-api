# 🚀 PRD: Back-end API - Syntax Wear

## 1. Visão Geral do Produto
A **Syntax Wear API** é o sistema de back-end responsável por gerenciar toda a lógica de negócios, persistência de dados e segurança do e-commerce de calçados Syntax Wear. O sistema fornecerá endpoints RESTful para o front-end consumir, garantindo performance, tipagem estática e segurança nas transações.

## 2. Stack Tecnológico Definido
* **Linguagem:** TypeScript (para tipagem estática e segurança).
* **Framework:** Node.js com Fastify (focado em alta performance).
* **Banco de Dados:** PostgreSQL hospedado no Supabase.
* **ORM:** Prisma (para modelagem do banco e queries tipadas).
* **Autenticação:** JWT (JSON Web Tokens).
* **Testes:** Vitest (testes unitários e de integração).
* **Validação de Dados:** Zod (integra perfeitamente com Fastify e Prisma).

## 3. Modelagem de Dados (Entidades Principais)
Para atender as telas do projeto, o Prisma Schema precisará destas tabelas principais:

* **User (Usuários):** `id`, `name`, `email`, `password_hash`, `role` (ADMIN ou CUSTOMER), `created_at`.
* **Category (Categorias):** `id`, `name`, `slug`, `description`. Ex: Tênis Esportivo, Casual, Botas.
* **Product (Produtos):** `id`, `name`, `description`, `price`, `stock`, `size` (tamanhos de calçados), `color`, `image_url`, `category_id`.
* **Order (Pedidos):** `id`, `user_id`, `status` (PENDING, PAID, SHIPPED, DELIVERED), `total_price`, `created_at`.
* **OrderItem (Itens do Pedido):** `id`, `order_id`, `product_id`, `quantity`, `unit_price` (preço no momento da compra, para evitar bugs se o preço do produto mudar no futuro).

## 4. Estrutura de Endpoints (Rotas da API)

**🔒 Autenticação & Usuários**
* `POST /users`: Registra um novo cliente.
* `POST /sessions`: Realiza o login e devolve o token JWT.
* `GET /users/me`: Retorna o perfil do usuário logado.

**🏷️ Categorias**
* `GET /categories`: Lista todas as categorias disponíveis (Aberto ao público).
* `POST /categories`: Cria uma nova categoria (Somente ADMIN).
* `PUT /categories/:id`: Atualiza dados da categoria (Somente ADMIN).
* `DELETE /categories/:id`: Remove uma categoria (Somente ADMIN).

**👟 Produtos**
* `GET /products`: Lista produtos (com filtros de busca, categoria, preço e paginação).
* `GET /products/:id`: Traz os detalhes de um calçado específico.
* `POST /products`: Cadastra um novo calçado (Somente ADMIN).
* `PUT /products/:id`: Atualiza estoque, preço ou detalhes (Somente ADMIN).
* `DELETE /products/:id`: Remove um produto do catálogo (Somente ADMIN).

**📦 Pedidos (Checkout)**
* `POST /orders`: Cria um novo pedido a partir do carrinho do usuário.
* `GET /orders`: Lista o histórico de pedidos do usuário logado.
* `GET /orders/:id`: Detalhes de um pedido específico.
* `PATCH /orders/:id/status`: Atualiza o status do pedido (Somente ADMIN).

## 5. Requisitos Não Funcionais (NFRs)
* **Segurança:** Senhas devem ser cacheadas (usando bcryptjs). Rotas administrativas devem verificar se a `role` do usuário no JWT é `ADMIN`. Proteção contra ataques comuns configurada via `@fastify/helmet` e `@fastify/cors`.
* **Qualidade de Código:** O código deve estar coberto por testes automatizados (Vitest), focando principalmente nas regras de negócio (ex: não permitir criação de pedido se não houver estoque do calçado).
* **Tratamento de Erros:** Respostas padronizadas para erros de validação (HTTP 400), não autorizado (HTTP 401), proibido (HTTP 403) e não encontrado (HTTP 404).
