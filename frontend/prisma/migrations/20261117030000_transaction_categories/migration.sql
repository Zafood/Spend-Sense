-- Preserve existing transactions and savings goals; custom categories are separate.
CREATE TABLE "transaction_categories" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "kind" "TransactionKind" NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transaction_categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "transaction_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "transaction_categories_user_id_kind_name_key" ON "transaction_categories"("user_id", "kind", "name");
CREATE INDEX "transaction_categories_user_id_idx" ON "transaction_categories"("user_id");
