import z from "zod";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no minímo 6 caracteres"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "O nome deve ser informado"),
  lastName: z.string().min(1, "O sobrenome deve ser informado"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no minímo 6 caracteres"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida"),
  phone: z.string().min(8, "Telefone inválido"),
});

export const productListSchema = z.object({
  page: z.coerce.number().int().min(1, "A página deve ser no mínimo 1").optional(),
  limit: z.coerce.number().int().min(1, "O limite deve ser no mínimo 1").optional(),

  minPrice: z.coerce.number().nonnegative("Preço mínimo deve ser positivo").optional(),
  maxPrice: z.coerce.number().nonnegative("Preço mínimo deve ser positivo").optional().optional(),
  sizes: z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val !== "") {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }, z.array(z.string()).optional()),
  colors: z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val !== "") {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }, z.array(z.string()).optional()),
  search: z.string().optional(),
  minCreatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .optional(),
  maxCreatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .optional(),
  sortBy: z.enum(["price", "name", "created_at", "stock"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatório"),
  price: z.number().nonnegative("Preço deve ser positivo"),
  color: z.string().optional(),
  size: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative("Estoque deve ser positivo"),
  active: z.boolean(),
  images: z.array(z.string()).optional(),
  slug: z.string().min(1, "Slug é obrigatório"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  description: z.string().min(1, "Descrição é obrigatório").optional(),
  price: z.number().nonnegative("Preço deve ser positivo").optional(),
  color: z.string().optional(),
  size: z.array(z.string()).optional(),
  stock: z.number().int().nonnegative("Estoque deve ser positivo").optional(),
  active: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  slug: z.string().min(1, "Slug é obrigatório").optional(),
});
