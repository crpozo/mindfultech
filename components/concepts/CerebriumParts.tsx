"use client";

import * as React from "react";
import Link from "next/link";
import { useLang } from "@/components/i18n";
import { Split, Scramble } from "./CerebriumFx";
import { openContact } from "@/components/site/Shell";
import s from "./cerebrium.module.css";

/* Shared chrome for the Cerebrium concept pages: the fixed WebGL scene (three modes), the nav and the footer.
   CbPage wires scroll progress to the scene from data attributes, so pages need no refs. */

export const CB = "";
export type CbMode = "bands" | "globe" | "columns";

export function CbScene({ mode }: { mode: CbMode }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    let bg: { setScroll: (p: number) => void; setGlobe: (g: number) => void; setFooter: (f: number) => void; setPointer: (x: number, y: number) => void; setHold: (p: number) => void; dispose: () => void } | null = null;
    let raf = 0, alive = true, idle = 0;
    const onMove = (e: PointerEvent) => bg?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    const feed = () => {
      if (!bg) return;
      const hero = document.querySelector<HTMLElement>("[data-cb-hero]");
      bg.setScroll(window.scrollY / (hero?.offsetHeight || window.innerHeight));
      const d = document.querySelector<HTMLElement>("[data-cb-dark]"); const vh = window.innerHeight;
      if (d) { const r = d.getBoundingClientRect(); const vis = Math.min(r.bottom, vh) - Math.max(r.top, 0); bg.setGlobe(Math.max(0, Math.min(1, vis / (vh * 0.7)))); }
      const ft = document.querySelector<HTMLElement>("[data-cb-foot]");
      if (ft) { const r = ft.getBoundingClientRect(); bg.setFooter(Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.5)))); }
    };
    const loop = () => { feed(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const build = async () => {
      const { createBackground } = await import("./cerebriumScene.js");
      if (!alive || !canvasRef.current) return;
      bg = createBackground(canvasRef.current, { accent: "#1f6b47", edge: "#9fe8be", base: "#07201a", mode });
      window.addEventListener("pointermove", onMove);
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (typeof w.requestIdleCallback === "function") idle = w.requestIdleCallback(() => { build(); }, { timeout: 1500 }); else idle = window.setTimeout(build, 300) as unknown as number;
    return () => { alive = false; cancelAnimationFrame(raf); if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idle); else window.clearTimeout(idle); window.removeEventListener("pointermove", onMove); bg?.dispose(); };
  }, [mode]);
  return <canvas ref={canvasRef} className={s.bg} aria-hidden="true" />;
}

export function CbNav({ active }: { active?: "home" | "services" | "work" | "company" | "blog" }) {
  const { lang, setLang } = useLang();
  const es = lang === "es";
  // the logo goes to its colour version while a light section sits under the nav
  const [onLight, setOnLight] = React.useState(false);
  React.useEffect(() => {
    const check = () => {
      const light = document.elementsFromPoint(60, 44).some((el) => !!(el as HTMLElement).closest("[data-cb-light]"));
      setOnLight(light);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => { window.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, []);
  const items: [string, string, string][] = [["services", `${CB}/services`, es ? "Servicios" : "Services"], ["work", `${CB}/work`, es ? "Proyectos" : "Work"], ["office", "/office-demo", "AI Office"], ["company", `${CB}/company`, es ? "Empresa" : "Company"]];
  return (
    <header className={s.nav}>
      <div className={s.navIn}>
        <Link href="/" aria-label="MindfulTech" className={onLight ? s.logoLight : ""}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/logo.webp" alt="MindfulTech" width={220} height={71} /></Link>
        <nav className={s.navLinks}>{items.map(([k, href, label]) => <Link key={k} href={href} className={active === k ? s.navOn : ""}>{label}</Link>)}</nav>
        <div className={s.navRight}>
          <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => setLang(es ? "en" : "es")}>{es ? "EN" : "ES"}</button>
          <button type="button" onClick={() => openContact()} className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Habla con nosotros" : "Talk to us"} /></button>
        </div>
      </div>
    </header>
  );
}

export function CbFooter() {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <section className={`${s.dark} ${s.darkClear}`}>
      <footer className={s.foot} data-cb-foot>
        <div className={s.footTop}>
          <div className={s.social}>
            <a href="https://www.linkedin.com/company/mindfultech" target="_blank" rel="noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z" /></svg></a>
            <a href="https://github.com/crpozo" target="_blank" rel="noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" /></svg></a>
            <a href="https://wa.me/593958731994" target="_blank" rel="noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" /></svg></a>
            <a href="mailto:carlos@mindfultech.ec" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg></a>
          </div>
          <div className={s.footCols}>
            <div><span>{es ? "Servicios" : "Services"}</span><Link href={`${CB}/services#ux`}>{es ? "Diseño UX" : "UX Design"}</Link><Link href={`${CB}/services#apps`}>{es ? "Apps web y móviles" : "Web & Mobile Apps"}</Link><Link href={`${CB}/services#custom`}>{es ? "Software a medida" : "Custom Software"}</Link><Link href={`${CB}/services#ai`}>{es ? "IA y automatización" : "AI & Automation"}</Link></div>
            <div><span>MindfulTech</span><Link href={`${CB}/work`}>{es ? "Proyectos" : "Work"}</Link><Link href="/office-demo">AI Office</Link><Link href={`${CB}/company`}>{es ? "Empresa" : "Company"}</Link><Link href={`${CB}/blog`}>Blog</Link><a href="mailto:carlos@mindfultech.ec">{es ? "Contacto" : "Contact"}</a></div>
          </div>
        </div>
        <div className={s.footClose}>
          <h2 className={s.h2}><Split text={es ? "Empieza a construir con IA hoy," : "Start building with AI today,"} /><br /><Split text={es ? "o cuéntanos tu flujo." : "or talk to us about your workflow."} delay={300} /></h2>
          <div className={s.ctas}><button type="button" onClick={() => openContact()} className={`${s.btn} ${s.btnAcc}`}><Scramble text={es ? "Habla con nosotros" : "Talk to us"} /></button><Link href="/office-demo" className={`${s.btn} ${s.btnSolid}`}><Scramble text="AI Management Office" /></Link></div>
        </div>
        <div className={s.footBar}><span>2026 © MindfulTech, Quito</span><span className={s.mono}>info@mindfultech.ec / +593 958 73 1994</span></div>
      </footer>
    </section>
  );
}

export function CbPage({ mode, active, children }: { mode: CbMode; active: "services" | "work" | "company" | "blog"; children: React.ReactNode }) {
  const { lang } = useLang();
  return (
    <div className={s.root}>
      <CbScene mode={mode} />
      <CbNav active={active} />
      {children}
      <CbFooter />
    </div>
  );
}

/* a copy-to-clipboard email line (their contact block) */
export function CopyEmail({ label, email }: { label: string; email: string }) {
  const { lang } = useLang();
  const [done, setDone] = React.useState(false);
  return (
    <div className={s.copyRow}>
      <span className={s.mono}>{label}</span>
      <a href={`mailto:${email}`}>{email}</a>
      <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => { navigator.clipboard?.writeText(email); setDone(true); window.setTimeout(() => setDone(false), 1600); }}>
        {done ? (lang === "es" ? "Copiado" : "Copied") : (lang === "es" ? "Copiar" : "Copy to clipboard")}
      </button>
    </div>
  );
}
