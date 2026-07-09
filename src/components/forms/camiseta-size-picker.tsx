"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PagamentoSelectValor } from "@/components/forms/pagamento-select-valor";
import { cn } from "@/lib/utils";
import { TAMANHO_CAMISETA_LABELS, type PagamentoCamiseta, type TamanhoCamiseta } from "@/lib/types";

export interface CamisetaFormItem {
  quantidade: number;
  tamanho: TamanhoCamiseta;
  idadeToddler?: number;
  pagamento: PagamentoCamiseta;
  valorPago?: number;
}

const GRID_SIZES: TamanhoCamiseta[] = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
];

export interface CamisetasPickerValue {
  quantities: Record<TamanhoCamiseta, number>;
  pagamento: PagamentoCamiseta;
  valorPago?: number;
  toddlerIdades: (number | undefined)[];
}

export function camisetasToPickerValue(
  camisetas: CamisetaFormItem[]
): CamisetasPickerValue {
  const quantities = emptyQuantities();
  const toddlerIdades: (number | undefined)[] = [];
  let pagamento: PagamentoCamiseta = "NAO";
  let valorPago: number | undefined;

  for (const c of camisetas) {
    if (c.pagamento !== "NAO") pagamento = c.pagamento;
    if (c.valorPago !== undefined) valorPago = c.valorPago;

    if (c.tamanho === "TODDLER") {
      for (let i = 0; i < c.quantidade; i++) {
        toddlerIdades.push(c.idadeToddler);
      }
    } else {
      quantities[c.tamanho] = (quantities[c.tamanho] ?? 0) + c.quantidade;
    }
  }

  quantities.TODDLER = toddlerIdades.length;

  return { quantities, pagamento, valorPago, toddlerIdades };
}

export function pickerValueToCamisetas(value: CamisetasPickerValue): CamisetaFormItem[] {
  const items: CamisetaFormItem[] = [];

  for (const tamanho of GRID_SIZES) {
    const qty = value.quantities[tamanho] ?? 0;
    if (qty > 0) {
      items.push({
        quantidade: qty,
        tamanho,
        pagamento: value.pagamento,
        valorPago: value.valorPago,
      });
    }
  }

  for (const idade of value.toddlerIdades) {
    items.push({
      quantidade: 1,
      tamanho: "TODDLER",
      idadeToddler: idade,
      pagamento: value.pagamento,
      valorPago: value.valorPago,
    });
  }

  return items;
}

function emptyQuantities(): Record<TamanhoCamiseta, number> {
  return Object.fromEntries(
    [...GRID_SIZES, "TODDLER"].map((s) => [s, 0])
  ) as Record<TamanhoCamiseta, number>;
}

function SizeCard({
  label,
  quantity,
  onIncrement,
  onDecrement,
  readOnly,
}: {
  label: string;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center gap-1">
      <span className="text-sm font-bold tracking-wide">{label}</span>
      <div
        className={cn(
          "flex w-full flex-col items-center rounded-lg border border-border bg-card shadow-sm",
          quantity > 0 && "border-primary/40 bg-primary/5"
        )}
      >
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-full rounded-b-none rounded-t-lg hover:bg-secondary"
            onClick={onIncrement}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        <div className="flex h-12 w-full items-center justify-center text-2xl font-semibold tabular-nums">
          {quantity}
        </div>
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-full rounded-b-lg rounded-t-none hover:bg-secondary"
            onClick={onDecrement}
            disabled={quantity === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function CamisetaSizePicker({
  value,
  onChange,
  readOnly = false,
}: {
  value: CamisetasPickerValue;
  onChange: (value: CamisetasPickerValue) => void;
  readOnly?: boolean;
}) {
  function updateQty(tamanho: TamanhoCamiseta, delta: number) {
    const current = value.quantities[tamanho] ?? 0;
    const next = Math.max(0, current + delta);
    onChange({
      ...value,
      quantities: { ...value.quantities, [tamanho]: next },
    });
  }

  function updateToddlerQty(delta: number) {
    const current = [...value.toddlerIdades];
    if (delta > 0) {
      current.push(undefined);
    } else {
      current.pop();
    }
    onChange({
      ...value,
      toddlerIdades: current,
      quantities: { ...value.quantities, TODDLER: current.length },
    });
  }

  function updateToddlerIdade(index: number, idade: number | undefined) {
    const toddlerIdades = [...value.toddlerIdades];
    toddlerIdades[index] = idade;
    onChange({ ...value, toddlerIdades });
  }

  const toddlerQty = value.toddlerIdades.length;
  const totalCamisetas =
    GRID_SIZES.reduce((sum, s) => sum + (value.quantities[s] ?? 0), 0) + toddlerQty;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-2 min-w-max justify-center sm:justify-start">
          {GRID_SIZES.map((tamanho) => (
            <SizeCard
              key={tamanho}
              label={TAMANHO_CAMISETA_LABELS[tamanho]}
              quantity={value.quantities[tamanho] ?? 0}
              onIncrement={() => updateQty(tamanho, 1)}
              onDecrement={() => updateQty(tamanho, -1)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border p-4 space-y-4">
        <p className="text-sm font-medium">Toddler</p>
        <div className="flex flex-wrap items-start gap-4">
          <SizeCard
            label={TAMANHO_CAMISETA_LABELS.TODDLER}
            quantity={toddlerQty}
            onIncrement={() => updateToddlerQty(1)}
            onDecrement={() => updateToddlerQty(-1)}
            readOnly={readOnly}
          />
        </div>

        {toddlerQty > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {value.toddlerIdades.map((idade, index) => (
              <div key={index} className="space-y-2">
                <Label>Toddler {index + 1} — Idade</Label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={idade ?? ""}
                  onChange={(e) =>
                    updateToddlerIdade(
                      index,
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Idade"
                  required
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {totalCamisetas > 0 && (
        <PagamentoSelectValor
          pagamentoLabel="Pagamento camisetas"
          pagamento={value.pagamento}
          valorPago={value.valorPago}
          onPagamentoChange={(pagamento) =>
            onChange({
              ...value,
              pagamento,
              valorPago:
                pagamento === "NAO" || pagamento === "FREE" ? undefined : value.valorPago,
            })
          }
          onValorChange={(valorPago) => onChange({ ...value, valorPago })}
          readOnly={readOnly}
          pagamentoId="pagamento-camisetas"
          valorId="valor-camisetas"
        />
      )}

      {totalCamisetas > 0 && (
        <p className="text-sm text-muted-foreground">
          Total: {totalCamisetas} camiseta{totalCamisetas !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export function createEmptyCamisetasPickerValue(): CamisetasPickerValue {
  return {
    quantities: emptyQuantities(),
    pagamento: "NAO",
    toddlerIdades: [],
  };
}
