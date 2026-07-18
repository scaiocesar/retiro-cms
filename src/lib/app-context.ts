import { ensureSeed } from "@/lib/db/seed";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { syncSessionPermissions } from "@/lib/auth/sync-permissions";
import { EventoService } from "@/lib/services";
import { EVENTO_COOKIE } from "@/lib/auth/session";

export async function getAppContext() {
  await ensureSeed();
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  if (session.isLoggedIn) {
    await syncSessionPermissions(session);
  }

  const eventoService = new EventoService();
  const eventosAtivos = await eventoService.listAtivos();
  const cookieStore = await cookies();
  const eventoCookie = cookieStore.get(EVENTO_COOKIE)?.value;

  let eventoAtivoId: string | null = null;
  if (eventosAtivos.length === 1) {
    eventoAtivoId = eventosAtivos[0].id;
  } else if (eventosAtivos.length > 1) {
    const validCookie = eventosAtivos.find((e) => e.id === eventoCookie);
    eventoAtivoId = validCookie?.id ?? eventosAtivos[0].id;
  }

  const eventoAtivo = eventoAtivoId
    ? eventosAtivos.find((e) => e.id === eventoAtivoId) ?? null
    : null;

  return {
    session: session.isLoggedIn ? session : null,
    eventosAtivos,
    eventoAtivo,
    eventoAtivoId,
    showEventoSelector: eventosAtivos.length > 1,
  };
}
