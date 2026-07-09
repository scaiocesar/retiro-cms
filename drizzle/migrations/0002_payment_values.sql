ALTER TYPE "pagamento_tipo" ADD VALUE IF NOT EXISTS 'FREE';--> statement-breakpoint
ALTER TABLE "participantes" ADD COLUMN IF NOT EXISTS "valor_inscricao" real;--> statement-breakpoint
ALTER TABLE "camisetas" ADD COLUMN IF NOT EXISTS "valor_pago" real;--> statement-breakpoint
ALTER TABLE "criancas" ADD COLUMN IF NOT EXISTS "pagamento" "pagamento_tipo" DEFAULT 'NAO' NOT NULL;--> statement-breakpoint
ALTER TABLE "criancas" ADD COLUMN IF NOT EXISTS "valor_pago" real;
