"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarPlus,
  Check,
  Clock,
  FileDown,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DuracaoInput } from "@/components/ui/duracao-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calcularHorarios,
  formatDuracao,
  formatMinutesToDisplay,
  parseDuracao,
  parseHorarioToMinutes,
} from "@/lib/planejamento/horarios";
import { cn } from "@/lib/utils";
import type {
  PlanejamentoAtividadeComHorario,
  PlanejamentoDiaCompleto,
} from "@/lib/types";

function displayHorario(hhmm: string): string {
  try {
    return formatMinutesToDisplay(parseHorarioToMinutes(hhmm));
  } catch {
    return hhmm;
  }
}

function replaceDia(
  dias: PlanejamentoDiaCompleto[],
  updated: PlanejamentoDiaCompleto
): PlanejamentoDiaCompleto[] {
  return dias.map((d) => (d.id === updated.id ? updated : d));
}

function SortableAtividadeCard({
  atividade,
  editing,
  saving,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  deleting,
}: {
  atividade: PlanejamentoAtividadeComHorario;
  editing: boolean;
  saving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: {
    duracao: string;
    descricao: string;
    responsavel: string;
  }) => Promise<boolean>;
  onDelete: () => void;
  deleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: atividade.id, disabled: editing });

  const [duracao, setDuracao] = useState(
    formatDuracao(atividade.duracaoMinutos)
  );
  const [descricao, setDescricao] = useState(atividade.descricao);
  const [responsavel, setResponsavel] = useState(atividade.responsavel ?? "");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function beginEdit() {
    setDuracao(formatDuracao(atividade.duracaoMinutos));
    setDescricao(atividade.descricao);
    setResponsavel(atividade.responsavel ?? "");
    onStartEdit();
  }

  async function handleSave() {
    const ok = await onSave({ duracao, descricao, responsavel });
    if (ok) onCancelEdit();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancelEdit();
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border",
        isDragging && "z-10 opacity-90 shadow-lg",
        editing && "border-primary/40 ring-1 ring-primary/20"
      )}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <button
          type="button"
          className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
          aria-label="Arrastar para reordenar"
          disabled={editing}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {editing ? (
          <div className="min-w-0 flex-1 space-y-2">
            <div className="text-sm text-muted-foreground">
              {displayHorario(atividade.horarioInicio)} –{" "}
              {displayHorario(atividade.horarioFim)}
            </div>
            <div className="grid gap-2 sm:grid-cols-[7rem_1fr_1fr]">
              <DuracaoInput
                value={duracao}
                onChange={setDuracao}
                onKeyDown={onKeyDown}
                aria-label="Duração"
                disabled={saving}
                autoFocus
              />
              <Input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Atividade"
                aria-label="Atividade"
                disabled={saving}
              />
              <Input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Responsável"
                aria-label="Responsável"
                disabled={saving}
              />
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {formatDuracao(atividade.duracaoMinutos)}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {displayHorario(atividade.horarioInicio)} –{" "}
                {displayHorario(atividade.horarioFim)}
              </span>
            </div>
            <p className="font-semibold leading-snug">{atividade.descricao}</p>
            {atividade.responsavel ? (
              <p className="text-sm text-muted-foreground">
                Responsável: {atividade.responsavel}
              </p>
            ) : null}
          </div>
        )}

        <div className="flex shrink-0 gap-1">
          {editing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void handleSave()}
                disabled={saving}
                aria-label="Salvar"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onCancelEdit}
                disabled={saving}
                aria-label="Cancelar"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={beginEdit}
                aria-label="Editar atividade"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={deleting}
                aria-label="Excluir atividade"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


