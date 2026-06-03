# Plano de CRUD de Pedidos

## Objetivo

Planejar a implementação completa e refinada de um CRUD de pedidos para o backend Syntax Wear, seguindo o padrão arquitetural já estabelecido no CRUD de categorias e produtos, garantindo regras de negócio alinhadas com o PRD.

## Escopo

- Modelagem de `Order` e `OrderItem` no Prisma
- Serviço de pedidos com lógica de negócio
- Controlador de pedidos com validações via Zod
- Rotas para pedidos com autenticação JWT
- Regras de negócio em português
- Operações protegidas por autenticação e autorização

## 1. Modelagem e banco

### Modelos Prisma

Validar/confirmar estrutura de `Order` com:

- `id: String` UUID (chave primária)
- `userId: String` (chave estrangeira para `User`)
- `items: OrderItem[]` (relação um-para-muitos)
- `status: OrderStatus` enum (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
- `totalPrice: Decimal` ou `Float`
- `shippingAddress: Json` (endereço de entrega)
- `paymentMethod: String?`
- `active: Boolean @default(true)` (soft delete)
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime @updatedAt`

Validar/confirmar estrutura de `OrderItem` com:

- `id: String` UUID
- `orderId: String` (FK para `Order`)
- `productId: String` (FK para `Product`)
- `quantity: Int`
- `unitPrice: Decimal` ou `Float` (preço fixado no momento da compra)
- `product: Product` (relação)
- `order: Order` (relação)
- `createdAt: DateTime @default(now())`

### Migrações

- Verificar se migrações já existem e estão aplicadas
- Garantir índices em `userId` e `status` para queries otimizadas
- Confirmar `OrderStatus` enum está definido
- Executar `prisma migrate` se necessário
- Executar `prisma generate` após migrações

## 2. Service

### Funções do serviço

- `getOrders(filters?: OrderFilters)` - Listar pedidos com filtros
- `getOrderById(id: string)` - Obter detalhes completo de um pedido
- `createOrder(userId: string, payload: CreateOrderRequest)` - Criar novo pedido
- `updateOrderStatus(id: string, status: OrderStatus)` - Atualizar status
- `deleteOrder(id: string)` - Soft delete (marcar como inativo)

### Regras do service

- Tipagem forte com Prisma (`Prisma.OrderCreateInput`, `Prisma.OrderUpdateInput`, etc.)
- Validar se produtos existem antes de criar pedido
- Validar se há estoque suficiente para cada item
- Decrementar estoque de produtos ao criar pedido (transação)
- Reverter estoque se houver erro
- Soft delete: marcar `active = false` em vez de remover fisicamente
- Não usar `any`
- Incluir relações necessárias (user, items, product, category)
- Filtros: por `status`, `userId`, intervalo de data (`startDate`, `endDate`)
- Paginação: `page` e `limit`

## 3. Controller

### Métodos do controlador

- `listOrders` - Listar pedidos com filtros (autenticado)
- `getOrder` - Obter um pedido específico (autenticado)
- `createOrderController` - Criar pedido (autenticado, associar ao usuário logado)
- `updateOrderStatusController` - Atualizar status (autenticado, apenas ADMIN)
- `deleteOrderController` - Soft delete de pedido (autenticado)

### Validações e regras

- Extrair `userId`
- Mensagens de erro e sucesso em português
- Listar pedidos: se usuário não é ADMIN, filtrar automaticamente por `userId`
- Obter pedido: se usuário não é ADMIN, validar que o pedido pertence ao usuário

## 4. Rotas

### Endpoints

- `GET /orders` - Listar pedidos (com filtros)
- `GET /orders/:id` - Obter detalhes de pedido
- `POST /orders` - Criar pedido
- `PATCH /orders/:id/status` - Atualizar status (opcional, apenas ADMIN)
- `DELETE /orders/:id` - Soft delete de pedido

### Configuração

- Aplicar middleware `authenticate` globalmente na rota de pedidos
- Integrar schemas Swagger/OpenAPI para documentação
- Validar `params`, `querystring` e `body` via Fastify schema
- Proteger todas as rotas com JWT autenticado

### Registro

- Confirmar registro em `src/app.ts` com `fastify.register(orderRoutes, { prefix: "/orders" })`

## 5. Validações e Schemas Zod

### Schemas a revisar/criar

- `orderListSchema` - Filtros de listagem (page, limit, status, userId, startDate, endDate)
- `orderParamSchema` - Validação de parâmetro `:id`
- `orderItemSchema` - Item do pedido (productId, quantity)
- `shippingAddressSchema` - Endereço de entrega
- `createOrderSchema` - Criar pedido (items, shippingAddress opcional)
- `updateOrderStatusSchema` - Atualizar status (status obrigatório)

### Validações

- `productId`: UUID obrigatório
- `quantity`: inteiro positivo (mínimo 1)
- `status`: enum (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
- `page`, `limit`: coerção numérica, mínimo 1
- Datas: formato YYYY-MM-DD
- Endereço: campos de string obrigatórios (street, city, state, zipCode, country)

## 6. Tipos TypeScript

### Interfaces a revisar/criar

- `OrderFilters` - Filtros de listagem
- `CreateOrderRequest` - Payload para criar pedido
- `UpdateOrderStatusRequest` - Payload para atualizar status
- `OrderItemRequest` - Item no request
- `ShippingAddress` - Endereço de entrega
- `JwtPayload` - Esperado: `{ userId: string, role: "USER" | "ADMIN" }`

## 7. Verificação e Testes

- Conferir `prisma/schema.prisma` com modelos `Order` e `OrderItem`
- Executar migrações pendentes
- Executar `prisma generate`
- Confirmar todos os imports e exports
- Validar tipagem (rodar `tsc --noEmit`)
- Testar manualmente cada endpoint:
  - Criar pedido com itens válidos
  - Listar pedidos com filtros
  - Obter detalhes de pedido
  - Atualizar status (ADMIN)
  - Deletar pedido
- Testar autorização: usuário regular não deve ver pedidos de outros

## Decisões confirmadas

- Pedidos são protegidos por autenticação JWT em todas as operações.
- Cada usuário só pode criar/ver seus próprios pedidos (ou ADMIN vê todos).
- Estoque de produtos é decrementado atomicamente ao criar pedido (transação).
- Cancelamento de pedido é logical (soft delete, `active = false`).
- Preço unitário (`unitPrice`) é fixado no momento da compra para auditoria.
- Rota `PATCH /orders/:id/status` é opcional; pode ser removida se não implementada.
- Mensagens de erro e sucesso devem estar em português brasileiro.
- Não há regra de ADMIN para criar/deletar pedidos; regra ADMIN só para `updateOrderStatus`.
