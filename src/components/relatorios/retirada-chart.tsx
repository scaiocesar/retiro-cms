"use client";

import { cn } from "@/lib/utils";

export function RetiradaChart({
  retiradas,
  pendentes,
  className,
}: {
  retiradas: number;
  pendentes: number;
  className?: string;
}) {
  const total = retiradas + pendentes;
  const pctRetiradas = total > 0 ? Math.round((retiradas / total) * 100) : 0;
  const pctPendentes = total > 0 ? 100 - pctRetiradas : 0;

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center", className)}>
      <div className="relative h-36 w-36 shrink-0">
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              total > 0
                ? `conic-gradient(#16a34a 0% ${pctRetiradas}%, #e2e8f0 ${pctRetiradas}% 100%)`
                : "#e2e8f0",
          }}
        />
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-2xl font-bold">{pctRetiradas}%</span>
          <span className="text-xs text-muted-foreground">retiradas</span>
        </div>
      </div>

      <div className="flex-1 space-y-3 w-full sm:w-auto">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-success" />
              Retiradas
            </span>
            <span className="font-semibold">
              {retiradas}{" "}
              <span className="font-normal text-muted-foreground">({pctRetiradas}%)</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${pctRetiradas}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-muted-foreground/40" />
              Pendentes
            </span>
            <span className="font-semibold">
              {pendentes}{" "}
              <span className="font-normal text-muted-foreground">({pctPendentes}%)</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-muted-foreground/40 transition-all"
              style={{ width: `${pctPendentes}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground pt-1">Total de camisetas: {total}</p>
      </div>
    </div>
  );
}
