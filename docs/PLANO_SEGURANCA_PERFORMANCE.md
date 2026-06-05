# Plano de Mitigação de Riscos, Performance e Manutenibilidade — Syntaxe-Wear API

Este documento apresenta o plano estratégico estruturado para a correção de vulnerabilidades, otimização de consultas e aprimoramento da arquitetura da API REST do projeto **Syntaxe-Wear** (desenvolvida com Fastify, TypeScript, Prisma e PostgreSQL/Supabase).

---

## 1. Matriz de Classificação de Riscos

| Identificador | Categoria        | Impacto/Risco | Descrição Técnica                                              | Arquivos Afetados                                                    |
| :------------ | :--------------- | :------------ | :------------------------------------------------------------- | :------------------------------------------------------------------- |
| **REQ-01**    | Segurança        | 🚨 Alto       | Quebra de Autorização em Nível de Objeto e Rota (BOLA / IDOR)  | `categories.routes.ts`, `products.routes.ts`, controllers associados |
| **REQ-02**    | Segurança        | 🚨 Alto       | Exposição de Dados Sensíveis (Vazamento do Hash de Senha)      | `auth.service.ts`, `auth.controller.ts`                              |
| **REQ-03**    | Segurança        | 🚨 Alto       | Ciclo de Vida Indefinido de Tokens (JWT Sem Expiração)         | `app.ts`, `auth.controller.ts`                                       |
| **REQ-04**    | Segurança        | 🚨 Alto       | Configuração Permissiva de CORS com Credenciais                | `app.ts`                                                             |
| **REQ-05**    | Performance      | ⚠️ Médio      | Falta de Índices Estratégicos no Banco de Dados                | `schema.prisma`                                                      |
| **REQ-06**    | Performance      | ⚠️ Médio      | Paginação Sem Controle de Teto Máximo (_Unbounded Limits_)     | `validators.ts`, `products.service.ts`, `orders.service.ts`          |
| **REQ-07**    | Performance      | ⚠️ Médio      | Sobrecarga de Carregamento (_Deep Includes_ em Listagens)      | `orders.service.ts`                                                  |
| **REQ-08**    | Segurança        | ⚠️ Médio      | Vazamento de Detalhes da Infraestrutura no Tratamento de Erros | `error.middleware.ts`                                                |
| **REQ-09**    | Manutenibilidade | ℹ️ Baixo      | Duplicação de Contratos de API (JSON Schema vs Zod)            | `*.routes.ts`, `validators.ts`                                       |
| **REQ-10**    | Manutenibilidade | ℹ️ Baixo      | Inconsistência de Nomenclatura e Campos Obrigatórios           | `validators.ts`, `product.controller.ts`                             |

---

## 2. Detalhamento Técnico dos Diagnósticos

### 🚨 Riscos Altos (Críticos)

#### REQ-01: Quebra de Autorização (BOLA / IDOR)

- **Problema:** Os hooks de autenticação (`fastify.addHook("onRequest", authenticate)`) nas rotas de produtos e categorias encontram-se comentados. Adicionalmente, as operações de mutação (`POST`, `PUT`, `PATCH`, `DELETE`) não validam se o usuário autenticado possui o papel (`role`) de `ADMIN`.
- **Impacto:** Qualquer usuário comum autenticado (ou mesmo não autenticado) pode alterar preços, apagar produtos do catálogo ou criar categorias falsas diretamente via chamadas HTTP HTTP.
- **Status (ação aplicada):** Mitigado. Hooks de autenticação e middleware de autorização foram implementados e aplicados às rotas mutantes de `products` e `categories`.

#### REQ-02: Exposição de Dados Sensíveis

- **Problema:** O método `registerUser` e `loginUser` no `auth.service.ts` realiza uma consulta que retorna a entidade `User` completa. O controller repassa esse objeto diretamente para o método `reply.send({ user, token })`.
- **Impacto:** O campo `passwordHash` (gerado pelo bcrypt) é trafegado pela rede e exposto na memória da aplicação client-side (React), facilitando ataques de força bruta offline se interceptado.
- **Status (ação aplicada):** Mitigado. As respostas de `register` e `login` foram sanitizadas para remover `passwordHash` antes do envio ao cliente.

