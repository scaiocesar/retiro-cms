function firstHeader(
  headers: Headers,
  name: string
): string | null {
  const value = headers.get(name);
  if (!value) return null;
  return value.split(",")[0]?.trim() || null;
}

export function getClientIp(request?: Request): string | null {
  if (!request) return null;
  return (
    firstHeader(request.headers, "x-forwarded-for") ??
    firstHeader(request.headers, "x-real-ip") ??
    null
  );
}

export function getUserAgent(request?: Request): string | null {
  if (!request) return null;
  const ua = request.headers.get("user-agent");
  return ua ? ua.slice(0, 500) : null;
}
