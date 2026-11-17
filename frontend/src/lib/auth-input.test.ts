import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "./auth-input";

describe("authentication input validation", () => {
  it("normalizes registration emails", () => {
    expect(registerSchema.parse({ email: "Test@Example.COM", password: "a-strong-password" }).email).toBe("test@example.com");
  });
  it("rejects short passwords", () => {
    expect(registerSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
  });
  it("rejects unexpected registration fields", () => {
    expect(registerSchema.safeParse({ email: "a@b.com", password: "a-strong-password", isAdmin: true }).success).toBe(false);
  });
  it("accepts login credentials without applying the registration minimum", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(true);
  });
});
