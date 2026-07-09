CREATE TYPE "public"."pagamento_tipo" AS ENUM('NAO', 'CASH', 'VENMO', 'DOACAO');--> statement-breakpoint
CREATE TYPE "public"."tamanho_camiseta" AS ENUM('TODDLER', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USUARIO');--> statement-breakpoint
CREATE TABLE "camisetas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participante_id" uuid NOT NULL,
	"quantidade" integer NOT NULL,
	"tamanho" "tamanho_camiseta" NOT NULL,
	"idade_toddler" integer,
	"pagamento" "pagamento_tipo" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "criancas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participante_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"idade" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"data" text NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"telefone" text NOT NULL,
	"pagamento_inscricao" "pagamento_tipo" NOT NULL,
	"eh_servidor" boolean DEFAULT false NOT NULL,
	"observacoes" text,
	"checkin" boolean DEFAULT false NOT NULL,
	"checkin_em" timestamp with time zone,
	"criado_por" uuid NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "camisetas" ADD CONSTRAINT "camisetas_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criancas" ADD CONSTRAINT "criancas_participante_id_participantes_id_fk" FOREIGN KEY ("participante_id") REFERENCES "public"."participantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes" ADD CONSTRAINT "participantes_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
