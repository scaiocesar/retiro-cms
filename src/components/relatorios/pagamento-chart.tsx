"use client";

import { cn } from "@/lib/utils";

const COLORS = {
  cash: "#16a34a",
  venmo: "#2563eb",
  naoPagos: "#dc2626",
  doacao: "#9333ea",
};

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

export function PagamentoChart({
  cash,
  venmo,
  naoPagos,
  doacao,
  className,
}: {
  cash: number;
  venmo: number;
  naoPagos: number;
  doacao: number;
  className?: string;
}) {
  const total = cash + venmo + naoPagos + doacao;
  const pctCash = pct(cash, total);
  const pctVenmo = pct(venmo, total);
  const pctNaoPagos = pct(naoPagos, total);
  const pctDoacao = pct(doacao, total);

  const endCash = pctCash;
  const endVenmo = pctCash + pctVenmo;
  const endNaoPagos = pctCash + pctVenmo + pctNaoPagos;

  const conicGradient =
    total > 0
      ? `conic-gradient(${COLORS.cash} 0% ${endCash}%, ${COLORS.venmo} ${endCash}% ${endVenmo}%, ${COLORS.naoPagos} ${endVenmo}% ${endNaoPagos}%, ${COLORS.doacao} ${endNaoPagos}% 100%)`
      : "#e2e8f0";

  const items = [
    { label: "Cash", value: cash, pct: pctCash, color: COLORS.cash },
    { label: "Venmo", value: venmo, pct: pctVenmo, color: COLORS.venmo },
    { label: "Não pagos", value: naoPagos, pct: pctNaoPagos, color: COLORS.naoPagos },
    { label: "Doação (free)", value: doacao, pct: pctDoacao, color: COLORS.doacao },
  ];

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center", className)}>
      <div className="relative h-36 w-36 shrink-0">
        <div
          className="h-full w-full rounded-full"
          style={{ background: conicGradient }}
        />
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground">inscrições</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 w-full sm:w-auto">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
              <span className="font-semibold">
                {item.value}{" "}
                <span className="font-normal text-muted-foreground">({item.pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