#### REQ-03: JWT Sem Expiração

- **Problema:** A configuração do plugin `@fastify/jwt` no arquivo `app.ts` e as chamadas de assinatura (`request.server.jwt.sign`) não definem um tempo limite de vida para o token de acesso.
- **Impacto:** Um token roubado ou interceptado permanece válido indefinidamente, violando os princípios de revogação de sessão e segurança de tráfego.
- **Status (ação aplicada):** Mitigado. Foi configurado `expiresIn` padrão para JWT (`1d`) e expiração passa a ser configurável via `JWT_EXPIRES_IN`.

#### REQ-04: CORS Inseguro

- **Problema:** O CORS está configurado com `origin: true` em conjunto com `credentials: true`.
- **Impacto:** Permite que qualquer domínio na internet faça requisições lendo cookies ou cabeçalhos de autorização da API, abrindo margem para ataques de Cross-Site Request Forgery (CSRF).
- **Status (ação aplicada):** Mitigado. `CORS` foi tornado configurável via `CORS_ORIGINS` e `CORS_ALLOW_CREDENTIALS`, removendo `origin: true` padrão.

---

### ⚠️ Riscos Médios (Performance e Estabilidade)

#### REQ-05: Ausência de Índices de Banco de Dados

- **Problema:** Cláusulas complexas de `where` filtram produtos constantemente por `categoryId` e pelo status booleano `active`, além de ordenações baseadas em `createdAt`. No `schema.prisma`, nenhum destes campos possui índices explícitos.
- **Impacto:** O PostgreSQL realiza buscas lineares (_Full Table Scans_). À medida que o catálogo cresce, o tempo de resposta das listagens aumenta exponencialmente.

#### REQ-06: Paginação Sem Teto Máximo

- **Problema:** Os esquemas do Zod aceitam qualquer valor numérico fornecido na query string para o campo `limit` (ex: `limit: z.coerce.number().optional()`).
- **Impacto:** Um atacante pode enviar uma requisição contendo `?limit=500000`, forçando o Node.js a alocar gigabytes de memória para instanciar objetos do ORM, resultando em quedas por estouro de memória (_Out of Memory_).

#### REQ-07: Deep Includes Desnecessários

- **Problema:** A listagem global de pedidos no `orders.service.ts` traz, para cada linha do banco, o relacionamento completo de itens, produtos e categorias anexadas.
- **Impacto:** Payload HTTP massivo e consultas SQL extremamente pesadas contendo múltiplos _JOINs_ desnecessários para exibições em tabelas simples no painel administrativo.

#### REQ-08: Vazamento de Informações no Erro 500

- **Problema:** Em cenários de falha inesperada, o `error.middleware.ts` devolve a propriedade `debug: error.message` diretamente na resposta JSON.
- **Impacto:** Revela detalhes internos como nomes de colunas do banco, falhas de conexão de rede ou caminhos de pastas do servidor para o cliente final.

---

### ℹ️ Riscos Baixos (Manutenibilidade)

#### REQ-09: Duplicação de Contratos

- **Problema:** Definição manual de esquemas JSON Schema dentro dos arquivos de rotas para alimentar o Swagger/Scalar, paralelamente à redefinição de validações de tipos no arquivo `validators.ts` usando Zod.
- **Impacto:** Alta probabilidade de dessincronização entre o que a documentação diz aceitar e o que o validador em runtime realmente bloqueia.

#### REQ-10: Inconsistência de Atributos e Nomenclaturas

- **Problema:** Campos como `colors` no validador do Zod conflitam com propriedades singulares como `color` definidas no `schema.prisma`. Adicionalmente, o validador exige `slug` na criação, mas o próprio controller o sobrescreve programaticamente via biblioteca de slugify.
- **Impacto:** Código confuso para manutenção e quebra de tipagem estrita entre as camadas de transporte e persistência.

