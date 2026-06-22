/** Canonical public site origin (no trailing slash). */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const renderUrl = process.env.RENDER_EXTERNAL_URL?.trim();
  if (renderUrl) {
    return renderUrl.replace(/\/$/, "");
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return `https://${vercelHost.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

/** Relative in-app paths only — blocks open redirects. */
export function safeNextPath(raw: string | null | undefined, fallback = "/account"): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  return raw;
}

export function buildAuthCallbackUrl(nextPath?: string): string {
  const next = safeNextPath(nextPath);
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
