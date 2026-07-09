import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "USUARIO"]);
export const pagamentoEnum = pgEnum("pagamento_tipo", ["NAO", "CASH", "VENMO", "DOACAO"]);
export const tamanhoCamisetaEnum = pgEnum("tamanho_camiseta", [
  "TODDLER",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
]);

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const eventos = pgTable("eventos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  data: text("data").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const participantes = pgTable("participantes", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventoId: uuid("evento_id")
    .notNull()
    .references(() => eventos.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  telefone: text("telefone").notNull(),
  pagamentoInscricao: pagamentoEnum("pagamento_inscricao").notNull(),
  ehServidor: boolean("eh_servidor").notNull().default(false),
  observacoes: text("observacoes"),
  checkin: boolean("checkin").notNull().default(false),
  checkinEm: timestamp("checkin_em", { withTimezone: true, mode: "string" }),
  criadoPor: uuid("criado_por")
    .notNull()
    .references(() => usuarios.id),
  criadoEm: timestamp("criado_em", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  atualizadoEm: timestamp("atualizado_em", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const camisetas = pgTable("camisetas", {
  id: uuid("id").primaryKey().defaultRandom(),
  participanteId: uuid("participante_id")
    .notNull()
    .references(() => participantes.id, { onDelete: "cascade" }),
  quantidade: integer("quantidade").notNull(),
  tamanho: tamanhoCamisetaEnum("tamanho").notNull(),
  idadeToddler: integer("idade_toddler"),
  pagamento: pagamentoEnum("pagamento").notNull(),
});

export const criancas = pgTable("criancas", {
  id: uuid("id").primaryKey().defaultRandom(),
  participanteId: uuid("participante_id")
    .notNull()
    .references(() => participantes.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  idade: integer("idade").notNull(),
});
