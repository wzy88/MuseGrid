"use client";

import { usePathname } from "next/navigation";

const navGroups = [
  {
    label: "创作",
    items: [
      { label: "创作台", href: "/studio", match: (pathname: string) => pathname.startsWith("/studio") },
      { label: "我的作品", href: "/works", match: (pathname: string) => pathname.startsWith("/works") },
    ],
  },
  {
    label: "创作人",
    items: [
      {
        label: "申请入驻",
        href: "/become-creator",
        match: (pathname: string) => pathname.startsWith("/become-creator"),
      },
      {
        label: "分身管理",
        href: "/avatar-dashboard",
        match: (pathname: string) => pathname.startsWith("/avatar-dashboard"),
      },
    ],
  },
] as const;

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="sideNav" aria-label="主导航">
      <div className="sideNavBrand">
        <span className="brandMark">MG</span>
        <span>MuseGrid</span>
      </div>
      <div className="sideNavItems">
        {navGroups.map((group) => (
          <div className="sideNavGroup" key={group.label}>
            <span className="sideNavGroupLabel">{group.label}</span>
            <div className="sideNavGroupItems">
              {group.items.map((item) => (
                <a className={item.match(pathname) ? "sideNavItem active" : "sideNavItem"} href={item.href} key={item.label}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
