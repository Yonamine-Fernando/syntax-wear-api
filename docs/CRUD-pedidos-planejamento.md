# Plano de CRUD de Pedidos (Checkout)

## Objetivo

Planejar a implementação do módulo de Pedidos (Orders) e Itens do Pedido (OrderItems) para a Syntax Wear API, garantindo segurança transacional, validação rigorosa de estoque e proteção de dados do usuário autenticado.

## Escopo

- Modelagem de `Order` e `OrderItem` no Prisma com IDs UUID.
- Implementação do Enum de Status do Pedido.
- Criação do Service com lógica transacional (criação de pedido + baixa de estoque).
- Criação de Controller protegido por Zod.
- Rotas protegidas por JWT (Cliente vê seus pedidos, ADMIN gerencia status).

## 1. Modelagem e Banco (Prisma)

- **Enum `OrderStatus`**: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- **Modelo `Order`**:
  - `id: String` (UUID)
  - `userId: String` (Relacionamento com User)
  - `status: OrderStatus @default(PENDING)`
  - `totalPrice: Float`
  - `active: Boolean @default(true)` (Soft Delete)
  - `createdAt: DateTime @default(now())`
  - `updatedAt: DateTime @updatedAt`
- **Modelo `OrderItem`**:
  - `id: String` (UUID)
  - `orderId: String` (Relacionamento com Order)
  - `productId: String` (Relacionamento com Product)
  - `quantity: Int`
  - `unitPrice: Float` (Preço no momento da compra)

## 2. Service (`src/services/orders.service.ts`)

- **Regras estritas:** Sem uso de `any`, tipagem 100% Prisma.
- `createOrder(userId, cartItems)`:
  - Validar se produtos existem e estão ativos.
  - Validar se há estoque suficiente para cada item.
  - Usar `$transaction` do Prisma para:
    1. Calcular o `totalPrice` baseado no `price` atual do produto.
    2. Criar a `Order` e os `OrderItems`.
    3. Descontar o estoque dos produtos comprados.
- `getOrdersByUser(userId)`: Listar histórico de compras do cliente.
- `getOrderById(orderId, userId, role)`: Ver detalhes do pedido (bloquear se o cliente tentar ver o pedido de outro, a menos que seja ADMIN).
- `updateOrderStatus(orderId, status)`: Alterar o status (ex: de PENDING para PAID ou CANCELLED). Se CANCELLED, devolver o estoque dos itens.

## 3. Controller (`src/controllers/order.controller.ts`)

- `createOrderHandler`: Zod valida se o array de itens tem pelo menos 1 item e se as quantidades são > 0. O `userId` vem do token JWT.
- `listMyOrdersHandler`: Usa apenas o `userId` do JWT para buscar os dados.
- `getOrderHandler`: Zod valida o UUID da rota.
- `updateOrderStatusHandler`: Zod valida se o status enviado pertence ao Enum `OrderStatus`.

## 4. Rotas e Schemas (`src/routes/orders.routes.ts`)

- Todas as rotas usam o middleware `authenticate`.
- Regra do Fastify: Todas as rotas devem ter `params` e `body` explicitamente tipados no schema do Swagger para gerar erros 400 prematuros.
- `POST /orders` (Autenticado - Cria pedido)
- `GET /orders` (Autenticado - Lista meus pedidos)
- `GET /orders/:id` (Autenticado - Detalhes do meu pedido)
- `PATCH /orders/:id/status` (Somente ADMIN - Atualiza status)

## 5. Decisões Confirmadas (NFRs)

- **Preço Histórico:** O `unitPrice` será gravado no `OrderItem` para que alterações futuras no preço do calçado não quebrem o valor total de pedidos passados.
- **Transações:** A criação do pedido e a baixa do estoque devem ocorrer juntas. Se uma falhar, a outra é revertida automaticamente pelo Prisma (`$transaction`).
