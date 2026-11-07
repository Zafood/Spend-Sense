"use client";

import { useEffect, useState } from "react";

// Defines the information stored for each budget.
type Budget = {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
};

export default function Home() {
  // Stores the user's budgets and form information.
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");

  // Tracks when saved data and today's date have loaded.
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState("");

  // Loads saved budgets and today's date when the page opens.
  useEffect(() => {
    // Gets today's date using the computer's local timezone.
    const now = new Date();
    const localDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    setToday(localDate);

    // Loads previously saved budgets from browser storage.
    try {
      const savedBudgets = localStorage.getItem("spend-sense-budgets");

      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
    } catch {
      setError("Could not load saved budgets.");
    } finally {
      setLoaded(true);
    }
  }, []);

  // Saves budgets whenever the list changes.
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("spend-sense-budgets", JSON.stringify(budgets));
  }, [budgets, loaded]);

  // Validates the form and creates a new budget.
  function addBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const target = Number(targetAmount);
    const current = Number(currentAmount);

    // Checks that the budget name is not empty.
    if (!name.trim()) {
      setError("Please enter a budget name.");
      return;
    }

    // Checks that the target amount is valid.
    if (!targetAmount || !Number.isFinite(target) || target <= 0) {
      setError("Target amount must be greater than zero.");
      return;
    }

    // Checks that the current amount is valid.
    if (currentAmount === "" || !Number.isFinite(current) || current < 0) {
      setError("Current amount cannot be negative or empty.");
      return;
    }

    // Checks that the target date is in the future.
    if (!targetDate || targetDate <= today) {
      setError("Please select a future target date.");
      return;
    }

    // Creates a new budget using the form information.
    const newBudget: Budget = {
      id: Date.now(),
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate,
    };

    // Adds the new budget to the dashboard.
    setBudgets((previous) => [...previous, newBudget]);

    // Clears the form after successful submission.
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setTargetDate("");
  }

  // Deletes a budget after user confirmation.
  function deleteBudget(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (confirmed) {
      setBudgets((previous) => previous.filter((budget) => budget.id !== id));
    }
  }

  // Calculates the monthly savings needed to reach a goal.
  function calculateMonthlySavings(budget: Budget) {
    const remaining = Math.max(0, budget.targetAmount - budget.currentAmount);

    // Calculates the number of days until the target date.
    const startDate = new Date(today + "T12:00:00");
    const endDate = new Date(budget.targetDate + "T12:00:00");

    const daysRemaining = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    // Converts the remaining days into months.
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

    return remaining / monthsRemaining;
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
          // Calculates the remaining amount and progress.
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
