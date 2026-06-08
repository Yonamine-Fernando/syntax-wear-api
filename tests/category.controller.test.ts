import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createNewCategory,
  deleteExistingCategory,
  getCategory,
  listCategories,
  updateExistingCategory,
} from "../src/controllers/category.controller.ts";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../src/services/categories.service.ts";

vi.mock("../src/services/categories.service.ts", () => ({
  getCategories: vi.fn(),
  getCategoryById: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

describe("Category controller - CRUD operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list categories with pagination", async () => {
    const mockCategories = {
      data: [
        {
          id: "cat-1",
          name: "Camisetas",
          slug: "camisetas",
          description: "Categoria de camisetas",
          active: true,
          createdAt: new Date(),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    (getCategories as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategories);

    const request = {
      query: { page: 1, limit: 10 },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await listCategories(request, reply);

    expect(getCategories).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(mockCategories);
  });

  it("should return a category by ID", async () => {
    const mockCategory = {
      id: "cat-1",
      name: "Camisetas",
      slug: "camisetas",
      description: "Categoria de camisetas",
      active: true,
      createdAt: new Date(),
    };

    (getCategoryById as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategory);

    const request = {
      params: { id: "cat-1" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await getCategory(request, reply);

    expect(getCategoryById).toHaveBeenCalledWith("cat-1");
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(mockCategory);
  });

  it("should fail when category is not found", async () => {
    (getCategoryById as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Categoria não encontrada"));

    const request = {
      params: { id: "missing" },
    } as any;

    const reply = {} as any;

    await expect(getCategory(request, reply)).rejects.toThrow("Categoria não encontrada");
    expect(getCategoryById).toHaveBeenCalledWith("missing");
  });

  it("should create a new category", async () => {
    const mockCategory = {
      id: "cat-2",
      name: "Calças",
      slug: "calcas",
      description: "Categoria de calças",
      active: true,
      createdAt: new Date(),
    };

    (createCategory as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockCategory);

    const request = {
      body: {
        name: "Calças",
        description: "Categoria de calças",
        active: true,
      },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await createNewCategory(request, reply);

    expect(createCategory).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith({ message: "Categoria criada com sucesso" });
  });

  it("should fail when creating category with duplicate slug", async () => {
    (createCategory as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Slug já existe, Escolha outro nome para a categoria"),
    );

    const request = {
      body: {
        name: "Camisetas",
        description: "Categoria de camisetas",
        active: true,
      },
    } as any;

    const reply = {} as any;

    await expect(createNewCategory(request, reply)).rejects.toThrow("Slug já existe");
    expect(createCategory).toHaveBeenCalled();
  });

  it("should update an existing category", async () => {
    const updatedCategory = {
      id: "cat-1",
      name: "Camisetas Premium",
      slug: "camisetas-premium",
      description: "Categoria atualizada",
      active: true,
      createdAt: new Date(),
    };

    (updateCategory as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(updatedCategory);

    const request = {
      params: { id: "cat-1" },
      body: {
        name: "Camisetas Premium",
        description: "Categoria atualizada",
      },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await updateExistingCategory(request, reply);

    expect(updateCategory).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(updatedCategory);
  });

  it("should fail when updating a missing category", async () => {
    (updateCategory as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Categoria não encontrada"));

    const request = {
      params: { id: "missing" },
      body: { name: "Novo Nome" },
    } as any;

    const reply = {} as any;

    await expect(updateExistingCategory(request, reply)).rejects.toThrow("Categoria não encontrada");
    expect(updateCategory).toHaveBeenCalled();
  });

  it("should delete a category", async () => {
    (deleteCategory as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const request = {
      params: { id: "cat-1" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await deleteExistingCategory(request, reply);

    expect(deleteCategory).toHaveBeenCalledWith("cat-1");
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith({ message: "Categoria removida com sucesso" });
  });

  it("should fail when deleting a missing category", async () => {
    (deleteCategory as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Categoria não encontrada"));

    const request = {
      params: { id: "missing" },
    } as any;

    const reply = {} as any;

    await expect(deleteExistingCategory(request, reply)).rejects.toThrow("Categoria não encontrada");
    expect(deleteCategory).toHaveBeenCalledWith("missing");
  });
});
