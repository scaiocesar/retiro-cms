export function getCookieSecure(): boolean {
  return process.env.COOKIE_SECURE === "true";
}
