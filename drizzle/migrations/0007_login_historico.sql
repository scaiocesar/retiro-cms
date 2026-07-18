CREATE TYPE "public"."login_resultado" AS ENUM('SUCESSO', 'SENHA_INVALIDA', 'BLOQUEADO', 'USUARIO_INEXISTENTE');
--> statement-breakpoint
CREATE TABLE "login_historico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"username" text NOT NULL,
	"resultado" "login_resultado" NOT NULL,
	"ip" text,
	"user_agent" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "login_historico" ADD CONSTRAINT "login_historico_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;
