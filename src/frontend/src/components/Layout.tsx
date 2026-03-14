import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Building2,
  CalendarCheck,
  FileText,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const allNavItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { path: "/employees", label: "Employees", icon: Users, adminOnly: true },
  {
    path: "/attendance",
    label: "Attendance",
    icon: CalendarCheck,
    adminOnly: true,
  },
  { path: "/salary", label: "Salary", icon: IndianRupee, adminOnly: true },
  { path: "/reports", label: "Reports", icon: FileText, adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPath = location.pathname;
  const isAdmin = user?.role === "admin";
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-700 text-sidebar-foreground text-sm leading-tight">
              Salary
            </p>
            <p className="font-display font-700 text-sidebar-primary text-sm leading-tight">
              Manager
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              currentPath === item.path ||
              (item.path !== "/" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                data-ocid={`nav.${item.label.toLowerCase()}.link`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            onClick={logout}
            data-ocid="nav.logout.button"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden w-full h-full border-0 p-0"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-ocid="nav.menu.toggle"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex-1" />
          {user && (
            <span className="text-xs text-muted-foreground capitalize">
              {user.username} ({user.role})
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
