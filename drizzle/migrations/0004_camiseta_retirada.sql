ALTER TABLE "camisetas" ADD COLUMN "retirada" boolean DEFAULT false NOT NULL;
ALTER TABLE "camisetas" ADD COLUMN "retirada_em" timestamp with time zone;
