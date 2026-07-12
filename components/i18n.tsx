"use client";

import * as React from "react";

export type Lang = "en" | "es";

const LangCtx = React.createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");

  // Resolve once on mount: saved choice wins, else browser language.
  React.useEffect(() => {
    const saved = window.localStorage.getItem("mt-lang");
    if (saved === "en" || saved === "es") {
      setLangState(saved);
    } else if (navigator.language?.toLowerCase().startsWith("es")) {
      setLangState("es");
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("mt-lang", l);
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
    color: dark ? "#b9b6c6" : "#8b8896",
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
