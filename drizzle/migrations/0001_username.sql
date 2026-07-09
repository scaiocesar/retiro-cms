ALTER TABLE "usuarios" RENAME COLUMN "email" TO "username";--> statement-breakpoint
ALTER TABLE "usuarios" RENAME CONSTRAINT "usuarios_email_unique" TO "usuarios_username_unique";
