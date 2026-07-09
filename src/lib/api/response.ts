import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return apiError("Não autenticado", 401);
    }
    if (error.message === "FORBIDDEN") {
      return apiError("Sem permissão", 403);
    }
    return apiError(error.message);
  }
  return apiError("Erro interno", 500);
}
