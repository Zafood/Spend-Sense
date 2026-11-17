CREATE TABLE "account_link_intents" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "provider" VARCHAR(24) NOT NULL,
  "nonce_hash" CHAR(64) NOT NULL,
  "session_fingerprint" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "account_link_intents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "account_link_intents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "account_link_intents_nonce_hash_key" ON "account_link_intents"("nonce_hash");
CREATE INDEX "account_link_intents_user_id_expires_at_idx" ON "account_link_intents"("user_id", "expires_at");
