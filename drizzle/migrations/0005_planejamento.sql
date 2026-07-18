CREATE TABLE "planejamento_dias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"ordem" integer NOT NULL,
	"horario_inicio" text NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planejamento_atividades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dia_id" uuid NOT NULL,
	"duracao_minutos" integer NOT NULL,
	"descricao" text NOT NULL,
	"responsavel" text,
	"ordem" integer NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "planejamento_dias" ADD CONSTRAINT "planejamento_dias_evento_id_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "planejamento_atividades" ADD CONSTRAINT "planejamento_atividades_dia_id_planejamento_dias_id_fk" FOREIGN KEY ("dia_id") REFERENCES "public"."planejamento_dias"("id") ON DELETE cascade ON UPDATE no action;
