# Copilot Instructions for syntax-wear-api

This repository is a TypeScript ESM backend API using Fastify, Prisma, Zod, JWT authentication, and `tsx` for local development.

## 1. Core Structure and Mapping

- Main app entry: `src/app.ts`
- API Documentation (Swagger): Available at `/api-docs`
- Business Reference: `docs/PRD_Backend_Syntax_Wear.md`
- Architectural Separation:
  - `src/routes/*` for endpoint declarations and Swagger schema definitions.
  - `src/controllers/*` for request handlers (input validation, dynamic data generation, and HTTP responses).
  - `src/services/*` for business logic and strict database communication.
  - `src/utils/validators.ts` for Zod validation schemas.
  - `src/middlewares/error.middleware.ts` for centralized error handling (converts Zod/Fastify errors into HTTP responses).
  - `src/types/index.ts` for shared TypeScript interfaces.

## 2. Strict Coding Rules (TypeScript and Prisma)

- NEVER use the `any` type or `as unknown`.
- Avoid creating redundant manual interfaces for DB operations; USE Prisma's native typing (e.g., `Prisma.ProductCreateInput`, `Prisma.CategoryUpdateInput`).
- Primary table IDs MUST be `String` (UUID). NEVER suggest sequential IDs.
- Keep imports as ESM with `.js` extensions for local modules. Do not use CommonJS syntax.

## 3. Business Rules and Design Patterns (Syntax Wear)

- **Soft Delete:** Entity deletion (Products, Categories) is always logical (setting `active = false`). Do not remove records physically with `prisma.[model].delete` unless explicitly requested.
- **Update Pattern (PUT/PATCH):** Always reuse the creation Zod schema using `.partial()` (e.g., `createCategorySchema.partial().parse(body)`).
- **Slugs Generation:** Slugs must be dynamically generated with the `slugify` library (`{ lower: true, strict: true, locale: "pt" }`) from the entity name. **Crucial:** Generate the slug _before_ passing the data to the Zod `.parse()` step.
- **Fastify Route Schemas:** Always explicitly define `params`, `querystring`, and `body` inside the Fastify route configuration. This acts as the first line of defense to trigger 400 errors before the controller is reached.
- **Validation:** Validation (Zod) must occur at the request boundary (Controller) before calling the Service.
- **Security:** Protected routes must apply the `authenticate` middleware (either globally via `addHook` or per route).

## 4. Development and Scripts

- Start local server: `npm run dev`
- Generate Prisma client: `npm run prisma:generate` (and `migrate` / `studio` / `seed`).
- _Note:_ The `package.json` has an intentional typo in the build script (`buld`). Do not change it.
- The app uses user-facing messages in Brazilian Portuguese. Preserve this localization style in API responses.