function NovaAtividadeRow({
  previewInicio,
  saving,
  onSave,
}: {
  previewInicio?: string;
  saving: boolean;
  onSave: (data: {
    duracao: string;
    descricao: string;
    responsavel: string;
  }) => Promise<boolean>;
}) {
  const [duracao, setDuracao] = useState("0:20");
  const [descricao, setDescricao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const descricaoRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    const ok = await onSave({ duracao, descricao, responsavel });
    if (!ok) return;
    setDuracao("0:20");
    setDescricao("");
    setResponsavel("");
    descricaoRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <Card className="border-dashed border-primary/40 bg-muted/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span className="font-medium">Nova atividade</span>
          {previewInicio ? (
            <span>· início previsto {displayHorario(previewInicio)}</span>
          ) : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-[7rem_1fr_1fr_auto]">
          <DuracaoInput
            value={duracao}
            onChange={setDuracao}
            onKeyDown={onKeyDown}
            aria-label="Duração"
            disabled={saving}
          />
          <Input
            ref={descricaoRef}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Atividade"
            aria-label="Atividade"
            disabled={saving}
          />
          <Input
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Responsável"
            aria-label="Responsável"
            disabled={saving}
          />
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="sm:w-auto"
          >
            <Check className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlanejamentoPageClient({
  eventoId,
}: {
  eventoId: string | null;
}) {
  const [dias, setDias] = useState<PlanejamentoDiaCompleto[]>([]);
  const [selectedDiaId, setSelectedDiaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [novoDiaNome, setNovoDiaNome] = useState("Dia 1");
  const [novoDiaHorario, setNovoDiaHorario] = useState("08:00");

  const [addDiaOpen, setAddDiaOpen] = useState(false);
  const [addDiaNome, setAddDiaNome] = useState("");
  const [addDiaHorario, setAddDiaHorario] = useState("08:00");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const load = useCallback(async () => {
    if (!eventoId) {
      setDias([]);
      setSelectedDiaId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/planejamento?eventoId=${eventoId}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao carregar planejamento");
        return;
      }
      const data = json.data as PlanejamentoDiaCompleto[];
      setDias(data);
      setSelectedDiaId((prev) => {
        if (prev && data.some((d) => d.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const diaAtual = useMemo(
    () => dias.find((d) => d.id === selectedDiaId) ?? null,
    [dias, selectedDiaId]
  );

  const previewInicioNova = useMemo(() => {
    if (!diaAtual) return undefined;
    return diaAtual.horarioTermino ?? diaAtual.horarioInicio;
  }, [diaAtual]);

  async function criarDia(nome: string, horarioInicio: string) {
    if (!eventoId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/planejamento/dias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventoId, nome, horarioInicio }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao criar dia");
        return;
      }
      const dia = json.data as PlanejamentoDiaCompleto;
      setDias((prev) => [...prev, dia]);
      setSelectedDiaId(dia.id);
      toast.success("Dia criado!");
      setAddDiaOpen(false);
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  async function handleCriarPrimeiroDia() {
    await criarDia(novoDiaNome.trim() || "Dia 1", novoDiaHorario);
  }

  async function handleAdicionarDia() {
    const nome = addDiaNome.trim() || `Dia ${dias.length + 1}`;
    await criarDia(nome, addDiaHorario);
  }

  async function exportarPdf() {
    if (!eventoId) return;
    setExporting(true);
    try {
      const res = await fetch(
        `/api/planejamento/export-pdf?eventoId=${eventoId}`
      );
      if (!res.ok) {
        const text = await res.text();
        toast.error(text || "Erro ao exportar PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cronograma.pdf";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exportado com sucesso!");
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setExporting(false);
    }
  }

  async function atualizarHorarioInicio(horarioInicio: string) {
    if (!diaAtual) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/planejamento/dias/${diaAtual.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horarioInicio }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao atualizar horário");
        void load();
        return;
      }
      setDias((prev) => replaceDia(prev, json.data));
    } catch {
      toast.error("Erro de conexão");
      void load();
    } finally {
      setSaving(false);
    }
  }

  async function atualizarAtividadeInline(
    id: string,
    data: {
      duracao: string;
      descricao: string;
      responsavel: string;
    }
  ): Promise<boolean> {
    let duracaoMinutos: number;
    try {
      duracaoMinutos = parseDuracao(data.duracao);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Duração inválida");
      return false;
    }
    if (!data.descricao.trim()) {
      toast.error("Descrição obrigatória");
      return false;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/planejamento/atividades/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duracaoMinutos,
          descricao: data.descricao.trim(),
          responsavel: data.responsavel.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao salvar atividade");
        return false;
      }
      setDias((prev) => replaceDia(prev, json.data));
      toast.success("Atividade atualizada!");
      return true;
    } catch {
      toast.error("Erro de conexão");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function criarAtividadeInline(data: {
    duracao: string;
    descricao: string;
    responsavel: string;
  }): Promise<boolean> {
    if (!diaAtual) return false;
    let duracaoMinutos: number;
    try {
      duracaoMinutos = parseDuracao(data.duracao);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Duração inválida");
      return false;
    }
    if (!data.descricao.trim()) {
      toast.error("Descrição obrigatória");
      return false;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/planejamento/atividades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diaId: diaAtual.id,
          duracaoMinutos,
          descricao: data.descricao.trim(),
          responsavel: data.responsavel.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao salvar atividade");
        return false;
      }
      setDias((prev) => replaceDia(prev, json.data));
      toast.success("Atividade adicionada!");
      return true;
    } catch {
      toast.error("Erro de conexão");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function excluirAtividade(id: string) {
    if (!confirm("Excluir esta atividade?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/planejamento/atividades/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao excluir");
        return;
      }
      setDias((prev) => replaceDia(prev, json.data));
      toast.success("Atividade excluída");
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (!diaAtual) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = diaAtual.atividades.findIndex((a) => a.id === active.id);
    const newIndex = diaAtual.atividades.findIndex((a) => a.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(diaAtual.atividades, oldIndex, newIndex);
    const { atividades, horarioTermino } = calcularHorarios(
      diaAtual.horarioInicio,
      reordered
    );
    const optimistic: PlanejamentoDiaCompleto = {
      ...diaAtual,
      atividades,
      horarioTermino,
    };
    setDias((prev) => replaceDia(prev, optimistic));

    try {
      const res = await fetch("/api/planejamento/atividades/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diaId: diaAtual.id,
          orderedIds: reordered.map((a) => a.id),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao reordenar");
        void load();
        return;
      }
      setDias((prev) => replaceDia(prev, json.data));
    } catch {
      toast.error("Erro de conexão");
      void load();
    }
  }

  if (!eventoId) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Selecione um retiro ativo para planejar o cronograma.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-muted-foreground">Carregando…</p>
    );
  }

  if (dias.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planejamento</h1>
          <p className="text-sm text-muted-foreground">
            Defina o horário de início do retiro para começar a cadastrar as
            atividades.
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="nome-dia">Nome do dia</Label>
              <Input
                id="nome-dia"
                value={novoDiaNome}
                onChange={(e) => setNovoDiaNome(e.target.value)}
                placeholder="Dia 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horario-inicio">Horário de início</Label>
              <Input
                id="horario-inicio"
                type="time"
                value={novoDiaHorario}
                onChange={(e) => setNovoDiaHorario(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => void handleCriarPrimeiroDia()}
              disabled={saving}
            >
              <Clock className="h-4 w-4" />
              Iniciar planejamento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Planejamento</h1>
          <p className="text-sm text-muted-foreground">
            Arraste as atividades para reordenar. Os horários são calculados
            automaticamente.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void exportarPdf()}
            disabled={exporting || dias.length === 0}
          >
            <FileDown className="h-4 w-4" />
            {exporting ? "Gerando…" : "Imprimir PDF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAddDiaNome(`Dia ${dias.length + 1}`);
              setAddDiaHorario("08:00");
              setAddDiaOpen(true);
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            Adicionar dia
          </Button>
        </div>
      </div>

      {dias.length > 1 ? (
        <Select
          value={selectedDiaId ?? undefined}
          onValueChange={setSelectedDiaId}
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Selecione o dia" />
          </SelectTrigger>
          <SelectContent>
            {dias.map((dia) => (
              <SelectItem key={dia.id} value={dia.id}>
                {dia.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : diaAtual ? (
        <p className="text-sm font-medium">{diaAtual.nome}</p>
      ) : null}

      {diaAtual ? (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="horario-dia">Horário de início</Label>
              <Input
                id="horario-dia"
                type="time"
                className="w-36"
                value={diaAtual.horarioInicio}
                disabled={saving}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  setDias((prev) =>
                    prev.map((d) => {
                      if (d.id !== diaAtual.id) return d;
                      const { atividades, horarioTermino } = calcularHorarios(
                        value,
                        d.atividades
                      );
                      return {
                        ...d,
                        horarioInicio: value,
                        atividades,
                        horarioTermino,
                      };
                    })
                  );
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) void atualizarHorarioInicio(value);
                }}
              />
            </div>
            {diaAtual.horarioTermino ? (
              <p className="pb-2 text-sm text-muted-foreground">
                Término:{" "}
                <span className="font-medium text-foreground">
                  {displayHorario(diaAtual.horarioTermino)}
                </span>
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            {diaAtual.atividades.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => void handleDragEnd(e)}
              >
                <SortableContext
                  items={diaAtual.atividades.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {diaAtual.atividades.map((atividade) => (
                      <SortableAtividadeCard
                        key={atividade.id}
                        atividade={atividade}
                        editing={editingId === atividade.id}
                        saving={saving}
                        onStartEdit={() => setEditingId(atividade.id)}
                        onCancelEdit={() => setEditingId(null)}
                        onSave={(data) =>
                          atualizarAtividadeInline(atividade.id, data)
                        }
                        onDelete={() => void excluirAtividade(atividade.id)}
                        deleting={deletingId === atividade.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : null}

            <NovaAtividadeRow
              previewInicio={previewInicioNova}
              saving={saving}
              onSave={criarAtividadeInline}
            />
          </div>

          {diaAtual.horarioTermino ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
              Fim do dia:{" "}
              <span className="font-semibold text-foreground">
                {displayHorario(diaAtual.horarioTermino)}
              </span>
            </div>
          ) : null}
        </>
      ) : null}

      <Dialog open={addDiaOpen} onOpenChange={setAddDiaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar dia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={addDiaNome}
                onChange={(e) => setAddDiaNome(e.target.value)}
                placeholder={`Dia ${dias.length + 1}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário de início</Label>
              <Input
                type="time"
                value={addDiaHorario}
                onChange={(e) => setAddDiaHorario(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => void handleAdicionarDia()}
              disabled={saving}
            >
              Criar dia
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
