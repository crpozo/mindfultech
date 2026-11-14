/* Kept apart from Shell.tsx so pages can open the contact form without importing Shell and its 55KB stylesheet;
   the form itself (ContactForm in Shell) is loaded lazily by SiteChrome. A request made before it has loaded is
   remembered and picked up when it mounts. */

type ContactMode = "project" | "join";
type W = Window & { __mtContactPending?: ContactMode };

export function openContact(mode: ContactMode = "project") {
  (window as W).__mtContactPending = mode;
  window.dispatchEvent(new CustomEvent("mt:contact", { detail: { mode } }));
}

/** Called by ContactForm on mount: the mode of a request that arrived before the form loaded, if any. */
export function takePendingContact(): ContactMode | undefined {
  const w = window as W;
  const m = w.__mtContactPending;
  w.__mtContactPending = undefined;
  return m;
}
