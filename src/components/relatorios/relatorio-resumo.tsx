import Link from "next/link";
import { Download, DollarSign, Shirt, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckinChart } from "@/components/relatorios/checkin-chart";
import { PagamentoChart } from "@/components/relatorios/pagamento-chart";
import { RetiradaChart } from "@/components/relatorios/retirada-chart";
import { formatCurrency } from "@/lib/financeiro";
import type { RelatorioEvento } from "@/lib/types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold tracking-tight">{children}</h2>;
}

function MiniStat({
  label,
  value,
  sublabel,
  valueClassName,
  format = "number",
}: {
  label: string;
  value: number;
  sublabel?: string;
  valueClassName?: string;
  format?: "number" | "currency";
}) {
  const displayValue = format === "currency" ? formatCurrency(value) : value;

  return (
    <div className="rounded-lg border bg-card px-3 py-2.5 text-center">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
      <p className={`mt-0.5 text-xl font-bold tabular-nums ${valueClassName ?? ""}`}>
        {displayValue}
      </p>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function FinanceRow({
  label,
  value,
  valueClassName,
  bold,
}: {
  label: string;
  value: number;
  valueClassName?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={bold ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span
        className={`tabular-nums ${bold ? "text-base font-bold" : "font-semibold"} ${valueClassName ?? ""}`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function FinanceCategory({
  title,
  dinheiro,
  venmo,
  total,
  totalLabel,
}: {
  title: string;
  dinheiro: number;
  venmo: number;
  total: number;
  totalLabel: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-2">
        <FinanceRow label="Dinheiro" value={dinheiro} valueClassName="text-success" />
        <FinanceRow label="Venmo" value={venmo} valueClassName="text-blue-600" />
        <div className="border-t pt-2">
          <FinanceRow label={totalLabel} value={total} bold />
        </div>
      </div>
    </div>
  );
}

export function RelatorioResumo({
  title,
  subtitle,
  relatorio,
  eventoId,
  showActions = true,
}: {
  title: string;
  subtitle?: string;
  relatorio: RelatorioEvento;
  eventoId?: string;
  showActions?: boolean;
}) {
  const totalCamisetas = Object.values(relatorio.camisetasPorTamanho).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        {eventoId && (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <a href={`/api/relatorios/${eventoId}?format=csv`} download>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </a>
          </Button>
        )}
      </div>

      {/* 1. Participantes e check-in */}
      <section className="space-y-3">
        <SectionTitle>Participantes e check-in</SectionTitle>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div className="flex min-w-0 flex-1 gap-4">
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 px-6 py-5 sm:min-w-[148px] sm:px-8">
                  <UsersRound className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-5xl font-bold leading-none tabular-nums sm:text-6xl">
                    {relatorio.totalPessoas}
                  </p>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    Total de pessoas
                  </p>
                </div>

                <div className="flex flex-1 flex-col justify-center gap-2">
                  <div className="rounded-lg border bg-muted/40 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Participantes</p>
                    <p className="text-2xl font-bold tabular-nums">
                      {relatorio.totalParticipantesNaoServidores}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Servidores</p>
                    <p className="text-2xl font-bold tabular-nums">{relatorio.totalServidores}</p>
                  </div>
                  {relatorio.totalCriancas > 0 && (
                    <div className="rounded-lg border bg-muted/40 px-4 py-3">
                      <p className="text-xs font-medium text-muted-foreground">Crianças</p>
                      <p className="text-2xl font-bold tabular-nums">{relatorio.totalCriancas}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">Check-in do evento</p>
              <CheckinChart
                presentes={relatorio.totalPresentes}
                naoPresentes={relatorio.totalNaoPresentes}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Pagamentos */}
      <section className="space-y-3">
        <SectionTitle>Pagamentos</SectionTitle>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Cash" value={relatorio.cashInscricao} valueClassName="text-success" />
              <MiniStat label="Venmo" value={relatorio.venmoInscricao} valueClassName="text-blue-600" />
              <MiniStat
                label="Não pagos"
                value={relatorio.naoPagosInscricao}
                valueClassName="text-destructive"
              />
              <MiniStat
                label="Free"
                value={relatorio.freeInscricao}
                valueClassName="text-slate-600"
              />
            </div>

            <div className="border-t pt-6">
              <PagamentoChart
                cash={relatorio.cashInscricao}
                venmo={relatorio.venmoInscricao}
                naoPagos={relatorio.naoPagosInscricao}
                free={relatorio.freeInscricao}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Financeiro */}
      <section className="space-y-3">
        <SectionTitle>Financeiro</SectionTitle>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FinanceCategory
                title="Inscrição"
                dinheiro={relatorio.valorDinheiroInscricao}
                venmo={relatorio.valorVenmoInscricao}
                total={relatorio.totalValorInscricao}
                totalLabel="Total inscrição"
              />
              <FinanceCategory
                title="Camiseta"
                dinheiro={relatorio.valorDinheiroCamiseta}
                venmo={relatorio.valorVenmoCamiseta}
                total={relatorio.totalValorCamiseta}
                totalLabel="Total camiseta"
              />
            </div>

            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <div className="space-y-2">
                <FinanceRow
                  label="Total dinheiro"
                  value={relatorio.totalDinheiro}
                  valueClassName="text-success"
                  bold
                />
                <FinanceRow
                  label="Total Venmo"
                  value={relatorio.totalVenmo}
                  valueClassName="text-blue-600"
                  bold
                />
                <div className="border-t border-primary/20 pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Total geral
                    </span>
                    <span className="text-xl font-bold tabular-nums">
                      {formatCurrency(relatorio.totalGeral)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Camisetas */}
      <section className="space-y-3">
        <SectionTitle>Camisetas</SectionTitle>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 px-8 py-5 sm:min-w-[148px]">
                <Shirt className="mb-2 h-5 w-5 text-primary" />
                <p className="text-5xl font-bold leading-none tabular-nums">{totalCamisetas}</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">Total</p>
              </div>

              <div className="min-w-0 flex-1">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Por tamanho
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {Object.keys(relatorio.camisetasPorTamanho).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma camiseta cadastrada</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(relatorio.camisetasPorTamanho).map(([tamanho, qtd]) => (
                        <BreakdownRow key={tamanho} label={tamanho} value={qtd} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">Retirada</p>
              <RetiradaChart
                retiradas={relatorio.camisetasRetiradas}
                pendentes={relatorio.camisetasPendentes}
              />
            </div>

            <div className="border-t pt-6">
              <p className="mb-4 text-sm font-medium text-muted-foreground">Pagamento</p>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat
                  label="Pagas"
                  value={relatorio.camisetasPagas}
                  valueClassName="text-success"
                />
                <MiniStat
                  label="Não pagas"
                  value={relatorio.camisetasNaoPagas}
                  valueClassName="text-destructive"
                />
                <MiniStat
                  label="Free"
                  value={relatorio.camisetasFree}
                  valueClassName="text-slate-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {showActions && (
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/participantes/lista">Ver participantes</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
