"use client";

import { useEffect, useState } from "react";

type Budget = {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
};

export default function Home() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");

  // Load saved budgets when the page opens.
  useEffect(() => {
    try {
      const savedBudgets = localStorage.getItem("spend-sense-budgets");

      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
    } catch {
      setError("Could not load saved budgets.");
    }
  }, []);

  // Save budgets whenever the list changes.
  useEffect(() => {
    localStorage.setItem("spend-sense-budgets", JSON.stringify(budgets));
  }, [budgets]);

  function addBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const target = Number(targetAmount);
    const current = Number(currentAmount);

    if (!name.trim()) {
      setError("Please enter a budget name.");
      return;
    }

    if (!targetAmount || !Number.isFinite(target) || target <= 0) {
      setError("Target amount must be greater than zero.");
      return;
    }

    if (currentAmount === "" || !Number.isFinite(current) || current < 0) {
      setError("Current amount cannot be negative or empty.");
      return;
    }

    if (!targetDate || targetDate <= new Date().toISOString().split("T")[0]) {
      setError("Please select a future target date.");
      return;
    }

    const newBudget: Budget = {
      id: Date.now(),
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate,
    };

    setBudgets((previous) => [...previous, newBudget]);

    // Clear the form.
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setTargetDate("");
  }

  function deleteBudget(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (confirmed) {
      setBudgets((previous) => previous.filter((budget) => budget.id !== id));
    }
  }

  function calculateMonthlySavings(budget: Budget) {
    const remaining = Math.max(0, budget.targetAmount - budget.currentAmount);

    const daysRemaining = Math.max(
      1,
      Math.ceil(
        (new Date(budget.targetDate + "T12:00:00").getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

    return remaining / monthsRemaining;
  }

  return (
    <main>
      <h1>Spend Sense</h1>
      <p>Manage your budgets and savings goals.</p>

      <hr />

      <h2>Add a Budget</h2>

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
            step="0.01"
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
            step="0.01"
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
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Create Budget</button>
      </form>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      <hr />

      <h2>Your Budgets</h2>

      {budgets.length === 0 ? (
        <p>No budgets exist yet. Create your first budget above.</p>
      ) : (
        budgets.map((budget) => {
          const remaining = Math.max(
            0,
            budget.targetAmount - budget.currentAmount,
          );

          const progress = Math.min(
            100,
            (budget.currentAmount / budget.targetAmount) * 100,
          );

          return (
            <section key={budget.id}>
              <h3>{budget.name}</h3>

              <p>Target Amount: ${budget.targetAmount.toFixed(2)}</p>

              <p>Amount Saved / Spent: ${budget.currentAmount.toFixed(2)}</p>

              <p>Remaining: ${remaining.toFixed(2)}</p>

              <p>Target Date: {budget.targetDate}</p>

              <p>Progress: {progress.toFixed(1)}%</p>

              <p>
                Required Monthly Savings: $
                {calculateMonthlySavings(budget).toFixed(2)}
              </p>

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
