"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Baby, ChevronRight, MessageCircle, Plus, Search, Shirt } from "lucide-react";
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
import { formatCurrency } from "@/lib/financeiro";
import { pagamentoExigeValor } from "@/lib/pagamento";
import { formatPhone, whatsappUrl } from "@/lib/phone-mask";
import {
  saveParticipantesListState,
  loadParticipantesListState,
  clearParticipantesListState,
} from "@/lib/participantes-list-state";
import { isSearchActive, MIN_SEARCH_LENGTH } from "@/lib/search";
import {
  PAGAMENTO_INSCRICAO_LABELS,
  TAMANHO_CAMISETA_LABELS,
  type Camiseta,
  type PagamentoInscricao,
  type ParticipanteCompleto,
} from "@/lib/types";

type PagamentoFilter = "todos" | PagamentoInscricao;
type ServidorFilter = "todos" | "servidor" | "participante";

function formatValorInscricao(p: ParticipanteCompleto): string {
  if (p.pagamentoInscricao === "FREE") return "Free";
  if (p.pagamentoInscricao === "NAO") return "Não pago";
  if (p.valorInscricao != null) return formatCurrency(p.valorInscricao);
  if (pagamentoExigeValor(p.pagamentoInscricao)) return "—";
  return "—";
}

function formatCamisetasResumo(camisetas: Camiseta[]): string {
  if (camisetas.length === 0) return "Nenhuma";

  return camisetas
    .map((c) => {
      const label =
        c.tamanho === "TODDLER" && c.idadeToddler
          ? `Toddler (${c.idadeToddler})`
          : TAMANHO_CAMISETA_LABELS[c.tamanho];
      return c.quantidade > 1 ? `${label} x${c.quantidade}` : label;
    })
    .join(", ");
}

function totalCamisetas(camisetas: Camiseta[]): number {
  return camisetas.reduce((sum, c) => sum + c.quantidade, 0);
}

function ParticipanteCard({
  participante: p,
  onOpen,
}: {
  participante: ParticipanteCompleto;
  onOpen: () => void;
}) {
  const waLink = whatsappUrl(p.telefone);
  const qtdCamisetas = totalCamisetas(p.camisetas);
  const camisetaValor =
    p.camisetas.length > 0 && pagamentoExigeValor(p.camisetas[0].pagamento)
      ? p.camisetas[0].valorPago
      : undefined;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer transition-colors hover:border-primary/30 hover:bg-secondary/30 active:scale-[0.99]"
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{p.nome}</p>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-1 flex items-center gap-1.5 text-sm text-green-600 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                {formatPhone(p.telefone)}
              </a>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">{formatPhone(p.telefone)}</p>
            )}
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="flex flex-col items-end gap-1">
              <PagamentoBadge pagamento={p.pagamentoInscricao} />
              {p.ehServidor && <Badge variant="secondary">Servidor</Badge>}
            </div>
            <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          </div>
        </div>

        <div className="grid gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Valor inscrição</p>
            <p className="mt-0.5 font-semibold tabular-nums">{formatValorInscricao(p)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Shirt className="h-3 w-3" />
              Camisetas
              {qtdCamisetas > 0 && (
                <span className="font-normal">({qtdCamisetas})</span>
              )}
            </p>
            <p className="mt-0.5 leading-snug">{formatCamisetasResumo(p.camisetas)}</p>
            {camisetaValor != null && (
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {formatCurrency(camisetaValor)}
              </p>
            )}
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Baby className="h-3 w-3" />
              Crianças
            </p>
            <p className="mt-0.5 font-semibold tabular-nums">{p.criancas.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ParticipantesList({
  eventoId,
}: {
  eventoId: string | null;
}) {
  const router = useRouter();
  const [participantes, setParticipantes] = useState<ParticipanteCompleto[]>([]);
  const [search, setSearch] = useState("");
  const [pagamentoFilter, setPagamentoFilter] = useState<PagamentoFilter>("todos");
  const [servidorFilter, setServidorFilter] = useState<ServidorFilter>("todos");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current || !eventoId) return;
    restoredRef.current = true;

    const saved = loadParticipantesListState();
    if (!saved) return;

    clearParticipantesListState();
    setSearch(saved.search);
    setPagamentoFilter(saved.pagamentoFilter as PagamentoFilter);
    setServidorFilter(saved.servidorFilter as ServidorFilter);
    setParticipantes(saved.participantes);
    setHasSearched(saved.hasSearched);
  }, [eventoId]);

  function openParticipante(p: ParticipanteCompleto) {
    saveParticipantesListState({
      search,
      pagamentoFilter,
      servidorFilter,
      participantes,
      hasSearched,
    });
    router.push(`/participantes/${p.id}`);
  }

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
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/participantes" aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Lista de participantes</h1>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/participantes/novo">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo participante</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </Button>
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
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {participantes.map((p) => (
            <ParticipanteCard
              key={p.id}
              participante={p}
              onOpen={() => openParticipante(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
