import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  FileText,
  IndianRupee,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useAllEmployees, useMonthlyPayBill } from "../hooks/useQueries";

function fmt(n: bigint) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

export default function Dashboard() {
  const now = new Date();
  const month = BigInt(now.getMonth() + 1);
  const year = BigInt(now.getFullYear());
  const { data: employees = [], isLoading: empLoading } = useAllEmployees();
  const { data: payBill = [], isLoading: billLoading } = useMonthlyPayBill(
    month,
    year,
  );

  const totalNet = payBill.reduce((sum, r) => sum + r.netSalary, 0n);
  const totalPF = payBill.reduce((sum, r) => sum + r.pfDeduction, 0n);
  const totalESI = payBill.reduce((sum, r) => sum + r.esiDeduction, 0n);

  const monthName = now.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const stats = [
    {
      label: "Total Employees",
      value: employees.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Net Payroll",
      value: billLoading ? "..." : fmt(totalNet),
      icon: IndianRupee,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "PF Deductions",
      value: billLoading ? "..." : fmt(totalPF),
      icon: TrendingUp,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "ESI Deductions",
      value: billLoading ? "..." : fmt(totalESI),
      icon: CalendarCheck,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Payroll overview for {monthName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      {s.label}
                    </p>
                    {empLoading && s.label === "Total Employees" ? (
                      <Skeleton
                        className="h-7 w-20"
                        data-ocid="dashboard.loading_state"
                      />
                    ) : (
                      <p className="text-2xl font-bold font-display text-foreground">
                        {s.value}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center`}
                  >
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                to: "/employees",
                label: "Add New Employee",
                desc: "Register a new team member",
                ocid: "dashboard.employees.link",
              },
              {
                to: "/attendance",
                label: "Record Attendance",
                desc: `Mark attendance for ${monthName}`,
                ocid: "dashboard.attendance.link",
              },
              {
                to: "/salary",
                label: "Process Salary",
                desc: `Generate payroll for ${monthName}`,
                ocid: "dashboard.salary.link",
              },
              {
                to: "/reports",
                label: "View Reports",
                desc: "Generate pay bill & compliance reports",
                ocid: "dashboard.reports.link",
              },
            ].map((action) => (
              <Link key={action.to} to={action.to} data-ocid={action.ocid}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {action.desc}
                    </p>
                  </div>
                  <span className="text-muted-foreground">→</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Current Month Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {billLoading ? (
              <div
                className="space-y-3"
                data-ocid="dashboard.summary.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : payBill.length === 0 ? (
              <div
                className="text-center py-8"
                data-ocid="dashboard.summary.empty_state"
              >
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No salary records for this month
                </p>
                <Link to="/salary">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    data-ocid="dashboard.salary.secondary_button"
                  >
                    Process Salary
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {payBill.slice(0, 5).map((r, idx) => {
                  const emp = employees.find((e) => e.id === r.employeeId);
                  return (
                    <div
                      key={r.employeeId}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      data-ocid={`dashboard.salary.item.${idx + 1}`}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {emp?.name ?? r.employeeId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp?.designation ?? "—"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-success">
                        {fmt(r.netSalary)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
