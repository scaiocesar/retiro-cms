"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPhone } from "@/lib/phone-mask";
import { isSearchActive, MIN_SEARCH_LENGTH } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { ParticipanteCompleto } from "@/lib/types";

export default function CheckinPageClient({
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
    if (res.ok) setParticipantes(json.data);
    setLoading(false);
  }, [eventoId, search, searchActive]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function toggleCheckin(participante: ParticipanteCompleto) {
    const novoStatus = !participante.checkin;
    setUpdatingId(participante.id);
    try {
      const res = await fetch(`/api/participantes/${participante.id}/checkin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkin: novoStatus }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao atualizar check-in");
        return;
      }
      setParticipantes((prev) =>
        prev.map((p) => (p.id === participante.id ? json.data : p))
      );
      toast.success(
        novoStatus
          ? `${participante.nome} — check-in realizado!`
          : `Check-in removido para ${participante.nome}`
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
        Selecione um retiro ativo para fazer check-in.
      </p>
    );
  }

  const presentes = participantes.filter((p) => p.checkin).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Check-in</h1>
        <p className="text-sm text-muted-foreground">
          {searchActive
            ? `${participantes.length} resultado(s) · ${presentes} presente(s)`
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
          Nenhum participante encontrado.
        </p>
      ) : (
        <div className="space-y-3">
          {participantes.map((p) => (
            <Card
              key={p.id}
              className={cn(
                "transition-colors",
                p.checkin && "border-success/40 bg-success/5"
              )}
            >
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{p.nome}</p>
                  <p className="text-sm text-muted-foreground">{formatPhone(p.telefone)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.ehServidor && <Badge variant="secondary">Servidor</Badge>}
                    {p.checkin && <Badge variant="success">Presente</Badge>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={p.checkin ? "outline" : "default"}
                  className={cn(
                    "shrink-0",
                    p.checkin && "border-success text-success hover:bg-success/10"
                  )}
                  disabled={updatingId === p.id || !canEdit}
                  onClick={() => toggleCheckin(p)}
                >
                  {p.checkin ? (
                    <>
                      <Check className="h-4 w-4" />
                      Presente
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Check-in
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
