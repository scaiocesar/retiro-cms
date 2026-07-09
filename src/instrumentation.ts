export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { recreateAdminUser } = await import("@/lib/db/seed");
  const { getStore } = await import("@/lib/db/in-memory-store");

  const store = getStore();

  if (process.env.RECREATE_ADMIN_ON_START === "true") {
    store.reset();
  }

  await recreateAdminUser();
  store.seeded = true;
}
