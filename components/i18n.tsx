"use client";

import * as React from "react";

export type Lang = "en" | "es";

const LangCtx = React.createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // The site always opens in English: most clients are in the US and Europe,
  // and Carlos wants every fresh visit to start there. The ES toggle is one
  // click away; the choice lasts for the tab (sessionStorage, so it survives
  // a reload mid-visit) and the next visit starts in English again.
  const [lang, setLangState] = React.useState<Lang>("en");

  // Guarded — merely reading window storage throws (SecurityError) when site
  // data is blocked or inside a sandboxed iframe, which would otherwise crash
  // this root provider and blank every page.
  React.useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem("mt-lang");
      if (saved === "en" || saved === "es") setLangState(saved);
    } catch {
      /* storage blocked — stay on the default */
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.sessionStorage.setItem("mt-lang", l);
    } catch {
      /* private mode */
    }
  }, []);

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return React.useContext(LangCtx);
}

/** Pick the right variant of a bilingual value. */
export function tr<T>(lang: Lang, v: { en: T; es: T }): T {
  return v[lang];
}

/** EN / ES pill toggle. */
export function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang();
  const base: React.CSSProperties = {
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--mono)",
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: ".08em",
    padding: "7px 10px",
    borderRadius: 6,
    background: "transparent",
    /* the light gray failed WCAG contrast on the pill (#f1f2f6) — this one
       reads 5.3:1 and still looks inactive next to the solid-ink active tab */
    color: dark ? "#b9b6c6" : "#64616e",
    transition: "background .15s,color .15s",
  };
  const active: React.CSSProperties = {
    background: dark ? "rgba(255,255,255,.14)" : "#0e0d12",
    color: "#fff",
  };
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        background: dark ? "rgba(255,255,255,.07)" : "#f1f2f6",
        borderRadius: 8,
        padding: 3,
      }}
    >
      {(["en", "es"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          style={lang === l ? { ...base, ...active } : base}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
