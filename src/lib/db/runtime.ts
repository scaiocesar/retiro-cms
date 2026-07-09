/** Next.js executa páginas no build; o banco só existe em runtime. */
export function isBuildTime(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
