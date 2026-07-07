"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

/**
 * Branded overlay shown briefly on in-app navigation — a spinning ensō over the
 * hero's blue wash, mirroring the prototype's nav-fix loader. It appears on a
 * click that leads to another route and clears once the pathname changes.
 */
export function PageLoader() {
  const pathname = usePathname();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    setShow(false);
  }, [pathname]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      let el = e.target as HTMLElement | null;
      while (el && el.tagName !== "A") el = el.parentElement;
      const a = el as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("/")) return; // ignore hashes, mailto, tel, external
      const dest = href.split("#")[0] || "/";
      if (dest === pathname) return; // same page (anchor only)
      setShow(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return (
    <div className={`mt-loader${show ? " show" : ""}`} aria-hidden={!show}>
      <Logo size={46} stroke="var(--accent)" />

      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: ".2em",
          color: "#44424d",
        }}
      >
        LOADING
      </div>
    </div>
  );
}
