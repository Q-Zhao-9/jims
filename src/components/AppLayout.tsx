import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeSelect } from "@/components/ThemeSelect";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link${isActive ? " nav-link--active" : ""}`;

const links: { to: string; label: string }[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/applications", label: "Applications" },
  { to: "/resumes", label: "Documents" },
  { to: "/interviews", label: "Interviews" },
  { to: "/reminders", label: "Reminders" },
  { to: "/notes", label: "Notes" },
  { to: "/ai", label: "AI" },
  { to: "/analytics", label: "Analytics" },
  { to: "/employers", label: "Employers" },
];

const toolboxNavClass = ({ isActive }: { isActive: boolean }) =>
  `toolbox-menu__item${isActive ? " toolbox-menu__item--active" : ""}`;

const toolboxLinks: { to: string; label: string }[] = [
  { to: "/salary", label: "Salary calculator" },
];

export function AppLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/sign-in", { replace: true });
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/dashboard" className="brand brand-link">
          <span className="brand-mark">JIMS</span>
          <span className="brand-sub">Job Interview Management</span>
        </Link>
        <nav className="topbar-nav" aria-label="Primary">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navClass} end={to === "/dashboard"}>
              {label}
            </NavLink>
          ))}
          <ThemeSelect />
          <details className="toolbox-menu">
            <summary className="btn btn-ghost toolbox-menu__summary">Toolbox</summary>
            <div className="toolbox-menu__list" role="menu" aria-label="Toolbox">
              {toolboxLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} className={toolboxNavClass} end>
                  {label}
                </NavLink>
              ))}
            </div>
          </details>
          {loading ? (
            <span className="nav-link nav-link--muted">…</span>
          ) : user ? (
            <>
              <span className="nav-user" title={user.email}>
                {user.email}
              </span>
              <button type="button" className="btn btn-ghost nav-logout" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/sign-in" className={navClass}>
              Sign in
            </NavLink>
          )}
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <span>JIMS — UI talks to FastAPI at /api/v1 (Vite proxy → port 8000)</span>
      </footer>
    </div>
  );
}
