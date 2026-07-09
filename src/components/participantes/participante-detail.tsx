"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  ParticipanteForm,
  participanteToFormData,
  type ParticipanteFormData,
} from "@/components/forms/participante-form";
import { Button } from "@/components/ui/button";
import type { ParticipanteCompleto } from "@/lib/types";

export default function ParticipanteDetailClient({
  id,
  isAdmin,
  eventoId,
}: {
  id: string;
  isAdmin: boolean;
  eventoId: string;
}) {
  const router = useRouter();
  const [participante, setParticipante] = useState<ParticipanteCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/participantes/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setParticipante(json.data);
      });
  }, [id]);

  async function handleSubmit(data: ParticipanteFormData) {
    setLoading(true);
    try {
      const res = await fetch(`/api/participantes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventoId,
          ...data,
          observacoes: data.observacoes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao salvar");
        return;
      }
      toast.success("Participante atualizado!");
      setParticipante(json.data);
      router.refresh();
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir este participante?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/participantes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Erro ao excluir");
        return;
      }
      toast.success("Participante excluído");
      router.push("/participantes");
      router.refresh();
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setDeleting(false);
    }
  }

  if (!participante) {
    return <p className="text-center text-muted-foreground py-12">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isAdmin ? "Editar participante" : "Detalhes do participante"}
        </h1>
        {isAdmin && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        )}
      </div>
      <ParticipanteForm
        initialData={participanteToFormData(participante)}
        onSubmit={handleSubmit}
        loading={loading}
        readOnly={!isAdmin}
      />
    </div>
  );
}
