"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatPhone } from "@/lib/phone-mask";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CollapsibleSection } from "@/components/ui/collapsible";
import { PagamentoSelectValor } from "@/components/forms/pagamento-select-valor";
import {
  CamisetaSizePicker,
  camisetasToPickerValue,
  createEmptyCamisetasPickerValue,
  pickerValueToCamisetas,
  type CamisetaFormItem,
  type CamisetasPickerValue,
} from "@/components/forms/camiseta-size-picker";
import type { PagamentoCrianca, PagamentoInscricao, ParticipanteCompleto } from "@/lib/types";

export type { CamisetaFormItem } from "@/components/forms/camiseta-size-picker";

export interface CriancaFormItem {
  nome: string;
  idade: number;
  pagamento: PagamentoCrianca;
  valorPago?: number;
}

export interface ParticipanteFormData {
  nome: string;
  telefone: string;
  pagamentoInscricao: PagamentoInscricao;
  valorInscricao?: number;
  ehServidor: boolean;
  observacoes: string;
  camisetas: CamisetaFormItem[];
  criancas: CriancaFormItem[];
}

const emptyCrianca = (): CriancaFormItem => ({
  nome: "",
  idade: 0,
  pagamento: "NAO",
});

export function participanteToFormData(p: ParticipanteCompleto): ParticipanteFormData {
  return {
    nome: p.nome,
    telefone: formatPhone(p.telefone),
    pagamentoInscricao: p.pagamentoInscricao,
    valorInscricao: p.valorInscricao,
    ehServidor: p.ehServidor,
    observacoes: p.observacoes ?? "",
    camisetas: p.camisetas.map((c) => ({
      quantidade: c.quantidade,
      tamanho: c.tamanho,
      idadeToddler: c.idadeToddler,
      pagamento: c.pagamento,
      valorPago: c.valorPago,
    })),
    criancas: p.criancas.map((c) => ({
      nome: c.nome,
      idade: c.idade,
      pagamento: c.pagamento,
      valorPago: c.valorPago,
    })),
  };
}

export function ParticipanteForm({
  initialData,
  onSubmit,
  loading,
  readOnly = false,
}: {
  initialData?: ParticipanteFormData;
  onSubmit: (data: ParticipanteFormData) => Promise<void>;
  loading?: boolean;
  readOnly?: boolean;
}) {
  const [form, setForm] = useState<ParticipanteFormData>(
    initialData ?? {
      nome: "",
      telefone: "",
      pagamentoInscricao: "NAO",
      ehServidor: false,
      observacoes: "",
      camisetas: [],
      criancas: [],
    }
  );
  const [camisetasPicker, setCamisetasPicker] = useState<CamisetasPickerValue>(
    initialData
      ? camisetasToPickerValue(initialData.camisetas)
      : createEmptyCamisetasPickerValue()
  );

  function updateField<K extends keyof ParticipanteFormData>(
    key: K,
    value: ParticipanteFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      ...form,
      camisetas: pickerValueToCamisetas(camisetasPicker),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CollapsibleSection title="Dados básicos">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              required
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <PhoneInput
              value={form.telefone}
              onChange={(v) => updateField("telefone", v)}
              required
              disabled={readOnly}
            />
          </div>
          <div className="sm:col-span-2">
            <PagamentoSelectValor
              pagamentoLabel="Pagamento inscrição"
              pagamento={form.pagamentoInscricao}
              valorPago={form.valorInscricao}
              onPagamentoChange={(pagamento) => {
                updateField("pagamentoInscricao", pagamento);
                if (pagamento === "NAO" || pagamento === "FREE") {
                  updateField("valorInscricao", undefined);
                }
              }}
              onValorChange={(valor) => updateField("valorInscricao", valor)}
              readOnly={readOnly}
              pagamentoId="pagamento-inscricao"
              valorId="valor-inscricao"
            />
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch
              checked={form.ehServidor}
              onCheckedChange={(v) => updateField("ehServidor", v)}
              disabled={readOnly}
            />
            <Label>Servidor</Label>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea
              value={form.observacoes}
              onChange={(e) => updateField("observacoes", e.target.value)}
              placeholder="Alergias, necessidades especiais..."
              disabled={readOnly}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Camisetas" defaultOpen={false}>
        <CamisetaSizePicker
          value={camisetasPicker}
          onChange={setCamisetasPicker}
          readOnly={readOnly}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Crianças" defaultOpen={false}>
        <div className="space-y-4">
          {form.criancas.map((crianca, index) => (
            <div key={index} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Criança {index + 1}</span>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateField(
                        "criancas",
                        form.criancas.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={crianca.nome}
                    onChange={(e) => {
                      const updated = [...form.criancas];
                      updated[index] = { ...crianca, nome: e.target.value };
                      updateField("criancas", updated);
                    }}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input
                    type="number"
                    min={0}
                    max={17}
                    value={crianca.idade}
                    onChange={(e) => {
                      const updated = [...form.criancas];
                      updated[index] = { ...crianca, idade: Number(e.target.value) };
                      updateField("criancas", updated);
                    }}
                    required
                    disabled={readOnly}
                  />
                </div>
                <div className="sm:col-span-2">
                  <PagamentoSelectValor
                    pagamentoLabel="Pagamento"
                    pagamento={crianca.pagamento}
                    valorPago={crianca.valorPago}
                    onPagamentoChange={(pagamento) => {
                      const updated = [...form.criancas];
                      updated[index] = {
                        ...crianca,
                        pagamento,
                        valorPago:
                          pagamento === "NAO" || pagamento === "FREE"
                            ? undefined
                            : crianca.valorPago,
                      };
                      updateField("criancas", updated);
                    }}
                    onValorChange={(valor) => {
                      const updated = [...form.criancas];
                      updated[index] = { ...crianca, valorPago: valor };
                      updateField("criancas", updated);
                    }}
                    readOnly={readOnly}
                    pagamentoId={`crianca-pagamento-${index}`}
                    valorId={`crianca-valor-${index}`}
                  />
                </div>
              </div>
            </div>
          ))}
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              onClick={() => updateField("criancas", [...form.criancas, emptyCrianca()])}
            >
              <Plus className="h-4 w-4" />
              Adicionar criança
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {!readOnly && (
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      )}
    </form>
  );
}
