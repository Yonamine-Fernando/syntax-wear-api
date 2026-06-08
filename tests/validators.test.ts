import { describe, expect, it } from "vitest";
import { orderParamSchema, productListSchema } from "../src/utils/validators.ts";

describe("Validators", () => {
  it("should parse product filters with comma-separated sizes and colors", () => {
    const result = productListSchema.parse({
      page: "2",
      limit: "20",
      sizes: "P, M, G",
      colors: "azul, vermelho",
      search: "camiseta",
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(20);
    expect(result.sizes).toEqual(["P", "M", "G"]);
    expect(result.colors).toEqual(["azul", "vermelho"]);
    expect(result.search).toBe("camiseta");
  });

  it("should reject an invalid order ID", () => {
    expect(() => orderParamSchema.parse({ id: "invalid-id" })).toThrow("ID do pedido inválido");
  });
});
