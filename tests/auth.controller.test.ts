import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { login, register } from "../src/controllers/auth.controller.ts";
import { loginUser, registerUser } from "../src/services/auth.service.ts";

vi.mock("../src/services/auth.service.ts", () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
}));

describe("Auth controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register a new user and return a token", async () => {
    const fakeUser = {
      id: "user-1",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      role: "USER",
      passwordHash: "hashed-password",
    };

    (registerUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(fakeUser);

    const request = {
      body: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        cpf: "12345678901",
        birthDate: "1990-01-01",
        phone: "12345678",
      },
      server: {
        jwt: {
          sign: vi.fn(() => "fake-jwt-token"),
        },
      },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = {
      status,
    } as any;

    await register(request, reply);

    expect(registerUser).toHaveBeenCalledWith(request.body);
    expect(request.server.jwt.sign).toHaveBeenCalledWith({ userId: fakeUser.id, role: fakeUser.role });
    expect(status).toHaveBeenCalledWith(201);
    expect(send).toHaveBeenCalledWith({
      user: {
        id: fakeUser.id,
        firstName: fakeUser.firstName,
        lastName: fakeUser.lastName,
        email: fakeUser.email,
        role: fakeUser.role,
      },
      token: "fake-jwt-token",
    });
  });

  it("should login an existing user and return a token", async () => {
    const fakeUser = {
      id: "user-2",
      firstName: "Login",
      lastName: "User",
      email: "login@example.com",
      role: "USER",
      passwordHash: "hashed-password",
    };

    (loginUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(fakeUser);

    const request = {
      body: {
        email: "login@example.com",
        password: "password123",
      },
      server: {
        jwt: {
          sign: vi.fn(() => "fake-login-token"),
        },
      },
    } as any;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const reply = {
      status,
    } as any;

    await login(request, reply);

    expect(loginUser).toHaveBeenCalledWith(request.body);
    expect(request.server.jwt.sign).toHaveBeenCalledWith({ userId: fakeUser.id, role: fakeUser.role });
    expect(status).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith({
      user: {
        id: fakeUser.id,
        firstName: fakeUser.firstName,
        lastName: fakeUser.lastName,
        email: fakeUser.email,
        role: fakeUser.role,
      },
      token: "fake-login-token",
    });
  });
});
