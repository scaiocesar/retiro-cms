import { z } from "zod";
import { isValidPhone } from "@/lib/phone-mask";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

export const usuarioSistemaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Email inválido"),
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
    idadeToddler: z.number().int().min(1).max(6).optional(),
    pagamento: z.enum(["NAO", "CASH", "VENMO", "DOACAO"]),
  })
  .refine(
    (data) => data.tamanho !== "TODDLER" || (data.idadeToddler !== undefined && data.idadeToddler >= 1),
    { message: "Idade obrigatória para cada camiseta Toddler", path: ["idadeToddler"] }
  );

export const criancaInputSchema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  idade: z.number().int().min(0).max(17),
});

export const participanteSchema = z.object({
  eventoId: z.string().uuid("Evento inválido"),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z
    .string()
    .refine(isValidPhone, "Telefone inválido. Use o formato (123)456-7890"),
  pagamentoInscricao: z.enum(["NAO", "CASH", "VENMO", "DOACAO"]),
  ehServidor: z.boolean(),
  observacoes: z.string().optional(),
  camisetas: z.array(camisetaInputSchema).default([]),
  criancas: z.array(criancaInputSchema).default([]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UsuarioSistemaInput = z.infer<typeof usuarioSistemaSchema>;
export type EventoInput = z.infer<typeof eventoSchema>;
export type ParticipanteInput = z.infer<typeof participanteSchema>;
