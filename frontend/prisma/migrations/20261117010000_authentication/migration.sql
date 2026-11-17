-- Add authentication identity metadata while preserving existing user IDs and savings goals.
ALTER TABLE "users"
  ADD COLUMN "name" VARCHAR(120),
  ADD COLUMN "email_verified" TIMESTAMP(3),
  ADD COLUMN "image" TEXT;

CREATE TABLE "oauth_accounts" (
  "id" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "oauth_accounts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_account_id_key" ON "oauth_accounts"("provider", "provider_account_id");
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

CREATE TABLE "auth_throttles" (
  "key" VARCHAR(100) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "window_start" TIMESTAMP(3) NOT NULL,
  "blocked_until" TIMESTAMP(3),
  CONSTRAINT "auth_throttles_pkey" PRIMARY KEY ("key")
);
