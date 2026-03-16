import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type AuthUser = { username: string; role: "admin" | "employee" };

type AuthContextType = {
  user: AuthUser | null;
  login: (username: string, password: string) => string | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "salary_mgr_session";
const EMPLOYEES_KEY = "salary_mgr_employees";

const ADMIN_USERNAME = "yourfriend";
const ADMIN_PASSWORD = "enterpassword";

export type EmployeeCredential = {
  username: string;
  password: string;
  employeeId?: string;
};

export function getEmployeeCredentials(): EmployeeCredential[] {
  try {
    return JSON.parse(localStorage.getItem(EMPLOYEES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveEmployeeCredential(cred: EmployeeCredential) {
  const existing = getEmployeeCredentials().filter(
    (c) => c.username !== cred.username,
  );
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify([...existing, cred]));
}

export function removeEmployeeCredential(username: string) {
  const updated = getEmployeeCredentials().filter(
    (c) => c.username !== username,
  );
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updated));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(
    (username: string, password: string): string | null => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const authUser: AuthUser = { username, role: "admin" };
        setUser(authUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
        return null;
      }
      const employees = getEmployeeCredentials();
      const match = employees.find(
        (e) => e.username === username && e.password === password,
      );
      if (match) {
        const authUser: AuthUser = { username, role: "employee" };
        setUser(authUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
        return null;
      }
      return "Invalid user ID or password";
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
