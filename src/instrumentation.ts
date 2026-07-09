export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { ensureSeed } = await import("@/lib/db/seed");
  await ensureSeed();
}
