import Link from "next/link";
import { getAppContext } from "@/lib/app-context";
import { RelatorioService } from "@/lib/services";
import { RelatorioResumo } from "@/components/relatorios/relatorio-resumo";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const ctx = await getAppContext();

  if (!ctx.eventoAtivo) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Nenhum retiro ativo</h2>
        <p className="text-muted-foreground max-w-md">
          Não há eventos ativos no momento.{" "}
          {ctx.session?.role === "ADMIN" && "Crie ou ative um evento para começar."}
        </p>
        {ctx.session?.role === "ADMIN" && (
          <Button asChild>
            <Link href="/eventos">Gerenciar eventos</Link>
          </Button>
        )}
      </div>
    );
  }

  const relatorioService = new RelatorioService();
  const relatorio = await relatorioService.gerar(ctx.eventoAtivo.id);

  return (
    <RelatorioResumo
      title="Dashboard"
      subtitle={ctx.eventoAtivo.nome}
      relatorio={relatorio}
      eventoId={ctx.eventoAtivo.id}
    />
  );
}
