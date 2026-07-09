"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Evento } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function EventosPageClient() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const res = await fetch("/api/eventos");
      const json = await res.json();
      if (!active) return;
      if (res.ok) setEventos(json.data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setEditing(null);
    setNome("");
    setData("");
    setAtivo(true);
    setDialogOpen(true);
  }

  function openEdit(evento: Evento) {
    setEditing(evento);
    setNome(evento.nome);
    setData(evento.data.split("T")[0]);
    setAtivo(evento.ativo);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing
        ? { id: editing.id, nome, data, ativo }
        : { nome, data, ativo };

      const res = await fetch("/api/eventos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao salvar");
        return;
      }
      toast.success(editing ? "Evento atualizado!" : "Evento criado!");
      setDialogOpen(false);
      void (async () => {
        const res = await fetch("/api/eventos");
        const json = await res.json();
        if (res.ok) setEventos(json.data);
      })();
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar evento" : "Novo evento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={ativo} onCheckedChange={setAtivo} />
                <Label>Ativo</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {eventos.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{e.nome}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(e.data)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={e.ativo ? "success" : "secondary"}>
                    {e.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
