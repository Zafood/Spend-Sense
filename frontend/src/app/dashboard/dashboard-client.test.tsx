import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Home from "./dashboard-client";

const saved = {
  id: "550e8400-e29b-41d4-a716-446655440000", name: "New Car",
  targetAmount: 5000, currentAmount: 500, targetDate: "2027-12-31",
};

beforeEach(() => {
  cleanup();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("authenticated dashboard", () => {
  it("retrieves savings goals from the authenticated API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => [saved] } as Response);
    render(<Home />);
    expect(await screen.findByRole("heading", { name: "New Car" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/savings-goals", { cache: "no-store" });
  });
  it("creates a savings goal through the database API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => [] } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => saved } as Response);
    render(<Home />);
    fireEvent.change(screen.getByLabelText("Budget / Savings Goal Name"), { target: { value: "New Car" } });
    fireEvent.change(screen.getByLabelText("Target Amount ($)"), { target: { value: "5000" } });
    fireEvent.change(screen.getByLabelText("Amount Already Saved / Spent ($)"), { target: { value: "500" } });
    fireEvent.change(screen.getByLabelText("Target Date"), { target: { value: "2027-12-31" } });
    fireEvent.click(screen.getByRole("button", { name: "Create Budget" }));
    expect(await screen.findByRole("heading", { name: "New Car" })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/savings-goals", expect.objectContaining({ method: "POST" }));
  });
  it("does not use browser localStorage for private goals", async () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    render(<Home />);
    await screen.findByText("No budgets exist yet. Create your first budget above.");
    expect(spy).not.toHaveBeenCalled();
  });
});
