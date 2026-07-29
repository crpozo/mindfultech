import type { Metadata } from "next";

/**
 * Short alias for /fitness — "mindfultech.ec/fit" is what actually gets typed
 * on a phone. A static export has no server redirects, so the hop is a meta
 * refresh (works with JS off) plus a canonical pointing at the real page.
 */
export const metadata: Metadata = {
  title: "Fitness",
  robots: { index: false, follow: false },
  alternates: { canonical: "/fitness/" },
  other: { refresh: "0; url=/fitness/" },
};

export default function FitAlias() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#eef2fa",
        fontFamily: "var(--font-sans, system-ui)",
        color: "#6b6875",
        fontSize: 14,
      }}
    >
      <p>
        Redirigiendo a <a href="/fitness/" style={{ color: "#2f7d71" }}>/fitness</a>…
      </p>
      <script
        // the meta refresh covers no-JS; this makes the hop instant and keeps
        // the alias out of the back-button history
        dangerouslySetInnerHTML={{ __html: `location.replace('/fitness/')` }}
      />
    </main>
  );
}
