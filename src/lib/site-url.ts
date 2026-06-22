import type { NextRequest } from "next/server";

type SiteUrlSource = Pick<NextRequest, "headers" | "nextUrl">;

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, "");
}

function isLocalHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return normalized.startsWith("localhost") || normalized.startsWith("127.0.0.1");
}

/** Origin from the incoming request when it is a public host. */
export function getSiteUrlFromRequest(request: SiteUrlSource): string | null {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? request.headers.get("host")?.trim();

  if (!host || isLocalHost(host)) {
    return null;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto ?? (request.nextUrl.protocol.replace(":", "") || "https");

  return normalizeOrigin(`${proto}://${host}`);
}

/** Canonical public site origin (no trailing slash). */
export function getSiteUrl(request?: SiteUrlSource): string {
  const fromRequest = request ? getSiteUrlFromRequest(request) : null;
  if (fromRequest) {
    return fromRequest;
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return normalizeOrigin(configured);
  }

  const renderUrl = process.env.RENDER_EXTERNAL_URL?.trim();
  if (renderUrl) {
    return normalizeOrigin(renderUrl);
  }

  const vercelHost = process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    return normalizeOrigin(`https://${vercelHost}`);
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

export function buildAuthCallbackUrl(nextPath?: string, request?: SiteUrlSource): string {
  const next = safeNextPath(nextPath);
  return `${getSiteUrl(request)}/auth/callback?next=${encodeURIComponent(next)}`;
}
