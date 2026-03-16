import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ShieldCheck, TrendingUp, Users } from "lucide-react";
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

function AnimatedLogo({ size = 208 }: { size?: number }) {
  const id = `logo-${size}`;
  return (
    <>
      <style>{`
        @keyframes svg-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes svg-spin-ring {
          from { transform: rotate(0deg); transform-origin: 150px 150px; }
          to { transform: rotate(360deg); transform-origin: 150px 150px; }
        }
        @keyframes svg-spin-ring-rev {
          from { transform: rotate(0deg); transform-origin: 150px 150px; }
          to { transform: rotate(-360deg); transform-origin: 150px 150px; }
        }
        @keyframes svg-pulse-node {
          0%, 100% { opacity: 0.4; r: 4; }
          50% { opacity: 1; r: 6; }
        }
        @keyframes svg-pulse-node2 {
          0%, 100% { opacity: 0.5; r: 3; }
          50% { opacity: 1; r: 5; }
        }
        @keyframes svg-shimmer-star {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.9; }
        }
        @keyframes svg-glow-brain {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .logo-float-g { animation: svg-float 3.2s ease-in-out infinite; }
        .logo-ring1 { animation: svg-spin-ring 4s linear infinite; }
        .logo-ring2 { animation: svg-spin-ring-rev 7s linear infinite; }
        .logo-node1 { animation: svg-pulse-node 2s ease-in-out infinite; }
        .logo-node2 { animation: svg-pulse-node2 2.5s ease-in-out infinite 0.3s; }
        .logo-node3 { animation: svg-pulse-node 1.8s ease-in-out infinite 0.6s; }
        .logo-node4 { animation: svg-pulse-node2 2.2s ease-in-out infinite 0.9s; }
        .logo-node5 { animation: svg-pulse-node 2.8s ease-in-out infinite 0.4s; }
        .logo-node6 { animation: svg-pulse-node2 1.9s ease-in-out infinite 1.1s; }
        .logo-brain-lines { animation: svg-glow-brain 2.5s ease-in-out infinite; }
        .logo-star1 { animation: svg-shimmer-star 2.1s ease-in-out infinite; }
        .logo-star2 { animation: svg-shimmer-star 1.7s ease-in-out infinite 0.4s; }
        .logo-star3 { animation: svg-shimmer-star 2.4s ease-in-out infinite 0.8s; }
        .logo-star4 { animation: svg-shimmer-star 1.5s ease-in-out infinite 1.2s; }
        .logo-star5 { animation: svg-shimmer-star 2.8s ease-in-out infinite 0.2s; }
        .logo-star6 { animation: svg-shimmer-star 1.9s ease-in-out infinite 0.6s; }
        .logo-star7 { animation: svg-shimmer-star 2.3s ease-in-out infinite 1s; }
        .logo-star8 { animation: svg-shimmer-star 1.6s ease-in-out infinite 1.4s; }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <title>Yf's Platform - Salary Management System Logo</title>
        <defs>
          <radialGradient id={`${id}-glow`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <filter id={`${id}-glow-filter`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="300" height="300" rx="18" fill="#ffffff" />
        <rect
          x="0"
          y="0"
          width="300"
          height="300"
          rx="18"
          fill={`url(#${id}-glow)`}
        />

        {/* Background star dots */}
        <circle className="logo-star1" cx="24" cy="28" r="1.5" fill="black" />
        <circle className="logo-star2" cx="48" cy="52" r="1" fill="black" />
        <circle className="logo-star3" cx="260" cy="20" r="1.5" fill="black" />
        <circle className="logo-star4" cx="280" cy="55" r="1" fill="black" />
        <circle className="logo-star5" cx="18" cy="180" r="1.5" fill="black" />
        <circle className="logo-star6" cx="285" cy="170" r="1" fill="black" />
        <circle className="logo-star7" cx="35" cy="255" r="1.5" fill="black" />
        <circle className="logo-star8" cx="270" cy="245" r="1" fill="black" />
        {/* extra tiny stars */}
        <circle className="logo-star2" cx="255" cy="88" r="1" fill="black" />
        <circle className="logo-star5" cx="55" cy="90" r="1" fill="black" />

        {/* Outer spinning rings */}
        <circle
          className="logo-ring1"
          cx="150"
          cy="130"
          r="105"
          fill="none"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="1"
          strokeDasharray="12 8"
        />
        <circle
          className="logo-ring2"
          cx="150"
          cy="130"
          r="118"
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="1"
          strokeDasharray="6 14"
        />

        {/* Floating group */}
        <g className="logo-float-g">
          {/* Head outline */}
          {/* Neck */}
          <path
            d="M135 195 L135 210 Q150 218 165 210 L165 195"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Shoulders hint */}
          <path
            d="M120 218 Q135 212 150 215 Q165 212 180 218"
            fill="none"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="1.5"
          />
          {/* Head shape */}
          <path
            d="M105 155
               Q104 120 115 100
               Q130 72 150 70
               Q170 72 185 100
               Q196 120 195 155
               Q195 180 185 192
               Q170 202 150 203
               Q130 202 115 192
               Q105 180 105 155 Z"
            fill="#f8f8f8"
            stroke="black"
            strokeWidth="2.5"
          />
          {/* Open skull top - cut line */}
          <path
            d="M118 95 Q134 80 150 78 Q166 80 182 95"
            fill="none"
            stroke="black"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Lifted skull cap */}
          <path
            d="M118 95 Q120 78 134 68 Q150 60 166 68 Q180 78 182 95"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />

          {/* Eyes */}
          <ellipse
            cx="135"
            cy="155"
            rx="6"
            ry="5"
            fill="none"
            stroke="black"
            strokeWidth="1.5"
          />
          <ellipse
            cx="165"
            cy="155"
            rx="6"
            ry="5"
            fill="none"
            stroke="black"
            strokeWidth="1.5"
          />
          {/* Pupils */}
          <circle cx="135" cy="155" r="2" fill="black" />
          <circle cx="165" cy="155" r="2" fill="black" />

          {/* Nose */}
          <path
            d="M150 160 Q147 168 142 172 Q150 175 158 172 Q153 168 150 160"
            fill="none"
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="1.2"
          />

          {/* Mouth */}
          <path
            d="M138 182 Q150 188 162 182"
            fill="none"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Neural network inside head (brain area) */}
          <g className="logo-brain-lines" filter={`url(#${id}-glow-filter)`}>
            {/* Brain circuit lines */}
            <line
              x1="130"
              y1="88"
              x2="150"
              y2="95"
              stroke="black"
              strokeWidth="1"
              opacity="0.8"
            />
            <line
              x1="150"
              y1="95"
              x2="170"
              y2="88"
              stroke="black"
              strokeWidth="1"
              opacity="0.8"
            />
            <line
              x1="150"
              y1="95"
              x2="150"
              y2="115"
              stroke="black"
              strokeWidth="1"
              opacity="0.8"
            />
            <line
              x1="130"
              y1="88"
              x2="120"
              y2="102"
              stroke="black"
              strokeWidth="1"
              opacity="0.7"
            />
            <line
              x1="170"
              y1="88"
              x2="180"
              y2="102"
              stroke="black"
              strokeWidth="1"
              opacity="0.7"
            />
            <line
              x1="120"
              y1="102"
              x2="135"
              y2="112"
              stroke="black"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1="180"
              y1="102"
              x2="165"
              y2="112"
              stroke="black"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1="135"
              y1="112"
              x2="150"
              y2="115"
              stroke="black"
              strokeWidth="1"
              opacity="0.7"
            />
            <line
              x1="165"
              y1="112"
              x2="150"
              y2="115"
              stroke="black"
              strokeWidth="1"
              opacity="0.7"
            />
            <line
              x1="135"
              y1="112"
              x2="130"
              y2="125"
              stroke="black"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="165"
              y1="112"
              x2="170"
              y2="125"
              stroke="black"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="150"
              y1="115"
              x2="145"
              y2="128"
              stroke="black"
              strokeWidth="1"
              opacity="0.5"
            />
            <line
              x1="150"
              y1="115"
              x2="155"
              y2="128"
              stroke="black"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* extra cross-connections */}
            <line
              x1="130"
              y1="88"
              x2="135"
              y2="112"
              stroke="black"
              strokeWidth="0.8"
              opacity="0.35"
            />
            <line
              x1="170"
              y1="88"
              x2="165"
              y2="112"
              stroke="black"
              strokeWidth="0.8"
              opacity="0.35"
            />
            <line
              x1="120"
              y1="102"
              x2="150"
              y2="95"
              stroke="black"
              strokeWidth="0.8"
              opacity="0.3"
            />
            <line
              x1="180"
              y1="102"
              x2="150"
              y2="95"
              stroke="black"
              strokeWidth="0.8"
              opacity="0.3"
            />
          </g>

          {/* Brain nodes */}
          <circle className="logo-node1" cx="130" cy="88" r="4" fill="black" />
          <circle className="logo-node2" cx="150" cy="95" r="4" fill="black" />
          <circle className="logo-node3" cx="170" cy="88" r="4" fill="black" />
          <circle className="logo-node4" cx="120" cy="102" r="3" fill="black" />
          <circle className="logo-node5" cx="180" cy="102" r="3" fill="black" />
          <circle
            className="logo-node1"
            cx="135"
            cy="112"
            r="3.5"
            fill="black"
          />
          <circle
            className="logo-node3"
            cx="165"
            cy="112"
            r="3.5"
            fill="black"
          />
          <circle
            className="logo-node6"
            cx="150"
            cy="115"
            r="4.5"
            fill="black"
          />
          <circle
            className="logo-node2"
            cx="130"
            cy="125"
            r="2.5"
            fill="rgba(0,0,0,0.7)"
          />
          <circle
            className="logo-node4"
            cx="170"
            cy="125"
            r="2.5"
            fill="rgba(0,0,0,0.7)"
          />
          <circle
            className="logo-node5"
            cx="145"
            cy="128"
            r="2"
            fill="rgba(0,0,0,0.6)"
          />
          <circle
            className="logo-node6"
            cx="155"
            cy="128"
            r="2"
            fill="rgba(0,0,0,0.6)"
          />
        </g>

        {/* Text below - "Yf's Platform" only, no SYNAPSE AI */}
        <text
          x="150"
          y="255"
          textAnchor="middle"
          fill="black"
          fontFamily="'Courier New', monospace"
          fontWeight="bold"
          fontSize="14"
          letterSpacing="2"
        >
          Yf&apos;s Platform
        </text>

        {/* Bottom decorative line */}
        <line
          x1="80"
          y1="270"
          x2="220"
          y2="270"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="1"
        />
      </svg>
    </>
  );
}

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
    const err = login(username.trim(), password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="min-h-screen bg-sidebar flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12">
        <div className="flex items-center gap-3">
          <AnimatedLogo size={48} />
          <span className="font-display text-xl font-bold text-sidebar-foreground">
            Salary Management
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated logo centered */}
          <div className="flex justify-center mb-8">
            <AnimatedLogo size={208} />
          </div>

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
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <AnimatedLogo size={96} />
            <span className="font-display text-xl font-bold text-foreground">
              Salary Management
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
                autoFocus
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
