// Icon shape data for the task board's project icons. Plain data (no JSX) so
// this stays a normal module; the drawing component lives in TasksApp.
import type { IconId } from "./store";

export type Shape =
  | { t: "p"; d: string }
  | { t: "c"; cx: number; cy: number; r: number }
  | { t: "r"; x: number; y: number; w: number; h: number; rx: number };

export const SHAPES: Record<IconId, Shape[]> = {
  // animatronic — a show robot: antenna, head, eye lenses, jaw, arms and legs
  robot: [
    { t: "p", d: "M12 2.7v2.3" },
    { t: "c", cx: 12, cy: 1.9, r: 1 },
    { t: "r", x: 4, y: 5, w: 16, h: 12, rx: 3 },
    { t: "c", cx: 9, cy: 10, r: 1.6 },
    { t: "c", cx: 15, cy: 10, r: 1.6 },
    { t: "p", d: "M9 13.8h6" },
    { t: "p", d: "M4 9H2v4h2M20 9h2v4h-2" },
    { t: "p", d: "M9 17v3M15 17v3" },
  ],
  // helix — the double strand behind Helixona
  dna: [
    { t: "p", d: "M7 2c0 5 10 5 10 10S7 17 7 22" },
    { t: "p", d: "M17 2c0 5-10 5-10 10s10 5 10 10" },
    { t: "p", d: "M8.5 6h7M8.5 18h7M7.4 9.5h9.2M7.4 14.5h9.2" },
  ],
  // home care — a house holding a heart
  "home-heart": [
    { t: "p", d: "M3 10.5 12 3l9 7.5" },
    { t: "p", d: "M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" },
    { t: "p", d: "M12 18.2s-3-1.9-3-3.9a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 2-3 3.9-3 3.9Z" },
  ],
  // events — a scannable ticket
  ticket: [
    {
      t: "p",
      d: "M3 9V6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5V9a3 3 0 0 0 0 6v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V15a3 3 0 0 0 0-6Z",
    },
    { t: "p", d: "M14 5v3M14 11v2M14 16v3" },
  ],
  // fence — pickets and rails
  fence: [
    { t: "p", d: "M5 21V7l2.5-3L10 7v14M14 21V7l2.5-3L19 7v14" },
    { t: "p", d: "M2 10h20M2 15h20" },
  ],
  car: [
    { t: "p", d: "M3 16v-3.2L5 8h14l2 4.8V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" },
    { t: "p", d: "M5.5 12.8h13" },
    { t: "c", cx: 7.5, cy: 16.6, r: 1.3 },
    { t: "c", cx: 16.5, cy: 16.6, r: 1.3 },
  ],
  // CRM pipeline — kanban columns
  kanban: [
    { t: "r", x: 3, y: 4, w: 5, h: 14, rx: 1.2 },
    { t: "r", x: 9.5, y: 4, w: 5, h: 9, rx: 1.2 },
    { t: "r", x: 16, y: 4, w: 5, h: 12, rx: 1.2 },
  ],
  "credit-card": [
    { t: "r", x: 2.5, y: 5, w: 19, h: 14, rx: 2.5 },
    { t: "p", d: "M2.5 9.5h19" },
    { t: "p", d: "M6 14.5h3.5" },
  ],
  rocket: [
    { t: "p", d: "M12 15c5-4 6.5-8.5 6-12-3.5-.5-8 1-12 6l-2.5 3L8 16.5z" },
    { t: "p", d: "M9 12l3 3M5 16c-1.5 1-2 3.5-2 5 1.5 0 4-.5 5-2" },
    { t: "c", cx: 15, cy: 7, r: 1.4 },
  ],
  code: [{ t: "p", d: "M16 18l6-6-6-6M8 6l-6 6 6 6" }],
  chart: [{ t: "p", d: "M4 20V10M10 20V4M16 20v-7M22 20H2" }],
  cloud: [{ t: "p", d: "M18 10h1a4 4 0 0 1 0 8H6a5 5 0 0 1-1-9.9A6 6 0 0 1 18 10z" }],
  cart: [
    { t: "c", cx: 9, cy: 20, r: 1.5 },
    { t: "c", cx: 18, cy: 20, r: 1.5 },
    { t: "p", d: "M2 3h3l2.8 12.5h11L21 7H6" },
  ],
  message: [{ t: "p", d: "M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" }],
  camera: [
    {
      t: "p",
      d: "M3 8.5A1.5 1.5 0 0 1 4.5 7h2.7l1.3-2h6l1.3 2h2.7A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3 17.5z",
    },
    { t: "c", cx: 11.5, cy: 13, r: 3.2 },
  ],
  flask: [
    { t: "p", d: "M9.5 3v6L4.6 17.6A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-3.4L14.5 9V3" },
    { t: "p", d: "M8.5 3h7M7.4 14h9.2" },
  ],
  shield: [
    { t: "p", d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { t: "p", d: "M9 12l2 2 4-4" },
  ],
  sparkle: [
    { t: "p", d: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" },
    { t: "p", d: "M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" },
  ],
};
