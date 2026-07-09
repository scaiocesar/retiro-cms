"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGAMENTO_LABELS, PAGAMENTO_TIPOS, type PagamentoTipo } from "@/lib/pagamento";

export function PagamentoSelectValor({
  pagamentoLabel,
  valorLabel = "Valor pago",
  pagamento,
  valorPago,
  onPagamentoChange,
  onValorChange,
  readOnly = false,
  pagamentoId,
  valorId,
}: {
  pagamentoLabel: string;
  valorLabel?: string;
  pagamento: PagamentoTipo;
  valorPago?: number;
  onPagamentoChange: (pagamento: PagamentoTipo) => void;
  onValorChange: (valor?: number) => void;
  readOnly?: boolean;
  pagamentoId?: string;
  valorId?: string;
}) {
  const valorDisabled = readOnly || pagamento === "NAO" || pagamento === "FREE";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={pagamentoId}>{pagamentoLabel}</Label>
        <Select
          value={pagamento}
          onValueChange={(v) => onPagamentoChange(v as PagamentoTipo)}
          disabled={readOnly}
        >
          <SelectTrigger id={pagamentoId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGAMENTO_TIPOS.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {PAGAMENTO_LABELS[tipo]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={valorId}>{valorLabel}</Label>
        <Input
          id={valorId}
          type="number"
          min={0}
          step={0.01}
          placeholder="0.00"
          value={valorPago ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            onValorChange(raw === "" ? undefined : Number(raw));
          }}
          disabled={valorDisabled}
        />
      </div>
    </div>
  );
}
