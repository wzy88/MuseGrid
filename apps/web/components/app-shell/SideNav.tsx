"use client";

import { usePathname } from "next/navigation";

const navItems = [
  { label: "创作台", href: "/studio", match: (pathname: string) => pathname.startsWith("/studio") },
  { label: "创作人分身", href: "/studio", match: () => false },
  { label: "我的作品", href: "/works", match: (pathname: string) => pathname.startsWith("/works") },
  { label: "贡献链路", href: "/studio", match: () => false },
  {
    label: "成为创作人",
    href: "/become-creator",
    match: (pathname: string) => pathname.startsWith("/become-creator"),
  },
  {
    label: "分身后台",
    href: "/avatar-dashboard",
    match: (pathname: string) => pathname.startsWith("/avatar-dashboard"),
  },
  { label: "账户", href: "/studio", match: () => false },
] as const;

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="sideNav" aria-label="MuseGrid">
      <div className="sideNavBrand">
        <span className="brandMark">MG</span>
        <span>MuseGrid</span>
      </div>
      <div className="sideNavItems">
        {navItems.map((item) => (
          <a className={item.match(pathname) ? "sideNavItem active" : "sideNavItem"} href={item.href} key={item.label}>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
