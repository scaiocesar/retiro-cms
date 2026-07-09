import bcrypt from "bcryptjs";
import {
  getEventoRepository,
  getParticipanteRepository,
  getRelatorioRepository,
  getUsuarioRepository,
} from "@/lib/repositories";
import type { ParticipanteListFilters } from "@/lib/repositories/interfaces";
import type { ParticipanteInput, UsuarioSistemaInput } from "@/lib/validations/schemas";

export class AuthService {
  private usuarioRepo = getUsuarioRepository();

  async login(username: string, senha: string) {
    const user = await this.usuarioRepo.findByUsername(username);
    if (!user || !user.ativo) {
      return null;
    }
    const valid = await bcrypt.compare(senha, user.senhaHash);
    if (!valid) return null;
    return {
      userId: user.id,
      username: user.username,
      nome: user.nome,
      role: user.role,
    };
  }
}

export class UsuarioService {
  private usuarioRepo = getUsuarioRepository();

  async list() {
    return this.usuarioRepo.findAll();
  }

  async create(data: UsuarioSistemaInput) {
    const existing = await this.usuarioRepo.findByUsername(data.username);
    if (existing) {
      throw new Error("Usuário já cadastrado");
    }
    if (!data.senha) {
      throw new Error("Senha obrigatória");
    }
    const senhaHash = await bcrypt.hash(data.senha, 10);
    return this.usuarioRepo.create({ ...data, senhaHash });
  }

  async update(id: string, data: Partial<UsuarioSistemaInput>) {
    const existing = await this.usuarioRepo.findById(id);
    if (!existing) {
      throw new Error("Usuário não encontrado");
    }
    if (data.username && data.username !== existing.username) {
      const usernameTaken = await this.usuarioRepo.findByUsername(data.username);
      if (usernameTaken) {
        throw new Error("Usuário já cadastrado");
      }
    }
    let senhaHash: string | undefined;
    if (data.senha) {
      senhaHash = await bcrypt.hash(data.senha, 10);
    }
    const updated = await this.usuarioRepo.update(id, { ...data, senhaHash });
    if (!updated) throw new Error("Usuário não encontrado");
    return updated;
  }
}

export class EventoService {
  private eventoRepo = getEventoRepository();

  async list(includeInativos = true) {
    const eventos = await this.eventoRepo.findAll();
    if (includeInativos) return eventos;
    return eventos.filter((e) => e.ativo);
  }

  async listAtivos() {
    return this.eventoRepo.findAtivos();
  }

  async getById(id: string) {
    return this.eventoRepo.findById(id);
  }

  async create(data: Parameters<typeof this.eventoRepo.create>[0]) {
    return this.eventoRepo.create(data);
  }

  async update(id: string, data: Parameters<typeof this.eventoRepo.update>[1]) {
    const updated = await this.eventoRepo.update(id, data);
    if (!updated) throw new Error("Evento não encontrado");
    return updated;
  }
}

export class ParticipanteService {
  private participanteRepo = getParticipanteRepository();

  async list(eventoId: string, filters?: ParticipanteListFilters) {
    return this.participanteRepo.findByEvento(eventoId, filters);
  }

  async getById(id: string) {
    const p = await this.participanteRepo.findById(id);
    if (!p) throw new Error("Participante não encontrado");
    return p;
  }

  async create(data: ParticipanteInput, criadoPor: string) {
    return this.participanteRepo.create(data, criadoPor);
  }

  async update(id: string, data: ParticipanteInput) {
    const updated = await this.participanteRepo.update(id, data);
    if (!updated) throw new Error("Participante não encontrado");
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.participanteRepo.delete(id);
    if (!deleted) throw new Error("Participante não encontrado");
    return true;
  }

  async setCheckin(id: string, checkin: boolean) {
    const updated = await this.participanteRepo.setCheckin(id, checkin);
    if (!updated) throw new Error("Participante não encontrado");
    return updated;
  }
}

export class RelatorioService {
  private relatorioRepo = getRelatorioRepository();

  async gerar(eventoId: string) {
    const relatorio = await this.relatorioRepo.gerar(eventoId);
    if (!relatorio) throw new Error("Evento não encontrado");
    return relatorio;
  }
}
