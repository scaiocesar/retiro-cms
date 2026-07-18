"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LOGIN_RESULTADO_LABELS,
  type LoginHistoricoEntry,
  type LoginResultado,
} from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function resultadoVariant(
  resultado: LoginResultado
): "success" | "destructive" | "warning" | "secondary" {
  switch (resultado) {
    case "SUCESSO":
      return "success";
    case "SENHA_INVALIDA":
      return "warning";
    case "BLOQUEADO":
      return "destructive";
    default:
      return "secondary";
  }
}

export default function LoginHistoricoPageClient() {
  const [entries, setEntries] = useState<LoginHistoricoEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/usuarios/login-historico?limit=150");
        const json = await res.json();
        if (!active) return;
        if (!res.ok) {
          toast.error(json.error ?? "Erro ao carregar histórico");
          return;
        }
        setEntries(json.data);
      } catch {
        if (active) toast.error("Erro de conexão");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Voltar">
          <Link href="/usuarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Histórico de login</h1>
          <p className="text-sm text-muted-foreground">
            Tentativas de acesso dos usuários do sistema
          </p>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Carregando...</p>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum registro de login ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">
                    {entry.usuarioNome ? (
                      <>
                        {entry.usuarioNome}{" "}
                        <span className="font-normal text-muted-foreground">
                          @{entry.username}
                        </span>
                      </>
                    ) : (
                      <>@{entry.username}</>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(entry.criadoEm)}
                    {entry.ip ? ` · IP ${entry.ip}` : ""}
                  </p>
                </div>
                <Badge variant={resultadoVariant(entry.resultado)}>
                  {LOGIN_RESULTADO_LABELS[entry.resultado]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
