import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import LoginPage from "./pages/LoginPage";
import Reports from "./pages/Reports";
import Salary from "./pages/Salary";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppShell />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  ),
});

function AppShell() {
  const { user } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/employees",
  component: Employees,
});

const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/attendance",
  component: Attendance,
});

const salaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/salary",
  component: Salary,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: Reports,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  employeesRoute,
  attendanceRoute,
  salaryRoute,
  reportsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
