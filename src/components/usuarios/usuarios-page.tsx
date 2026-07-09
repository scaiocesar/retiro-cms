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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { UsuarioSistemaPublic, UserRole } from "@/lib/types";
import { USER_ROLE_LABELS } from "@/lib/types";

export default function UsuariosPageClient() {
  const [usuarios, setUsuarios] = useState<UsuarioSistemaPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UsuarioSistemaPublic | null>(null);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<UserRole>("USUARIO");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const res = await fetch("/api/usuarios");
      const json = await res.json();
      if (!active) return;
      if (res.ok) setUsuarios(json.data);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setEditing(null);
    setNome("");
    setUsername("");
    setSenha("");
    setRole("USUARIO");
    setAtivo(true);
    setDialogOpen(true);
  }

  function openEdit(user: UsuarioSistemaPublic) {
    setEditing(user);
    setNome(user.nome);
    setUsername(user.username);
    setSenha("");
    setRole(user.role);
    setAtivo(user.ativo);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const method = "PATCH";
      const body = editing
        ? {
            id: editing.id,
            nome,
            username,
            role,
            ativo,
            ...(senha ? { senha } : {}),
          }
        : { nome, username, senha, role, ativo };

      const res = await fetch("/api/usuarios", {
        method: editing ? method : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao salvar");
        return;
      }
      toast.success(editing ? "Usuário atualizado!" : "Usuário criado!");
      setDialogOpen(false);
      void (async () => {
        const res = await fetch("/api/usuarios");
        const json = await res.json();
        if (res.ok) setUsuarios(json.data);
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
        <h1 className="text-2xl font-bold">Usuários do sistema</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar usuário" : "Novo usuário"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nome_usuario"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label>{editing ? "Nova senha (opcional)" : "Senha"}</Label>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label>Papel</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLE_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          {usuarios.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{u.nome}</p>
                  <p className="text-sm text-muted-foreground">@{u.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                    {USER_ROLE_LABELS[u.role]}
                  </Badge>
                  <Badge variant={u.ativo ? "success" : "destructive"}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
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
