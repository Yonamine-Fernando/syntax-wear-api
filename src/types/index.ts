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
  sortBy?: "price" | "name" | "created_at" | "stock";
  sortOrder?: "asc" | "desc";
}
