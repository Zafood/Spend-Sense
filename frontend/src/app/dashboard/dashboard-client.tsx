"use client";

import { useEffect, useState } from "react";
import {
  type Budget,
  validateBudget,
  calculateRemaining,
  calculateProgress,
  calculateMonthlySavings,
} from "@/lib/budget";

function localToday(): string {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

export function Home() {

  // Stores the user's budgets and form information.
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");

  // Tracks today's date for the savings calculator.
  const [today] = useState(localToday);

  // Loads saved budgets and today's date when the page opens.
  useEffect(() => {
    async function loadBudgets() {
      try {
        const response = await fetch("/api/savings-goals", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const saved: unknown = await response.json();
        if (!Array.isArray(saved)) throw new Error();
        setBudgets(saved as Budget[]);
      } catch {
        setError("Could not load saved budgets.");
      }
    }
    void loadBudgets();
  }, []);

  // Validates the form and creates a new budget.
  async function addBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const target = Number(targetAmount);
    const current = Number(currentAmount);

    // Checks the form information before creating a budget.
    const validationError = validateBudget(
      name,
      target,
      current,
      targetDate,
      today,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    let newBudget: Budget = {
      id: Date.now(), name: name.trim(), targetAmount: target,
      currentAmount: current, targetDate,
    };

    try {
      const response = await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBudget.name, targetAmount: target, currentAmount: current, targetDate }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error ?? "Could not save budget.");
        return;
      }
      newBudget = await response.json();
    } catch {
      setError("Could not save budget.");
      return;
    }

    setBudgets((previous) => [...previous, newBudget]);

    // Clears the form after successful submission.
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setTargetDate("");
  }

  // Deletes a budget after user confirmation.
  async function deleteBudget(id: number | string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (!confirmed) return;
    try {
      const response = await fetch(`/api/savings-goals/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
    } catch {
      setError("Could not delete budget.");
      return;
    }
    setBudgets((previous) => previous.filter((budget) => budget.id !== id));
  }

  return (
    <main>
      <h1>Spend Sense</h1>
      <p>Manage your budgets and savings goals.</p>

      <hr />

      <h2>Add a Budget</h2>

      {/* Form for creating a new budget. */}
      <form onSubmit={addBudget}>
        <div>
          <label htmlFor="name">Budget / Savings Goal Name</label>
          <br />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: New Car"
          />
        </div>

        <br />

        <div>
          <label htmlFor="targetAmount">Target Amount ($)</label>
          <br />
          <input
            id="targetAmount"
            type="number"
            min="0.01"
            step="any"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label htmlFor="currentAmount">
            Amount Already Saved / Spent ($)
          </label>
          <br />
          <input
            id="currentAmount"
            type="number"
            min="0"
            step="any"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label htmlFor="targetDate">Target Date</label>
          <br />
          <input
            id="targetDate"
            type="date"
            value={targetDate}
            min={today}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Create Budget</button>
      </form>

      {/* Displays validation errors when necessary. */}
      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      <hr />

      <h2>Your Budgets</h2>

      {/* Displays a message when no budgets exist. */}
      {budgets.length === 0 ? (
        <p>No budgets exist yet. Create your first budget above.</p>
      ) : (
        budgets.map((budget) => {
          // Uses the shared functions to calculate budget progress.
          const remaining = calculateRemaining(budget);
          const progress = calculateProgress(budget);
          const monthlySavings = calculateMonthlySavings(budget, today);

          return (
            <section key={budget.id}>
              <h3>{budget.name}</h3>

              <p>Target Amount: ${budget.targetAmount.toFixed(2)}</p>

              <p>Amount Saved / Spent: ${budget.currentAmount.toFixed(2)}</p>

              <p>Remaining: ${remaining.toFixed(2)}</p>

              <p>Target Date: {budget.targetDate}</p>

              <p>Progress: {progress.toFixed(1)}%</p>

              <p>Required Monthly Savings: ${monthlySavings.toFixed(2)}</p>

              {/* Allows the user to delete this budget. */}
              <button type="button" onClick={() => deleteBudget(budget.id)}>
                Delete Budget
              </button>

              <hr />
            </section>
          );
        })
      )}
    </main>
  );
}
export default Home;
