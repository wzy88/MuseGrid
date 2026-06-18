import type { ReactNode } from "react";
import type { SessionUser } from "../../lib/auth/session";
import { SideNav } from "./SideNav";

type AppShellProps = {
  user: SessionUser;
  children: ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="appShell">
      <SideNav />
      <div className="appMain">
        <header className="appTopbar">
          <div>
            <h1>新建歌曲项目</h1>
          </div>
          <div className="userBadge">
            <span>{user.name}</span>
            <small>{user.email}</small>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
