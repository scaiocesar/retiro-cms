export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (!process.env.DATABASE_URL) {
    return;
  }

  const { ensureSeed } = await import("@/lib/db/seed");
  await ensureSeed();
}
