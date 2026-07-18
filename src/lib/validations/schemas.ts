import { z } from "zod";
import { isValidPhone } from "@/lib/phone-mask";
import { PAGAMENTO_TIPOS } from "@/lib/pagamento";

const usernameField = z
  .string()
  .min(3, "Usuário deve ter pelo menos 3 caracteres")
  .max(32, "Usuário deve ter no máximo 32 caracteres")
  .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e underscore")
  .transform((value) => value.toLowerCase());

const pagamentoField = z.enum(PAGAMENTO_TIPOS);

const valorPagoField = z.number().min(0, "Valor inválido").optional();

export const loginSchema = z.object({
  username: usernameField,
  senha: z.string().min(1, "Senha obrigatória"),
});

export const usuarioSistemaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  username: usernameField,
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "USUARIO"]),
  ativo: z.boolean().optional(),
});

export const eventoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  data: z.string().min(1, "Data obrigatória"),
  ativo: z.boolean().optional(),
});

export const camisetaInputSchema = z
  .object({
    quantidade: z.number().int().min(1, "Quantidade mínima é 1"),
    tamanho: z.enum([
      "TODDLER",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL",
    ]),
    idadeToddler: z.number().int().min(1).max(15).optional(),
    pagamento: pagamentoField,
    valorPago: valorPagoField,
  })
  .refine(
    (data) => data.tamanho !== "TODDLER" || (data.idadeToddler !== undefined && data.idadeToddler >= 1),
    { message: "Idade obrigatória para cada camiseta Toddler", path: ["idadeToddler"] }
  );

export const criancaInputSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  idade: z.number().int().min(0).max(17),
  pagamento: pagamentoField.default("NAO"),
  valorPago: valorPagoField,
});

export const participanteSchema = z.object({
  eventoId: z.string().uuid("Evento inválido"),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z
    .string()
    .refine(isValidPhone, "Telefone inválido. Use o formato (123)456-7890"),
  pagamentoInscricao: pagamentoField,
  valorInscricao: valorPagoField,
  ehServidor: z.boolean(),
  observacoes: z.string().optional(),
  camisetas: z.array(camisetaInputSchema).default([]),
  criancas: z.array(criancaInputSchema).default([]),
});

const horarioInicioField = z
  .string()
  .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, "Horário inválido. Use HH:mm");

export const planejamentoDiaSchema = z.object({
  eventoId: z.string().uuid("Evento inválido"),
  nome: z.string().min(1, "Nome do dia obrigatório").default("Dia 1"),
  horarioInicio: horarioInicioField,
});

export const planejamentoDiaUpdateSchema = z.object({
  nome: z.string().min(1, "Nome do dia obrigatório").optional(),
  horarioInicio: horarioInicioField.optional(),
});

export const planejamentoAtividadeSchema = z.object({
  diaId: z.string().uuid("Dia inválido"),
  duracaoMinutos: z.number().int().min(1, "Duração deve ser pelo menos 1 minuto"),
  descricao: z.string().min(1, "Descrição obrigatória"),
  responsavel: z.string().optional(),
});

export const planejamentoAtividadeUpdateSchema = z.object({
  duracaoMinutos: z.number().int().min(1, "Duração deve ser pelo menos 1 minuto").optional(),
  descricao: z.string().min(1, "Descrição obrigatória").optional(),
  responsavel: z.string().nullable().optional(),
});

export const planejamentoReorderSchema = z.object({
  diaId: z.string().uuid("Dia inválido"),
  orderedIds: z.array(z.string().uuid()).min(1, "Lista de IDs obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UsuarioSistemaInput = z.infer<typeof usuarioSistemaSchema>;
export type EventoInput = z.infer<typeof eventoSchema>;
export type ParticipanteInput = z.infer<typeof participanteSchema>;
export type PlanejamentoDiaInput = z.infer<typeof planejamentoDiaSchema>;
export type PlanejamentoDiaUpdateInput = z.infer<typeof planejamentoDiaUpdateSchema>;
export type PlanejamentoAtividadeInput = z.infer<typeof planejamentoAtividadeSchema>;
export type PlanejamentoAtividadeUpdateInput = z.infer<
  typeof planejamentoAtividadeUpdateSchema
>;
export type PlanejamentoReorderInput = z.infer<typeof planejamentoReorderSchema>;
