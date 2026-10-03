// Hotspot icons: one small line-icon set drawn for this office, in place of
// emoji. 24 × 24, 1.7 px strokes, round caps, `currentColor`, so they take the
// marker's colour and stay crisp at any pixel ratio. Used by the DOM markers
// in scene/index.js and by the hotspot panel header in OfficeDemo.tsx.
const wrap = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  board: wrap('<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="M8.5 10h7M8.5 13.5h7M8.5 17h4"/>'),
  tv: wrap('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6.5 13.5l3-3 2.5 2 3.5-4 2 2"/>'),
  coffee: wrap('<path d="M5 9h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M16 10.5h1.5a2.25 2.25 0 0 1 0 4.5H16"/><path d="M8.5 3.5c0 1.2 1 1.3 1 2.5M12 3.5c0 1.2 1 1.3 1 2.5"/><path d="M4 21h14"/>'),
  printer: wrap('<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/><circle cx="17" cy="12" r="0.9" fill="currentColor"/>'),
  shelf: wrap('<path d="M4 20V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v15"/><path d="M9 20V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v13"/><path d="M14.5 20l-2-12.5a1 1 0 0 1 .8-1.2l2-.3a1 1 0 0 1 1.1.8L18.5 20"/><path d="M3 20h18"/>'),
  water: wrap('<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4.5 3.5V16H6a2 2 0 0 1-2-2z"/><circle cx="9" cy="10" r="0.9" fill="currentColor"/><circle cx="12" cy="10" r="0.9" fill="currentColor"/><circle cx="15" cy="10" r="0.9" fill="currentColor"/>'),
  clock: wrap('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  servers: wrap('<rect x="4" y="4" width="16" height="5" rx="1.5"/><rect x="4" y="10.5" width="16" height="5" rx="1.5"/><rect x="4" y="17" width="16" height="3.5" rx="1.5"/><circle cx="7.5" cy="6.5" r="0.9" fill="currentColor"/><circle cx="7.5" cy="13" r="0.9" fill="currentColor"/>'),
  pingpong: wrap('<ellipse cx="13.5" cy="9" rx="5.6" ry="6.4" transform="rotate(-30 13.5 9)"/><path d="M9.8 14.6L5.2 20"/><circle cx="5.2" cy="7.4" r="1.6"/>'),
  reception: wrap('<path d="M5 17a7 7 0 0 1 14 0z"/><path d="M12 10V7.8"/><circle cx="12" cy="6.6" r="1.1"/><path d="M3.5 19.5h17"/>'),
  meeting: wrap('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14" r="0.9" fill="currentColor"/><circle cx="12" cy="14" r="0.9" fill="currentColor"/><circle cx="15.5" cy="14" r="0.9" fill="currentColor"/>'),
  lounge: wrap('<path d="M4 20h16"/><rect x="6" y="11" width="3" height="7" rx="0.8"/><rect x="11" y="6" width="3" height="12" rx="0.8"/><rect x="16" y="14" width="3" height="4" rx="0.8"/>'),
};

/** The icon for a hotspot id; a plain dot for anything unmapped. */
export function iconSvg(id) {
  return ICONS[id] || wrap('<circle cx="12" cy="12" r="3.5" fill="currentColor"/>');
}
