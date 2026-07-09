import type { ParticipanteCompleto } from "@/lib/types";

const STORAGE_KEY = "retiro-cms:participantes-list-state";

export interface ParticipantesListState {
  search: string;
  pagamentoFilter: string;
  servidorFilter: string;
  participantes: ParticipanteCompleto[];
  hasSearched: boolean;
}

export function saveParticipantesListState(state: ParticipantesListState): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadParticipantesListState(): ParticipantesListState | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ParticipantesListState;
  } catch {
    return null;
  }
}

export function clearParticipantesListState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
