"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavItem = {
  href: string;
  label: string;
  shortLabel: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
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
            <span className="admin-nav-mark" aria-hidden="true">
              {item.shortLabel}
            </span>
            <span className="admin-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
