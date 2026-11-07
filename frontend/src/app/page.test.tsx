import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Home } from "./page";

// Resets the browser storage before each test.
beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

// Tests the dashboard functionality.
describe("Spend Sense Dashboard", () => {
  it("displays an empty dashboard", () => {
    render(<Home />);

    expect(
      screen.getByText("No budgets exist yet. Create your first budget above."),
    ).toBeInTheDocument();
  });

  it("creates and displays a budget", async () => {
    render(<Home />);

    // Enters the budget information.
    fireEvent.change(screen.getByLabelText("Budget / Savings Goal Name"), {
      target: { value: "New Car" },
    });

    fireEvent.change(screen.getByLabelText("Target Amount ($)"), {
      target: { value: "5000" },
    });

    fireEvent.change(
      screen.getByLabelText("Amount Already Saved / Spent ($)"),
      { target: { value: "500" } },
    );

    fireEvent.change(screen.getByLabelText("Target Date"), {
      target: { value: "2027-12-31" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Budget" }));

    // Checks that the budget appears.
    expect(
      await screen.findByRole("heading", { name: "New Car" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Remaining: $4500.00")).toBeInTheDocument();
  });

  it("rejects an empty budget name", () => {
    render(<Home />);

    fireEvent.change(screen.getByLabelText("Target Amount ($)"), {
      target: { value: "5000" },
    });

    fireEvent.change(screen.getByLabelText("Target Date"), {
      target: { value: "2027-12-31" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Budget" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a budget name.",
    );
  });

  it("deletes a budget", async () => {
    // Automatically confirms the delete message.
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<Home />);

    fireEvent.change(screen.getByLabelText("Budget / Savings Goal Name"), {
      target: { value: "New Car" },
    });

    fireEvent.change(screen.getByLabelText("Target Amount ($)"), {
      target: { value: "5000" },
    });

    fireEvent.change(screen.getByLabelText("Target Date"), {
      target: { value: "2027-12-31" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Budget" }));

    expect(
      await screen.findByRole("heading", { name: "New Car" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete Budget" }));

    expect(
      screen.getByText("No budgets exist yet. Create your first budget above."),
    ).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it("saves budgets to localStorage", async () => {
    render(<Home />);

    fireEvent.change(screen.getByLabelText("Budget / Savings Goal Name"), {
      target: { value: "Vacation" },
    });

    fireEvent.change(screen.getByLabelText("Target Amount ($)"), {
      target: { value: "2000" },
    });

    fireEvent.change(screen.getByLabelText("Target Date"), {
      target: { value: "2027-12-31" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Budget" }));

    expect(
      await screen.findByRole("heading", { name: "Vacation" }),
    ).toBeInTheDocument();

    // Checks that the budget was saved.
    const saved = JSON.parse(
      window.localStorage.getItem("spend-sense-budgets") || "[]",
    );

    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Vacation");
  });
});
