export interface ProductFilters {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[]; // Filtrar produtos que contenham pelo menos um dos tamanhos
  colors?: string[]; // Filtrar por cores específicas
  search?: string; // Busca em name ou description
  minCreatedAt?: Date;
  maxCreatedAt?: Date;
  categoryId?: string; // Filtrar por categoria
  sortBy?: "price" | "name" | "createdAt" | "stock";
  sortOrder?: "asc" | "desc";
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  firstName: string;
  lastName: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  role?: "USER" | "ADMIN";
}

export interface CreateProduct {
  name: string;
  description: string;
  price: number;
  colors?: string;
  sizes?: string[];
  slug: string;
  stock: number;
  active: boolean;
  images?: string[];
  categoryId: string; // VINCULADO!
}

export interface UpdateProduct extends Partial<CreateProduct> {
  name?: string;
  description?: string;
  price?: number;
  slug?: string;
  stock?: number;
  active?: boolean;
  images?: string[];
}

export interface DeleteProduct {
  id: string;
}
export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  userId?: string;
  startDate?: string;
  endDate?: string;
}
