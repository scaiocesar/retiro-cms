import bcrypt from "bcryptjs";
import { calcularHorarios } from "@/lib/planejamento/horarios";
import {
  getEventoRepository,
  getParticipanteRepository,
  getPlanejamentoRepository,
  getRelatorioRepository,
  getUsuarioRepository,
} from "@/lib/repositories";
import type { ParticipanteListFilters } from "@/lib/repositories/interfaces";
import type {
  ParticipanteInput,
  PlanejamentoAtividadeInput,
  PlanejamentoAtividadeUpdateInput,
  PlanejamentoDiaInput,
  PlanejamentoDiaUpdateInput,
  UsuarioSistemaInput,
} from "@/lib/validations/schemas";
import type { PlanejamentoDiaCompleto } from "@/lib/types";

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

  async setCamisetaRetirada(camisetaId: string, retirada: boolean) {
    const updated = await this.participanteRepo.setCamisetaRetirada(camisetaId, retirada);
    if (!updated) throw new Error("Camiseta não encontrada");
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

export class PlanejamentoService {
  private planejamentoRepo = getPlanejamentoRepository();
  private eventoRepo = getEventoRepository();

  private async enrichDia(
    dia: NonNullable<Awaited<ReturnType<typeof this.planejamentoRepo.findDiaById>>>,
    atividades: Awaited<ReturnType<typeof this.planejamentoRepo.findAtividadesByDia>>
  ): Promise<PlanejamentoDiaCompleto> {
    const { atividades: comHorario, horarioTermino } = calcularHorarios(
      dia.horarioInicio,
      atividades
    );
    return {
      ...dia,
      atividades: comHorario,
      horarioTermino,
    };
  }

  async listByEvento(eventoId: string): Promise<PlanejamentoDiaCompleto[]> {
    const evento = await this.eventoRepo.findById(eventoId);
    if (!evento) throw new Error("Evento não encontrado");

    const dias = await this.planejamentoRepo.findDiasByEvento(eventoId);
    const atividades = await this.planejamentoRepo.findAtividadesByDias(
      dias.map((d) => d.id)
    );
    const byDia = new Map<string, typeof atividades>();
    for (const a of atividades) {
      const list = byDia.get(a.diaId) ?? [];
      list.push(a);
      byDia.set(a.diaId, list);
    }

    return Promise.all(
      dias.map((dia) => this.enrichDia(dia, byDia.get(dia.id) ?? []))
    );
  }

  async createDia(data: PlanejamentoDiaInput): Promise<PlanejamentoDiaCompleto> {
    const evento = await this.eventoRepo.findById(data.eventoId);
    if (!evento) throw new Error("Evento não encontrado");
    const dia = await this.planejamentoRepo.createDia(data);
    return this.enrichDia(dia, []);
  }

  async updateDia(
    id: string,
    data: PlanejamentoDiaUpdateInput
  ): Promise<PlanejamentoDiaCompleto> {
    const updated = await this.planejamentoRepo.updateDia(id, data);
    if (!updated) throw new Error("Dia não encontrado");
    const atividades = await this.planejamentoRepo.findAtividadesByDia(id);
    return this.enrichDia(updated, atividades);
  }

  async deleteDia(id: string) {
    const deleted = await this.planejamentoRepo.deleteDia(id);
    if (!deleted) throw new Error("Dia não encontrado");
    return true;
  }

  async createAtividade(data: PlanejamentoAtividadeInput) {
    const dia = await this.planejamentoRepo.findDiaById(data.diaId);
    if (!dia) throw new Error("Dia não encontrado");
    await this.planejamentoRepo.createAtividade(data);
    const atividades = await this.planejamentoRepo.findAtividadesByDia(data.diaId);
    return this.enrichDia(dia, atividades);
  }

  async updateAtividade(id: string, data: PlanejamentoAtividadeUpdateInput) {
    const existing = await this.planejamentoRepo.findAtividadeById(id);
    if (!existing) throw new Error("Atividade não encontrada");
    const updated = await this.planejamentoRepo.updateAtividade(id, data);
    if (!updated) throw new Error("Atividade não encontrada");
    const dia = await this.planejamentoRepo.findDiaById(updated.diaId);
    if (!dia) throw new Error("Dia não encontrado");
    const atividades = await this.planejamentoRepo.findAtividadesByDia(dia.id);
    return this.enrichDia(dia, atividades);
  }

  async deleteAtividade(id: string) {
    const existing = await this.planejamentoRepo.findAtividadeById(id);
    if (!existing) throw new Error("Atividade não encontrada");
    const deleted = await this.planejamentoRepo.deleteAtividade(id);
    if (!deleted) throw new Error("Atividade não encontrada");
    const dia = await this.planejamentoRepo.findDiaById(existing.diaId);
    if (!dia) throw new Error("Dia não encontrado");
    const atividades = await this.planejamentoRepo.findAtividadesByDia(dia.id);
    return this.enrichDia(dia, atividades);
  }

  async reorderAtividades(diaId: string, orderedIds: string[]) {
    const dia = await this.planejamentoRepo.findDiaById(diaId);
    if (!dia) throw new Error("Dia não encontrado");
    const atividades = await this.planejamentoRepo.reorderAtividades(
      diaId,
      orderedIds
    );
    return this.enrichDia(dia, atividades);
  }
}
