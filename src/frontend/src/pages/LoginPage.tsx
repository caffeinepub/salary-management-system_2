import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Users,
    label: "Employee Management",
    desc: "Manage all employee records centrally",
  },
  {
    icon: TrendingUp,
    label: "Salary Processing",
    desc: "Automated payroll with PF, ESI & TDS",
  },
  {
    icon: ShieldCheck,
    label: "Compliance Reports",
    desc: "Form 3A, 6A, ESI & PF reports ready",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both user ID and password");
      return;
    }
    setLoading(true);
    setError("");
    const err = await login(username.trim(), password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-sidebar-foreground">
            Salary Manager
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-4xl font-bold text-sidebar-foreground leading-tight mb-4">
            Payroll management,
            <br />
            <span className="text-sidebar-primary">simplified.</span>
          </h1>
          <p className="text-sidebar-foreground/60 text-base mb-10">
            Manage salaries, attendance, and compliance reports for your entire
            organization from one place.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                  <f.icon
                    className="w-4.5 h-4.5 text-sidebar-primary"
                    size={18}
                  />
                </div>
                <div>
                  <p className="text-sidebar-foreground font-semibold text-sm">
                    {f.label}
                  </p>
                  <p className="text-sidebar-foreground/50 text-xs">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="text-sidebar-foreground/30 text-xs">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-sidebar-foreground/60"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-background flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-sidebar flex items-center justify-center">
              <Building2 className="w-5 h-5 text-sidebar-primary" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Salary Manager
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to access your payroll dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">User ID</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your user ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                data-ocid="login.username.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  className="pr-10"
                  data-ocid="login.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-sm text-destructive"
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={loading}
              data-ocid="login.primary_button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
