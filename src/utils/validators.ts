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

export interface CreateCategory {
  name: string;
  description?: string;
  active: boolean;
  slug: string;
}

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  slug: z.string().min(1, "Slug é obrigatório"),
});

export const categoryListSchema = z.object({
  page: z.coerce.number().int().min(1, "A página deve ser no mínimo 1").optional(),
  limit: z.coerce.number().int().min(1, "O limite deve ser no mínimo 1").optional(),
  search: z.string().optional(),
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
  categoryId: z.string().min(1, "Categoria é obrigatória"),
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
  categoryId: z.string().min(1, "ID de categoria inválido").optional(),
});
export const deleteProductSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
export const orderListSchema = z.object({
  page: z.coerce.number().int().min(1, "A página deve ser no mínimo 1").optional(),
  limit: z.coerce.number().int().min(1, "O limite deve ser no mínimo 1").optional(),
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  userId: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial inválida (use YYYY-MM-DD)")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data final inválida (use YYYY-MM-DD)")
    .optional(),
});

export const orderParamSchema = z.object({
  id: z.string().uuid("ID do pedido inválido"),
});

export const shippingAddressSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  zipCode: z.string().min(1, "CEP é obrigatório"),
  country: z.string().min(1, "País é obrigatório"),
  number: z.string().optional(),
  complement: z.string().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().uuid("ID do produto inválido"),
  quantity: z.number().int().min(1, "Quantidade deve ser no mínimo 1"),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "O pedido deve conter pelo menos um item"),
  shippingAddress: shippingAddressSchema.optional(),
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório").optional(),
});

export const updateOrderSchema = createOrderSchema.partial().extend({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
});
