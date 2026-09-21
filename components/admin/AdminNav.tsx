"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminIconName =
  | "overview"
  | "leads"
  | "accommodations"
  | "gallery"
  | "content"
  | "reviews"
  | "identity"
  | "integrations"
  | "users"
  | "settings"
  | "external"
  | "logout";

type AdminNavItem = {
  href: string;
  label: string;
  icon: AdminIconName;
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminIcon({
  name,
  className = "admin-nav-icon",
}: {
  name: AdminIconName;
  className?: string;
}) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "overview":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
    case "leads":
      return <svg {...common}><path d="M4 5h16"/><path d="M7 12h10"/><path d="M10 19h4"/></svg>;
    case "accommodations":
      return <svg {...common}><path d="M3 18v-7"/><path d="M21 18v-5a3 3 0 0 0-3-3H8a5 5 0 0 0-5 5v3"/><path d="M3 15h18"/><path d="M7 10V7h5a3 3 0 0 1 3 3"/></svg>;
    case "gallery":
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m5 18 5-5 3.5 3.5L16 14l3 4"/></svg>;
    case "content":
      return <svg {...common}><path d="M5 4h14"/><path d="M5 8h14"/><path d="M5 12h9"/><rect x="5" y="16" width="14" height="4" rx="1"/></svg>;
    case "reviews":
      return <svg {...common}><path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3Z"/></svg>;
    case "identity":
      return <svg {...common}><path d="M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Z"/><circle cx="7.5" cy="10" r=".8" fill="currentColor" stroke="none"/><circle cx="9" cy="6.5" r=".8" fill="currentColor" stroke="none"/><circle cx="14" cy="6" r=".8" fill="currentColor" stroke="none"/></svg>;
    case "integrations":
      return <svg {...common}><path d="M8 3v4"/><path d="M16 3v4"/><path d="M6 7h12v3a6 6 0 0 1-6 6v5"/><path d="M9 21h6"/></svg>;
    case "users":
      return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15.5a5 5 0 0 1 5 4.5"/></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1A1.7 1.7 0 0 0 19.4 15Z"/></svg>;
    case "external":
      return <svg {...common}><path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg>;
    case "logout":
      return <svg {...common}><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M14 4h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-4"/></svg>;
  }
}

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Navegação administrativa">
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
          >
            <AdminIcon name={item.icon} />
            <span className="admin-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
