/**
 * Canonical public origin, used for sitemap/robots/OG absolute URLs.
 * NEXT_PUBLIC_SITE_URL wins (set it to the custom domain); on Vercel we fall
 * back to the production URL it injects (host only, no protocol).
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();
