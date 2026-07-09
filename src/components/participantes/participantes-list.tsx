"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PagamentoBadge } from "@/components/shared/pagamento-badge";
import { formatPhone } from "@/lib/phone-mask";
import { isSearchActive, MIN_SEARCH_LENGTH } from "@/lib/search";
import {
  PAGAMENTO_INSCRICAO_LABELS,
  type PagamentoInscricao,
  type ParticipanteCompleto,
} from "@/lib/types";

type PagamentoFilter = "todos" | PagamentoInscricao;
type ServidorFilter = "todos" | "servidor" | "participante";

export default function ParticipantesList({
  eventoId,
}: {
  eventoId: string | null;
}) {
  const [participantes, setParticipantes] = useState<ParticipanteCompleto[]>([]);
  const [search, setSearch] = useState("");
  const [pagamentoFilter, setPagamentoFilter] = useState<PagamentoFilter>("todos");
  const [servidorFilter, setServidorFilter] = useState<ServidorFilter>("todos");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const searchTooShort = search.trim().length > 0 && !isSearchActive(search);

  function invalidateResults() {
    setHasSearched(false);
    setParticipantes([]);
  }

  function handleFilterChange() {
    if (hasSearched) invalidateResults();
  }

  async function handleSearch() {
    if (!eventoId) return;

    const trimmed = search.trim();
    if (trimmed.length > 0 && !isSearchActive(trimmed)) {
      setSearchError(
        `Digite pelo menos ${MIN_SEARCH_LENGTH} caracteres para buscar por nome ou telefone.`
      );
      return;
    }

    setSearchError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setHasSearched(true);

    const params = new URLSearchParams({ eventoId });
    if (isSearchActive(trimmed)) params.set("search", trimmed);
    if (pagamentoFilter !== "todos") {
      params.set("pagamentoInscricao", pagamentoFilter);
    }
    if (servidorFilter === "servidor") {
      params.set("ehServidor", "true");
    } else if (servidorFilter === "participante") {
      params.set("ehServidor", "false");
    }

    try {
      const res = await fetch(`/api/participantes?${params}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      const json = await res.json();
      if (controller.signal.aborted) return;
      if (res.ok) setParticipantes(json.data);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setParticipantes([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  if (!eventoId) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Selecione um retiro ativo para ver participantes.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/participantes" aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Lista de participantes</h1>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (searchError) setSearchError(null);
              if (hasSearched) invalidateResults();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSearch();
              }
            }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="filtro-pagamento">Tipo de pagamento</Label>
            <Select
              value={pagamentoFilter}
              onValueChange={(value: PagamentoFilter) => {
                setPagamentoFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger id="filtro-pagamento">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(Object.keys(PAGAMENTO_INSCRICAO_LABELS) as PagamentoInscricao[]).map(
                  (tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {PAGAMENTO_INSCRICAO_LABELS[tipo]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filtro-servidor">Servidor</Label>
            <Select
              value={servidorFilter}
              onValueChange={(value: ServidorFilter) => {
                setServidorFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger id="filtro-servidor">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="servidor">Servidores</SelectItem>
                <SelectItem value="participante">Participantes (não servidores)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={() => void handleSearch()}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <Search className="h-4 w-4" />
          Buscar
        </Button>

        {(searchTooShort || searchError) && (
          <p className="text-xs text-destructive">
            {searchError ??
              `Digite pelo menos ${MIN_SEARCH_LENGTH} caracteres para buscar por nome ou telefone.`}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Clique em Buscar para ver resultados. Com filtros vazios, a lista completa é exibida.
        </p>
      </div>

      {!hasSearched ? (
        <p className="text-center text-muted-foreground py-12">
          Use os filtros e clique em Buscar para ver os participantes.
        </p>
      ) : loading ? (
        <p className="text-center text-muted-foreground py-8">Carregando...</p>
      ) : participantes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhum participante encontrado</p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {participantes.map((p) => (
              <Link key={p.id} href={`/participantes/${p.id}`}>
                <Card className="transition-colors hover:bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{p.nome}</p>
                        <p className="text-sm text-muted-foreground">{formatPhone(p.telefone)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <PagamentoBadge pagamento={p.pagamentoInscricao} />
                        {p.ehServidor && <Badge variant="secondary">Servidor</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Telefone</th>
                  <th className="px-4 py-3 text-left font-medium">Pagamento</th>
                  <th className="px-4 py-3 text-left font-medium">Servidor</th>
                  <th className="px-4 py-3 text-left font-medium">Camisetas</th>
                  <th className="px-4 py-3 text-left font-medium">Crianças</th>
                </tr>
              </thead>
              <tbody>
                {participantes.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <Link href={`/participantes/${p.id}`} className="font-medium text-primary hover:underline">
                        {p.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatPhone(p.telefone)}</td>
                    <td className="px-4 py-3">
                      <PagamentoBadge pagamento={p.pagamentoInscricao} />
                    </td>
                    <td className="px-4 py-3">{p.ehServidor ? "Sim" : "Não"}</td>
                    <td className="px-4 py-3">{p.camisetas.length}</td>
                    <td className="px-4 py-3">{p.criancas.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
