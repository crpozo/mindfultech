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

export function HoldCursor({ label, onComplete, holdMs = 900 }: { label: string; onComplete: () => void; holdMs?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [p, setP] = React.useState(0);
  const start = React.useRef(0); const raf = React.useRef(0);
  React.useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches; if (!fine) return;
    const host = ref.current?.parentElement; if (!host) return;
    const move = (e: PointerEvent) => { const r = host.getBoundingClientRect(); const el = ref.current; if (!el) return; el.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`; };
    const tick = () => { const k = Math.min(1, (performance.now() - start.current) / holdMs); setP(k); if (k >= 1) { onComplete(); setP(0); return; } raf.current = requestAnimationFrame(tick); };
    const down = (e: PointerEvent) => { if ((e.target as HTMLElement).closest("a,button")) return; start.current = performance.now(); raf.current = requestAnimationFrame(tick); };
    const up = () => { cancelAnimationFrame(raf.current); setP(0); };
    const enter = () => setVisible(true); const leave = () => { setVisible(false); up(); };
    host.addEventListener("pointermove", move); host.addEventListener("pointerdown", down); host.addEventListener("pointerup", up);
    host.addEventListener("pointerenter", enter); host.addEventListener("pointerleave", leave);
    host.classList.add("cb-nocursor");
    return () => { host.removeEventListener("pointermove", move); host.removeEventListener("pointerdown", down); host.removeEventListener("pointerup", up); host.removeEventListener("pointerenter", enter); host.removeEventListener("pointerleave", leave); host.classList.remove("cb-nocursor"); cancelAnimationFrame(raf.current); };
  }, [holdMs, onComplete]);
  const R = 46, C = 2 * Math.PI * R;
  return (
    <div ref={ref} className={`cb-cursor ${visible ? "on" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        <circle cx="50" cy="50" r={R} fill="none" stroke="#bff5cf" strokeWidth="2" strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 50 50)" />
        <circle cx="34" cy="50" r="1.8" fill="#fff" /><circle cx="66" cy="50" r="1.8" fill="#fff" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

export function Dots({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let w = 0, h = 0, raf = 0, running = false;
    const m = { x: -9999, y: -9999 };
    const resize = () => { const r = c.getBoundingClientRect(); w = c.width = Math.floor(r.width * devicePixelRatio); h = c.height = Math.floor(r.height * devicePixelRatio); };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const gap = 28 * devicePixelRatio, R = 160 * devicePixelRatio;
      for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) {
        const dx = m.x - x, dy = m.y - y, d = Math.hypot(dx, dy);
        const k = Math.max(0, 1 - d / R);
        const px = x + dx * k * 0.18, py = y + dy * k * 0.18;
        ctx.fillStyle = `rgba(191,245,207,${0.12 + k * 0.8})`;
        ctx.beginPath(); ctx.arc(px, py, (1 + k * 1.8) * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
      }
      if (running) raf = requestAnimationFrame(draw);
    };
    const move = (e: PointerEvent) => { const r = c.getBoundingClientRect(); m.x = (e.clientX - r.left) * devicePixelRatio; m.y = (e.clientY - r.top) * devicePixelRatio; };
    const leave = () => { m.x = -9999; m.y = -9999; };
    const obs = new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) { resize(); draw(); } else cancelAnimationFrame(raf); });
    obs.observe(c);
    window.addEventListener("resize", resize); c.parentElement?.addEventListener("pointermove", move); c.parentElement?.addEventListener("pointerleave", leave);
    return () => { running = false; cancelAnimationFrame(raf); obs.disconnect(); window.removeEventListener("resize", resize); c.parentElement?.removeEventListener("pointermove", move); c.parentElement?.removeEventListener("pointerleave", leave); };
  }, []);
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
