"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { History, Plus, Pencil } from "lucide-react";
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
import {
  ACCESS_LEVEL_LABELS,
  DEFAULT_USUARIO_PERMISSIONS,
  MENU_KEYS,
  MENU_LABELS,
  type AccessLevel,
  type UserPermissions,
} from "@/lib/auth/permissions";
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
  const [permissoes, setPermissoes] = useState<UserPermissions>({
    ...DEFAULT_USUARIO_PERMISSIONS,
  });
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
    setPermissoes({ ...DEFAULT_USUARIO_PERMISSIONS });
    setDialogOpen(true);
  }

  function openEdit(user: UsuarioSistemaPublic) {
    setEditing(user);
    setNome(user.nome);
    setUsername(user.username);
    setSenha("");
    setRole(user.role);
    setAtivo(user.ativo);
    setPermissoes({ ...user.permissoes });
    setDialogOpen(true);
  }

  function setMenuLevel(menu: keyof UserPermissions, level: AccessLevel) {
    setPermissoes((prev) => ({ ...prev, [menu]: level }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        nome,
        username,
        role,
        ativo,
        ...(role === "USUARIO" ? { permissoes } : {}),
        ...(senha ? { senha } : {}),
      };
      const body = editing ? { id: editing.id, ...payload } : { ...payload, senha };

      if (!editing && !senha) {
        toast.error("Senha obrigatória");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/usuarios", {
        method: editing ? "PATCH" : "POST",
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
      const listRes = await fetch("/api/usuarios");
      const listJson = await listRes.json();
      if (listRes.ok) setUsuarios(listJson.data);
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Usuários do sistema</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/usuarios/historico">
              <History className="h-4 w-4" />
              Histórico
            </Link>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Editar usuário" : "Novo usuário"}
                </DialogTitle>
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
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as UserRole)}
                  >
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

                {role === "USUARIO" ? (
                  <div className="space-y-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Acesso aos menus</p>
                      <p className="text-xs text-muted-foreground">
                        Escolha o que o usuário pode ver e se pode editar.
                      </p>
                    </div>
                    {MENU_KEYS.map((menu) => (
                      <div
                        key={menu}
                        className="grid gap-2 sm:grid-cols-[1fr_10rem] sm:items-center"
                      >
                        <Label className="text-sm font-normal">
                          {MENU_LABELS[menu]}
                        </Label>
                        <Select
                          value={permissoes[menu]}
                          onValueChange={(v) =>
                            setMenuLevel(menu, v as AccessLevel)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(ACCESS_LEVEL_LABELS) as AccessLevel[]).map(
                              (level) => (
                                <SelectItem key={level} value={level}>
                                  {ACCESS_LEVEL_LABELS[level]}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Administradores têm acesso total a todos os menus.
                  </p>
                )}

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{u.nome}</p>
                  <p className="text-sm text-muted-foreground">@{u.username}</p>
                  {u.role === "USUARIO" ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {MENU_KEYS.filter((m) => u.permissoes[m] !== "none")
                        .map(
                          (m) =>
                            `${MENU_LABELS[m]} (${ACCESS_LEVEL_LABELS[u.permissoes[m]]})`
                        )
                        .join(" · ") || "Sem menus liberados"}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                    {USER_ROLE_LABELS[u.role]}
                  </Badge>
                  <Badge variant={u.ativo ? "success" : "destructive"}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(u)}
                  >
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
