"use client";

import Link from "next/link";
import { ClipboardList, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParticipantesHub({
  hasEvento,
  canEdit = true,
}: {
  hasEvento: boolean;
  canEdit?: boolean;
}) {
  if (!hasEvento) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Selecione um retiro ativo para gerenciar participantes.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Participantes</h1>
        <p className="text-muted-foreground mt-1">O que deseja fazer?</p>
      </div>

      <div className="grid gap-4">
        {canEdit ? (
          <Card className="transition-colors hover:border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-primary" />
                Cadastrar participante
              </CardTitle>
              <CardDescription>Adicionar uma nova inscrição ao retiro</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/participantes/novo">Cadastrar participante</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card className="transition-colors hover:border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Listar participantes
            </CardTitle>
            <CardDescription>Ver e buscar inscrições já cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/participantes/lista">Listar participantes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
