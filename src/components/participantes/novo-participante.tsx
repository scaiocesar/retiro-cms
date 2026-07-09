"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ParticipanteForm, type ParticipanteFormData } from "@/components/forms/participante-form";
import { Button } from "@/components/ui/button";

export default function NovoParticipanteClient({
  eventoId,
}: {
  eventoId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(data: ParticipanteFormData) {
    setLoading(true);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/participantes", {
        method: "POST",
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
      const nome = data.nome.trim();
      const message = `${nome} cadastrado com sucesso!`;
      toast.success(message);
      setSuccessMessage(message);
      setFormKey((k) => k + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/participantes" aria-label="Voltar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Cadastrar participante</h1>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <ParticipanteForm
        key={formKey}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
