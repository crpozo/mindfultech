"use client";

import * as React from "react";

/* Interaction pieces for concept 06, after cerebrium.ai:
   - Split: a title that rises letter by letter when it enters the viewport (their SplitTitle)
   - Scramble: mono labels that scramble on hover (their ScrambleText on buttons)
   - HoldCursor: the hero's custom cursor; press and hold for a second to open a route
   - Dots: a grid of dots that lean towards the pointer (their InteractiveDots)
   - useInView: one observer hook the cards use to start their animations */

export function useInView<T extends HTMLElement>(margin = "-15% 0px -15% 0px", once = true) {
  const ref = React.useRef<T | null>(null);
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); if (once) obs.disconnect(); } else if (!once) setOn(false); }, { rootMargin: margin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin, once]);
  return [ref, on] as const;
}

export function Split({ text, as: Tag = "span", className, delay = 0 }: { text: string; as?: "span" | "h1" | "h2" | "p"; className?: string; delay?: number }) {
  const [ref, on] = useInView<HTMLElement>("-10% 0px -10% 0px");
  const words = text.split(" ");
  let k = 0;
  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={`cb-split ${on ? "cb-split-on" : ""} ${className ?? ""}`} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} className="cb-word" aria-hidden="true">
          {Array.from(w).map((ch, ci) => <span key={ci} className="cb-ch" style={{ transitionDelay: `${delay + (k++) * 22}ms` }}>{ch}</span>)}
          {wi < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+-/<>";
export function Scramble({ text, className }: { text: string; className?: string }) {
  const [shown, setShown] = React.useState(text);
  const timer = React.useRef<number | null>(null);
  React.useEffect(() => setShown(text), [text]);
  const run = () => {
    if (timer.current) window.clearInterval(timer.current);
    let frame = 0; const total = 14;
    timer.current = window.setInterval(() => {
      frame++;
      const reveal = Math.floor((frame / total) * text.length);
      setShown(Array.from(text).map((c, i) => (c === " " ? " " : i < reveal ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""));
      if (frame >= total) { window.clearInterval(timer.current!); timer.current = null; setShown(text); }
    }, 28);
  };
  React.useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);
  return <span className={className} onMouseEnter={run} onFocus={run}>{shown}</span>;
}

export function HoldCursor({ label, onProgress, holdMs = 4400 }: { label: string; onProgress: (p: number) => void; holdMs?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [p, setP] = React.useState(0);
  const prog = React.useRef(0); const dir = React.useRef(0); const raf = React.useRef(0); const last = React.useRef(0);
  React.useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches; if (!fine) return;
    const host = ref.current?.parentElement; if (!host) return;
    const move = (e: PointerEvent) => { const r = host.getBoundingClientRect(); const el = ref.current; if (!el) return; el.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`; };
    // the hold charges up while pressed and eases back when released; the scene reads the progress
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last.current) / 1000); last.current = now;
      const v = dir.current > 0 ? dt * (1000 / holdMs) : -dt * 0.9;
      prog.current = Math.max(0, Math.min(1, prog.current + v));
      setP(prog.current); onProgress(prog.current);
      if (dir.current > 0 || prog.current > 0) raf.current = requestAnimationFrame(tick);
    };
    const start = () => { cancelAnimationFrame(raf.current); last.current = performance.now(); raf.current = requestAnimationFrame(tick); };
    const down = (e: PointerEvent) => { if ((e.target as HTMLElement).closest("a,button")) return; dir.current = 1; start(); };
    const up = () => { if (dir.current === 1) { dir.current = -1; start(); } };
    const enter = () => setVisible(true); const leave = () => { setVisible(false); up(); };
    host.addEventListener("pointermove", move); host.addEventListener("pointerdown", down); window.addEventListener("pointerup", up);
    host.addEventListener("pointerenter", enter); host.addEventListener("pointerleave", leave);
    host.classList.add("cb-nocursor");
    return () => { host.removeEventListener("pointermove", move); host.removeEventListener("pointerdown", down); window.removeEventListener("pointerup", up); host.removeEventListener("pointerenter", enter); host.removeEventListener("pointerleave", leave); host.classList.remove("cb-nocursor"); cancelAnimationFrame(raf.current); };
  }, [holdMs, onProgress]);
  const R = 46, C = 2 * Math.PI * R;
  return (
    <div ref={ref} className={`cb-cursor ${visible ? "on" : ""}`} aria-hidden="true" style={{ ["--p" as string]: p }}>
      <svg viewBox="0 0 100 100" width="100" height="100" style={{ transform: `scale(${1 - p * 0.25})` }}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        
        <line x1="30" y1="50" x2={34 + p * 4} y2="50" stroke="#fff" strokeWidth="1.5" /><line x1={66 - p * 4} y1="50" x2="70" y2="50" stroke="#fff" strokeWidth="1.5" />
      </svg>
      <span style={{ opacity: p > 0.05 ? 0 : 1 }}>{label}</span>
    </div>
  );
}

export function Dots({ className, squares = false }: { className?: string; squares?: boolean }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let w = 0, h = 0, raf = 0, running = false;
    const m = { x: -9999, y: -9999 };
    const resize = () => { const r = c.getBoundingClientRect(); w = c.width = Math.floor(r.width * devicePixelRatio); h = c.height = Math.floor(r.height * devicePixelRatio); };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const gap = (squares ? 40 : 28) * devicePixelRatio, R = 200 * devicePixelRatio, now = performance.now() / 1000;
      let row = 0;
      for (let y = gap / 2; y < h; y += gap, row++) { let col = 0; for (let x = gap / 2; x < w; x += gap, col++) {
        const dx = m.x - x, dy = m.y - y, d = Math.hypot(dx, dy);
        const k = Math.max(0, 1 - d / R);
        // a few cells glow on their own in slow waves (their tetris-like clusters), the pointer lights the rest
        const seed = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453; const r = seed - Math.floor(seed);
        const wave = squares ? Math.max(0, Math.sin(now * 0.6 + r * 6.283 + col * 0.35 - row * 0.5)) : 0;
        const lit = squares ? Math.max(k, r > 0.9 ? wave * wave : 0) : k;
        if (squares && lit > 0.35) {
          const sz = gap * 0.78, rad = 6 * devicePixelRatio, x0 = x - sz / 2, y0 = y - sz / 2;
          ctx.fillStyle = `rgba(61,190,125,${0.25 + lit * 0.6})`;
          ctx.beginPath(); ctx.roundRect(x0, y0, sz, sz, rad); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.beginPath(); ctx.arc(x, y, 1.5 * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
          continue;
        }
        const px = x + dx * k * 0.18, py = y + dy * k * 0.18;
        ctx.fillStyle = `rgba(230,232,239,${(squares ? 0.5 : 0.22) + k * 0.5})`;
        ctx.beginPath(); ctx.arc(px, py, (1.1 + k * 1.6) * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
      } }
      if (running) raf = requestAnimationFrame(draw);
    };
    const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); m.x = (e.clientX - r.left) * devicePixelRatio; m.y = (e.clientY - r.top) * devicePixelRatio; };
    const leave = () => { m.x = -9999; m.y = -9999; };
    const obs = new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) { resize(); draw(); } else cancelAnimationFrame(raf); });
    obs.observe(c);
    window.addEventListener("resize", resize); c.parentElement?.addEventListener("pointermove", move); c.parentElement?.addEventListener("pointerleave", leave);
    return () => { running = false; cancelAnimationFrame(raf); obs.disconnect(); window.removeEventListener("resize", resize); c.parentElement?.removeEventListener("pointermove", move); c.parentElement?.removeEventListener("pointerleave", leave); };
  }, [squares]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

/* a terminal that types its lines when it comes into view */
export function Typewriter({ lines, on, speed = 14 }: { lines: React.ReactNode[]; on: boolean; speed?: number }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!on) return;
    setN(0);
    let i = 0;
    const id = window.setInterval(() => { i++; setN(i); if (i >= lines.length) window.clearInterval(id); }, speed * 28);
    return () => window.clearInterval(id);
  }, [on, lines.length, speed]);
  return <>{lines.slice(0, n).map((l, i) => <React.Fragment key={i}>{l}</React.Fragment>)}{n < lines.length && <span className="cb-caret">▍</span>}</>;
}
