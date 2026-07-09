import { phoneDigits } from "@/lib/phone-mask";

export const MIN_SEARCH_LENGTH = 3;

export function isSearchActive(term: string): boolean {
  return term.trim().length >= MIN_SEARCH_LENGTH;
}

export function normalizeSearchTerm(term: string): string | undefined {
  const trimmed = term.trim();
  return isSearchActive(trimmed) ? trimmed : undefined;
}

export function matchesParticipanteSearch(
  nome: string,
  telefone: string,
  rawTerm: string
): boolean {
  const term = rawTerm.trim().toLowerCase();
  if (!isSearchActive(term)) return false;

  const nameMatch = nome.toLowerCase().includes(term);

  const phoneTerm = phoneDigits(rawTerm);
  const phoneMatch =
    phoneTerm.length >= MIN_SEARCH_LENGTH &&
    phoneDigits(telefone).includes(phoneTerm);

  return nameMatch || phoneMatch;
}
