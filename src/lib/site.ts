export function getSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (!value) {
    return "http://127.0.0.1:3210";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value.replace(/\/$/, "");
  }

  return `https://${value.replace(/\/$/, "")}`;
}

export function buildAbsoluteUrl(pathname: string) {
  return new URL(pathname, getSiteUrl()).toString();
}
