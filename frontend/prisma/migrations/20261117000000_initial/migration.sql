CREATE TYPE "TransactionKind" AS ENUM ('INCOME', 'EXPENSE');

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "password_hash" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "savings_goals" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "target_amount" DECIMAL(12,2) NOT NULL,
  "current_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "target_date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "savings_goals_target_amount_check" CHECK ("target_amount" > 0),
  CONSTRAINT "savings_goals_current_amount_check" CHECK ("current_amount" >= 0)
);
CREATE INDEX "savings_goals_user_id_idx" ON "savings_goals"("user_id");

CREATE TABLE "transactions" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "kind" "TransactionKind" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "description" VARCHAR(500),
  "occurred_on" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "transactions_amount_check" CHECK ("amount" > 0)
);
CREATE INDEX "transactions_user_id_occurred_on_idx" ON "transactions"("user_id", "occurred_on");
