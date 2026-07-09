import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { apiSuccess } from "@/lib/api/response";
import { defaultSession, EVENTO_COOKIE, sessionOptions, type SessionData } from "@/lib/auth/session";

export async function POST() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  session.destroy();

  const cookieStore = await cookies();
  cookieStore.delete(EVENTO_COOKIE);

  return apiSuccess({ ...defaultSession });
}