---

## 3. Plano de Ação Passo a Passo

### Fase 1: Blindagem Crítica (Foco: Segurança)

1. **Passo 1.1 - Ativação Global da Autenticação:**
   - Descomentar os hooks de requisição nos arquivos de rotas de produtos e categorias.
2. **Passo 1.2 - Criação do Guardião de Permissões (RBAC):**
   - Desenhar um middleware complementar focado em checar se o payload extraído em `request.user.role` equivale estritamente a `"ADMIN"`.
   - Aplicar esse validador de privilégios nas rotas mutantes (`POST`, `PUT`, `PATCH`, `DELETE`) de catálogo e inventário.
3. **Passo 1.3 - Sanitização e Omissão de Propriedades Sensíveis:**
   - Ajustar o escopo do objeto de retorno no `auth.service.ts` para garantir que o campo `passwordHash` seja deletado explicitamente antes do envio.
4. **Passo 1.4 - Configuração de Janela de Expiração do JWT:**
   - Configurar a propriedade `sign: { expiresIn: '1d' }` (ou similar) no registro do plugin de JWT no `app.ts`.
5. **Passo 1.5 - Restrição de Origens do CORS:**
   - Substituir a flag abrangente `origin: true` por uma lista branca restrita contendo apenas os domínios mapeados do frontend em produção e desenvolvimento.

### Fase 2: Estabilização e Eficiência (Foco: Performance)

1. **Passo 2.1 - Estruturação de Índices no Prisma:**
   - Adicionar o bloco de indexação composta `@@index([categoryId, active])` no modelo de `Product` dentro do `schema.prisma`.
   - Executar o comando de migração do Prisma CLI para refletir os novos índices físicos no banco do Supabase.
2. **Passo 2.2 - Imposição de Teto Máximo em Paginações:**
   - Inserir um limitador nos validadores do Zod (ex: `.refine()` ou `.transform()`) garantindo que o parâmetro `limit` nunca ultrapasse o valor máximo de 50 ou 100 registros por chamada.
3. **Passo 2.3 - Projeções Seletivas de Dados (Payload Slimming):**
   - Refatorar a listagem de pedidos para usar a cláusula `select` do Prisma, trazendo apenas colunas essenciais na listagem geral e postergando o carregamento profundo de itens apenas para a rota de busca por ID único (`/:id`).
4. **Passo 2.4 - Ocultamento do Modo Debug em Produção:**
   - Alterar o middleware de erro para avaliar a variável de ambiente `NODE_ENV`. O campo `debug` só deve ser injetado na resposta se o servidor estiver rodando localmente em modo de desenvolvimento.

### Fase 3: Modernização de Código (Foco: Manutenibilidade)

1. **Passo 3.1 - Unificação de Contratos com Type Providers:**
   - Eliminar os blocos estáticos de JSON Schema nos arquivos de rotas.
   - Configurar o provedor de tipos oficial do Zod para o Fastify (`fastify-type-provider-zod`). Isso fará com que os schemas do Zod validem a requisição em runtime e alimentem o Swagger de forma 100% automatizada.
2. **Passo 3.2 - Ajuste de Ciclo de Vida do Slug:**
   - Remover a obrigatoriedade do campo `slug` na validação de entrada de criação do Zod, visto que o dado é gerado internamente pelas regras de negócio do próprio controlador.
3. **Passo 3.3 - Alinhamento e Padronização de DTOs:**
   - Sincronizar o singular/plural de campos de array/string nos arquivos de tipagem (`index.ts`) para manter coerência milimétrica com os mapeamentos gerados pelo cliente do Prisma.

---

_Nota: Este plano foi construído estritamente sob uma abordagem de diagnóstico estratégico e arquitetura de software, em total conformidade com as diretrizes de não-desenvolvimento imediato de código até a validação do responsável técnico._
