import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNewProduct,
  deleteExistingProduct,
  getProduct,
  listProducts,
  updateExistingProduct,
} from "../src/controllers/product.controller.ts";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../src/services/products.service.ts";

vi.mock("../src/services/products.service.ts", () => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

describe("Product controller - CRUD operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============ LIST PRODUCTS ============
  it("should list all products with pagination", async () => {
    const mockProducts = {
      data: [
        {
          id: "prod-1",
          name: "Camiseta Premium",
          description: "Camiseta de qualidade",
          price: 99.99,
          stock: 50,
          slug: "camiseta-premium",
          active: true,
          createdAt: new Date(),
          size: ["P", "M", "G"],
          color: "azul",
          imageUrl: null,
          categoryId: "cat-1",
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    (getProducts as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockProducts);

    const request = {
      query: { page: 1, limit: 10 },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await listProducts(request, reply);

    expect(getProducts).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(mockProducts);
  });

  // ============ GET PRODUCT BY ID ============
  it("should get a product by ID", async () => {
    const mockProduct = {
      id: "prod-1",
      name: "Camiseta Premium",
      description: "Camiseta de qualidade",
      price: 99.99,
      stock: 50,
      slug: "camiseta-premium",
      active: true,
      createdAt: new Date(),
      size: ["P", "M", "G"],
      color: "azul",
      imageUrl: null,
      categoryId: "cat-1",
      category: { id: "cat-1", name: "Camisetas" },
    };

    (getProductById as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockProduct);

    const request = {
      params: { id: "prod-1" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await getProduct(request, reply);

    expect(getProductById).toHaveBeenCalledWith("prod-1");
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(mockProduct);
  });

  it("should fail when product not found", async () => {
    (getProductById as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Produto não encontrado"));

    const request = {
      params: { id: "nonexistent" },
    } as any;

    const reply = {} as any;

    await expect(getProduct(request, reply)).rejects.toThrow("Produto não encontrado");
    expect(getProductById).toHaveBeenCalledWith("nonexistent");
  });

  // ============ CREATE PRODUCT ============
  it("should create a new product", async () => {
    const mockNewProduct = {
      id: "prod-2",
      name: "Calça Jeans",
      description: "Calça jeans clássica",
      price: 149.99,
      stock: 30,
      slug: "calca-jeans",
      active: true,
      createdAt: new Date(),
      size: ["P", "M", "G"],
      color: "preto",
      imageUrl: null,
      categoryId: "cat-2",
    };

    (createProduct as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockNewProduct);

    const request = {
      body: {
        name: "Calça Jeans",
        description: "Calça jeans clássica",
        price: 149.99,
        stock: 30,
        active: true,
        sizes: ["P", "M", "G"],
        colors: "preto",
        categoryId: "cat-2",
        images: [],
      },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await createNewProduct(request, reply);

    expect(createProduct).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith({ message: "Produto criado com sucesso" });
  });

  it("should fail when creating product with duplicate slug", async () => {
    (createProduct as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Slug já existe, Escolha outro nome para o produto"),
    );

    const request = {
      body: {
        name: "Camiseta Premium",
        description: "Camiseta de qualidade",
        price: 99.99,
        stock: 50,
        active: true,
        sizes: ["P", "M", "G"],
        colors: "azul",
        categoryId: "cat-1",
        images: [],
      },
    } as any;

    const reply = {} as any;

    await expect(createNewProduct(request, reply)).rejects.toThrow("Slug já existe");
    expect(createProduct).toHaveBeenCalled();
  });

  // ============ UPDATE PRODUCT ============
  it("should update an existing product", async () => {
    const updatedProduct = {
      id: "prod-1",
      name: "Camiseta Premium Updated",
      description: "Descrição atualizada",
      price: 109.99,
      stock: 45,
      slug: "camiseta-premium-updated",
      active: true,
      createdAt: new Date(),
      size: ["P", "M", "G", "GG"],
      color: "vermelho",
      imageUrl: null,
      categoryId: "cat-1",
    };

    (updateProduct as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(updatedProduct);

    const request = {
      params: { id: "prod-1" },
      body: {
        name: "Camiseta Premium Updated",
        description: "Descrição atualizada",
        price: 109.99,
        stock: 45,
        sizes: ["P", "M", "G", "GG"],
        colors: "vermelho",
      },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await updateExistingProduct(request, reply);

    expect(updateProduct).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(updatedProduct);
  });

  it("should update a product without regenerating slug when name is absent", async () => {
    const updatedProduct = {
      id: "prod-3",
      description: "Preço atualizado",
      price: 119.99,
      stock: 40,
      slug: "camiseta-premium",
      active: true,
      createdAt: new Date(),
      size: ["P", "M", "G"],
      color: "azul",
      imageUrl: null,
      categoryId: "cat-1",
    };

    (updateProduct as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(updatedProduct);

    const request = {
      params: { id: "prod-3" },
      body: {
        description: "Preço atualizado",
        price: 119.99,
      },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await updateExistingProduct(request, reply);

    expect(updateProduct).toHaveBeenCalledWith("prod-3", { description: "Preço atualizado", price: 119.99 });
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(updatedProduct);
  });

  it("should fail when updating non-existent product", async () => {
    (updateProduct as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Produto não encontrado"));

    const request = {
      params: { id: "nonexistent" },
      body: { name: "New Name" },
    } as any;

    const reply = {} as any;

    await expect(updateExistingProduct(request, reply)).rejects.toThrow("Produto não encontrado");
    expect(updateProduct).toHaveBeenCalled();
  });

  // ============ DELETE PRODUCT ============
  it("should delete a product (soft delete)", async () => {
    (deleteProduct as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const request = {
      params: { id: "prod-1" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await deleteExistingProduct(request, reply);

    expect(deleteProduct).toHaveBeenCalledWith("prod-1");
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it("should fail when deleting non-existent product", async () => {
    (deleteProduct as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Produto não encontrado"));

    const request = {
      params: { id: "nonexistent" },
    } as any;

    const reply = {} as any;

    await expect(deleteExistingProduct(request, reply)).rejects.toThrow("Produto não encontrado");
    expect(deleteProduct).toHaveBeenCalledWith("nonexistent");
  });
});
