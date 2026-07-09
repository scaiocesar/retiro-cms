import type {
  Camiseta,
  Crianca,
  Evento,
  Participante,
  UsuarioSistema,
} from "@/lib/types";

class InMemoryStore {
  private static instance: InMemoryStore;
  usuarios = new Map<string, UsuarioSistema>();
  eventos = new Map<string, Evento>();
  participantes = new Map<string, Participante>();
  camisetas = new Map<string, Camiseta>();
  criancas = new Map<string, Crianca>();
  seeded = false;

  static getInstance(): InMemoryStore {
    if (!InMemoryStore.instance) {
      InMemoryStore.instance = new InMemoryStore();
    }
    return InMemoryStore.instance;
  }

  reset() {
    this.usuarios.clear();
    this.eventos.clear();
    this.participantes.clear();
    this.camisetas.clear();
    this.criancas.clear();
    this.seeded = false;
  }
}

export const store = InMemoryStore.getInstance();

declare global {
  var __retiroStore: InMemoryStore | undefined;
}

export function getStore(): InMemoryStore {
  if (process.env.NODE_ENV !== "production") {
    if (!global.__retiroStore) {
      global.__retiroStore = InMemoryStore.getInstance();
    }
    return global.__retiroStore;
  }
  return store;
}
