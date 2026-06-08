import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOrderController,
  deleteOrderController,
  getOrder,
  listOrders,
  updateOrderController,
} from "../src/controllers/orders.controller.ts";
import { createOrder, deleteOrder, getOrderById, getOrders, updateOrder } from "../src/services/orders.service.ts";

vi.mock("../src/services/orders.service.ts", () => ({
  getOrders: vi.fn(),
  getOrderById: vi.fn(),
  createOrder: vi.fn(),
  updateOrder: vi.fn(),
  deleteOrder: vi.fn(),
}));

describe("Orders controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list orders for admin without user filter", async () => {
    const mockResponse = {
      data: [
        {
          id: "order-1",
          userId: "user-1",
          status: "PENDING",
          totalPrice: 100,
          createdAt: new Date(),
          user: { id: "user-1", firstName: "Test", lastName: "User", email: "test@example.com" },
          _count: { items: 2 },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    (getOrders as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const request = {
      query: { page: 1, limit: 10 },
      user: { userId: "admin-1", role: "ADMIN" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await listOrders(request, reply);

    expect(getOrders).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(mockResponse);
  });

  it("should list orders for normal user adding userId filter", async () => {
    const mockResponse = {
      data: [
        {
          id: "order-2",
          userId: "user-2",
          status: "PAID",
          totalPrice: 75,
          createdAt: new Date(),
          user: { id: "user-2", firstName: "Another", lastName: "User", email: "another@example.com" },
          _count: { items: 1 },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    (getOrders as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const request = {
      query: { page: 1, limit: 10 },
      user: { userId: "user-2", role: "USER" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await listOrders(request, reply);

    expect(getOrders).toHaveBeenCalledWith({ page: 1, limit: 10, userId: "user-2" });
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(mockResponse);
  });

  it("should get an order by ID when user owns the order", async () => {
    const mockOrder = {
      id: "11111111-1111-1111-8111-111111111111",
      userId: "user-3",
      status: "PENDING",
      totalPrice: 120,
      createdAt: new Date(),
      user: { id: "user-3", firstName: "Order", lastName: "Owner", email: "owner@example.com" },
      items: [],
      active: true,
    };

    (getOrderById as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrder);

    const request = {
      params: { id: "11111111-1111-1111-8111-111111111111" },
      user: { userId: "user-3", role: "USER" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await getOrder(request, reply);

    expect(getOrderById).toHaveBeenCalledWith("11111111-1111-1111-8111-111111111111");
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(mockOrder);
  });

  it("should deny accessing another user's order for non-admin", async () => {
    const mockOrder = {
      id: "22222222-2222-2222-8222-222222222222",
      userId: "user-4",
      status: "PAID",
      totalPrice: 50,
      createdAt: new Date(),
      user: { id: "user-4", firstName: "Other", lastName: "User", email: "other@example.com" },
      items: [],
      active: true,
    };

    (getOrderById as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrder);

    const request = {
      params: { id: "22222222-2222-2222-8222-222222222222" },
      user: { userId: "user-5", role: "USER" },
    } as any;

    const reply = {} as any;

    await expect(getOrder(request, reply)).rejects.toThrow("Você não tem permissão para acessar este pedido");
    expect(getOrderById).toHaveBeenCalledWith("22222222-2222-2222-8222-222222222222");
  });

  it("should create an order for the authenticated user", async () => {
    const mockOrder = {
      id: "order-5",
      userId: "user-6",
      status: "PENDING",
      totalPrice: 200,
      createdAt: new Date(),
      user: { id: "user-6", firstName: "New", lastName: "Buyer", email: "newbuyer@example.com" },
      items: [],
      active: true,
    };

    (createOrder as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrder);

    const request = {
      body: {
        items: [{ productId: "33333333-3333-3333-8333-333333333333", quantity: 2 }],
        shippingAddress: { street: "Rua A", city: "São Paulo", state: "SP", zipCode: "01000-000", country: "Brasil" },
        paymentMethod: "PIX",
      },
      user: { userId: "user-6", role: "USER" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await createOrderController(request, reply);

    expect(createOrder).toHaveBeenCalledWith("user-6", request.body);
    expect(status).toHaveBeenCalledWith(201);
    expect(send).toHaveBeenCalledWith(mockOrder);
  });

  it("should update an order for the order owner", async () => {
    const updatedOrder = {
      id: "44444444-4444-4444-8444-444444444444",
      userId: "user-7",
      status: "SHIPPED",
      totalPrice: 120,
      createdAt: new Date(),
      user: { id: "user-7", firstName: "Update", lastName: "User", email: "update@example.com" },
      items: [],
      active: true,
    };

    (updateOrder as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(updatedOrder);

    const request = {
      params: { id: "44444444-4444-4444-8444-444444444444" },
      body: { shippingAddress: { street: "Rua B", city: "Rio" } },
      user: { userId: "user-7", role: "USER" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await updateOrderController(request, reply);

    expect(updateOrder).toHaveBeenCalledWith("44444444-4444-4444-8444-444444444444", "user-7", "USER", request.body);
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(updatedOrder);
  });

  it("should delete an order as admin", async () => {
    (deleteOrder as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const request = {
      params: { id: "55555555-5555-5555-8555-555555555555" },
      user: { userId: "admin-2", role: "ADMIN" },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = { status } as any;

    await deleteOrderController(request, reply);

    expect(deleteOrder).toHaveBeenCalledWith("55555555-5555-5555-8555-555555555555", "admin-2", "ADMIN");
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it("should fail deleting someone else's order as non-admin", async () => {
    (deleteOrder as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Você não tem permissão para deletar este pedido"),
    );

    const request = {
      params: { id: "66666666-6666-6666-8666-666666666666" },
      user: { userId: "user-8", role: "USER" },
    } as any;

    const reply = {} as any;

    await expect(deleteOrderController(request, reply)).rejects.toThrow(
      "Você não tem permissão para deletar este pedido",
    );
    expect(deleteOrder).toHaveBeenCalledWith("66666666-6666-6666-8666-666666666666", "user-8", "USER");
  });
});
