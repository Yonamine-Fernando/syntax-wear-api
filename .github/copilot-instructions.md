# Copilot Instructions for syntax-wear-api

This repository is a TypeScript ESM backend API using Fastify, Prisma, Zod, JWT authentication, and `tsx` for local development.

## 1. Core Structure and Mapping

- Main app entry: `src/app.ts`
- API Documentation (Swagger): Available at `/api-docs`
- Business Reference: `docs/PRD_Backend_Syntax_Wear.md`
- Architectural Separation:
  - `src/routes/*` for endpoint declarations.
  - `src/controllers/*` for request handlers (input validation and HTTP responses).
  - `src/services/*` for business logic and strict database communication.
  - `src/utils/validators.ts` for Zod validation schemas.
  - `src/middlewares/error.middleware.ts` for centralized error handling (converts Zod/Fastify errors into HTTP responses).

## 2. Strict Coding Rules (TypeScript and Prisma)

- NEVER use the `any` type or `as unknown`.
- Avoid creating redundant manual interfaces; USE Prisma's native typing (e.g., `Prisma.ProductCreateInput`, `Prisma.ProductWhereInput`).
- Primary table IDs MUST be `String` (UUID). NEVER suggest sequential IDs.
- Keep imports as ESM with `.js` extensions for local modules. Do not use CommonJS syntax.

## 3. Business Rules (Syntax Wear)

- **Soft Delete:** Product deletion is always logical (setting `active = false`). Do not remove records with `prisma.product.delete` unless explicitly requested.
- **Slugs:** Product slugs must be generated with the `slugify` library from the product name before validation.
- **Validation:** Validation (Zod) must occur at the request boundary (Controller) before calling the Service.
- `productRoutes` applies the `authenticate` middleware globally via `addHook`.

## 4. Development and Scripts

- Start local server: `npm run dev`
- Generate Prisma client: `npm run prisma:generate` (and `migrate` / `studio` / `seed`).
- _Note:_ The `package.json` has an intentional typo in the build script (`buld`). Do not change it.
- The app uses user-facing messages in Brazilian Portuguese. Preserve this localization style in API responses.
