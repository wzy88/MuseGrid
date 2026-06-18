const navItems = ["创作台", "创作人分身", "我的作品", "贡献链路", "成为创作人", "分身后台", "账户"];

export function SideNav() {
  return (
    <nav className="sideNav" aria-label="MuseGrid">
      <div className="sideNavBrand">
        <span className="brandMark">MG</span>
        <span>MuseGrid</span>
      </div>
      <div className="sideNavItems">
        {navItems.map((item) => (
          <a className={item === "创作台" ? "sideNavItem active" : "sideNavItem"} href="/studio" key={item}>
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}
