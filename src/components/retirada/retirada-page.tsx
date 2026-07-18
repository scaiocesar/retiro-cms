"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Package, Search, Shirt } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PagamentoBadge } from "@/components/shared/pagamento-badge";
import { formatPhone } from "@/lib/phone-mask";
import { isSearchActive, MIN_SEARCH_LENGTH } from "@/lib/search";
import { cn } from "@/lib/utils";
import { TAMANHO_CAMISETA_LABELS, type Camiseta, type ParticipanteCompleto } from "@/lib/types";

function formatTamanho(camiseta: Camiseta) {
  if (camiseta.tamanho === "TODDLER" && camiseta.idadeToddler) {
    return `Toddler (${camiseta.idadeToddler})`;
  }
  return TAMANHO_CAMISETA_LABELS[camiseta.tamanho];
}

function isPaga(camiseta: Camiseta) {
  return camiseta.pagamento !== "NAO";
}

export default function RetiradaPageClient({
  eventoId,
  canEdit = true,
}: {
  eventoId: string | null;
  canEdit?: boolean;
}) {
  const [participantes, setParticipantes] = useState<ParticipanteCompleto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const searchActive = isSearchActive(search);
  const searchTooShort = search.trim().length > 0 && !searchActive;

  const load = useCallback(async () => {
    if (!eventoId || !searchActive) {
      setParticipantes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ eventoId, search: search.trim() });
    const res = await fetch(`/api/participantes?${params}`);
    const json = await res.json();
    if (res.ok) {
      setParticipantes(
        (json.data as ParticipanteCompleto[]).filter((p) => p.camisetas.length > 0)
      );
    }
    setLoading(false);
  }, [eventoId, search, searchActive]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function toggleRetirada(
    participante: ParticipanteCompleto,
    camiseta: Camiseta
  ) {
    const novoStatus = !camiseta.retirada;
    if (novoStatus && !isPaga(camiseta)) {
      toast.error("Não é possível retirar camiseta não paga");
      return;
    }
    setUpdatingId(camiseta.id);
    try {
      const res = await fetch(`/api/camisetas/${camiseta.id}/retirada`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retirada: novoStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao atualizar retirada");
        return;
      }
      setParticipantes((prev) =>
        prev.map((p) => (p.id === participante.id ? json.data : p))
      );
      toast.success(
        novoStatus
          ? `Camiseta ${formatTamanho(camiseta)} — retirada registrada!`
          : `Retirada removida para ${formatTamanho(camiseta)}`
      );
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!eventoId) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Selecione um retiro ativo para registrar retirada de camisetas.
      </p>
    );
  }

  const totalCamisetas = participantes.reduce(
    (sum, p) => sum + p.camisetas.reduce((s, c) => s + c.quantidade, 0),
    0
  );
  const retiradas = participantes.reduce(
    (sum, p) =>
      sum + p.camisetas.reduce((s, c) => s + (c.retirada ? c.quantidade : 0), 0),
    0
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Retirada de camisetas</h1>
        <p className="text-sm text-muted-foreground">
          {searchActive
            ? `${participantes.length} participante(s) · ${retiradas}/${totalCamisetas} retirada(s)`
            : `Busque por nome ou telefone (mín. ${MIN_SEARCH_LENGTH} caracteres)`}
        </p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        {searchTooShort && (
          <p className="text-xs text-muted-foreground">
            Digite pelo menos {MIN_SEARCH_LENGTH} caracteres para iniciar a busca.
          </p>
        )}
      </div>

      {!searchActive ? (
        <p className="text-center text-muted-foreground py-12">
          Digite pelo menos {MIN_SEARCH_LENGTH} caracteres para buscar o participante.
        </p>
      ) : loading ? (
        <p className="text-center text-muted-foreground py-12">Buscando...</p>
      ) : participantes.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhum participante com camiseta encontrado.
        </p>
      ) : (
        <div className="space-y-3">
          {participantes.map((p) => {
            const todasRetiradas = p.camisetas.every((c) => c.retirada);
            return (
              <Card
                key={p.id}
                className={cn(
                  "transition-colors",
                  todasRetiradas && "border-success/40 bg-success/5"
                )}
              >
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{p.nome}</p>
                      <p className="text-sm text-muted-foreground">{formatPhone(p.telefone)}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.ehServidor && <Badge variant="secondary">Servidor</Badge>}
                        {todasRetiradas && <Badge variant="success">Todas retiradas</Badge>}
                      </div>
                    </div>
                    <Shirt className="h-5 w-5 shrink-0 text-primary" />
                  </div>

                  <div className="space-y-2">
                    {p.camisetas.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5",
                          c.retirada && "border-success/30 bg-success/5"
                        )}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">{formatTamanho(c)}</span>
                            <Badge variant="outline" className="tabular-nums">
                              Qtd: {c.quantidade}
                            </Badge>
                            {c.retirada && <Badge variant="success">Retirada</Badge>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <PagamentoBadge pagamento={c.pagamento} type="camiseta" />
                            <span className="text-xs text-muted-foreground">
                              {isPaga(c) ? "Paga" : "Não paga"}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={c.retirada ? "outline" : "default"}
                          className={cn(
                            "shrink-0",
                            c.retirada && "border-success text-success hover:bg-success/10"
                          )}
                          disabled={
                            updatingId === c.id ||
                            !canEdit ||
                            (!c.retirada && !isPaga(c))
                          }
                          title={
                            !c.retirada && !isPaga(c)
                              ? "Camiseta não paga — não pode retirar"
                              : undefined
                          }
                          onClick={() => toggleRetirada(p, c)}
                        >
                          {c.retirada ? (
                            <>
                              <Check className="h-4 w-4" />
                              Retirada
                            </>
                          ) : !isPaga(c) ? (
                            <>Não paga</>
                          ) : (
                            <>
                              <Package className="h-4 w-4" />
                              Confirmar
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
