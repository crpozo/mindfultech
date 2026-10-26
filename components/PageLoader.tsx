"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Branded overlay shown briefly on in-app navigation: a framed card with the
 * brand mark, the serif wordmark and a sliding bar, on the site background. It
 * appears on a click that leads to another route and clears once the pathname
 * changes.
 */
export function PageLoader() {
  const pathname = usePathname();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    setShow(false);
  }, [pathname]);

  // Safety nets: hide when the page is restored from the back/forward cache, on history moves,
  // and after a few seconds no matter what, so a failed or cancelled navigation never leaves it stuck.
  React.useEffect(() => {
    const off = () => setShow(false);
    window.addEventListener("pageshow", off);
    window.addEventListener("popstate", off);
    return () => { window.removeEventListener("pageshow", off); window.removeEventListener("popstate", off); };
  }, []);
  React.useEffect(() => {
    if (!show) return;
    const id = window.setTimeout(() => setShow(false), 4000);
    return () => window.clearTimeout(id);
  }, [show]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      let el = e.target as HTMLElement | null;
      while (el && el.tagName !== "A") el = el.parentElement;
      const a = el as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("/")) return; // ignore hashes, mailto, tel, external
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      // Compare against window.location.pathname — both include the basePath
      // (usePathname strips it), so this stays correct on GitHub Pages.
      const norm = (p: string) => p.replace(/\/+$/, "") || "/";
      const dest = norm(href.split("#")[0] || "/");
      if (dest === norm(window.location.pathname)) return; // same page (anchor only)
      setShow(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return (
    <div className={`mt-loader${show ? " show" : ""}`} aria-hidden={!show}>
      <i className="mt-loader-sq" /><i className="mt-loader-circle" /><i className="mt-loader-tri" />
      <div className="mt-loader-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-mark.webp" alt="" width={40} height={40} />
        <span className="mt-loader-word">MindfulTech</span>
        <span className="mt-loader-bar"><i /></span>
      </div>
    </div>
  );
}
