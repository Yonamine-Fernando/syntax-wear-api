# Reavaliação e Resolução — Riscos Médios (Performance e Estabilidade)

## Status Consolidado: Junho 2026

### 📊 REQ-05: Ausência de Índices de Banco de Dados

**Status:** ✅ **IMPLEMENTADO**

**Análise:**

- ✅ Índice composto `@@index([categoryId, active])` já presente no modelo `Product`
- ✅ Protege as buscas mais frequentes (filtro por categoria + status ativo)
- ⚠️ **Recomendação:** Adicionar índice em `categories.slug` e `products.slug` para as buscas por slug (unique já existe, mas não há índice buscável)

**Ação Necessária:** Adicionar índices em campos de busca críticos

---

### 📊 REQ-06: Paginação Sem Teto Máximo

**Status:** ✅ **IMPLEMENTADO**

**Análise:**

- ✅ Schema Zod: `limit: z.coerce.number().int().min(1).max(100)`
- ✅ Services: Validação dupla com `Math.min(Math.max(Number(limit) || 10, 1), 100)`
- ✅ Protege contra `limit=500000` ou valores inválidos

**Resultado:** Limite máximo de 100 registros por página garantido em ambas as camadas

---

### 📊 REQ-07: Deep Includes Desnecessários

**Status:** ⚠️ **PARCIALMENTE OTIMIZADO**

**Análise Atual:**

#### ❌ Problema em `getOrders()` (Listagem):

```typescript
include: {
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, price: true, slug: true } }
    }
  }
}
```

- **Problema:** Traz `items` completo com `product` para **cada pedido**. Em 100 pedidos = 100+ JOINs
- **Impacto:** Payload massivo e consultas lentas

#### ✅ Correto em `getOrderById()` (Detalhe):

```typescript
include: {
  user: { select: { ... } },
  items: { include: { product: { include: { category: true } } } }
}
```

- Apropriado para visualização de detalhe único

#### ✅ Otimizado em `getProducts()`:

```typescript
include: {
  category: true;
}
```

- Balanceado: traz apenas a categoria referenciada

**Ação Necessária:** Refatorar `getOrders()` para trazer apenas metadata na listagem

---

### 📊 REQ-08: Vazamento de Informações no Erro 500

**Status:** ✅ **IMPLEMENTADO**

**Análise:**

```typescript
if (process.env.NODE_ENV !== "production") {
  responseBody.debug = error.message;
}
```

- ✅ Bloqueia exposição de stack traces em produção
- ✅ Mensagem genérica: `"Erro interno do servidor"`
- ✅ Debug apenas em desenvolvimento

**Resultado:** Informações sensíveis protegidas em produção

---

## 🎯 Recomendações Prioritárias

| Prioridade | Risco  | Ação                                         | Esforço |
| :--------- | :----- | :------------------------------------------- | :------ |
| 🔴 Alta    | REQ-07 | Refatorar `getOrders` com `select` otimizado | Médio   |
| 🟡 Média   | REQ-05 | Adicionar índices em `slug` e `createdAt`    | Baixo   |
| 🟢 Baixa   | REQ-06 | Adicionar campo de configuração `MAX_LIMIT`  | Trivial |
| 🟢 Baixa   | REQ-08 | Adicionar logging estruturado                | Baixo   |
