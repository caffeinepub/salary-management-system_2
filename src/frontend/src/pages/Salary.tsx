import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator, IndianRupee, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SalaryRecord } from "../backend.d";
import {
  useAddSalaryRecord,
  useAllEmployees,
  useMonthlyPayBill,
} from "../hooks/useQueries";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SKELETON_ROWS = ["sk-sal-1", "sk-sal-2", "sk-sal-3", "sk-sal-4"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

function fmt(n: bigint) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

function calcSalary(
  basic: bigint,
): Omit<SalaryRecord, "employeeId" | "month" | "year" | "isFinalized"> {
  const hra = (basic * 40n) / 100n;
  const da = (basic * 10n) / 100n;
  const allowances = 0n;
  const gross = basic + hra + da + allowances;
  const pfDeduction = (basic * 12n) / 100n;
  const esiDeduction = (gross * 75n) / 10000n;
  const tds = 0n;
  const netSalary = gross - pfDeduction - esiDeduction - tds;
  return {
    basic,
    hra,
    da,
    allowances,
    pfDeduction,
    esiDeduction,
    tds,
    netSalary,
  };
}

export default function Salary() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

  const { data: employees = [], isLoading: empLoading } = useAllEmployees();
  const { data: payBill = [], isLoading: billLoading } = useMonthlyPayBill(
    BigInt(month),
    BigInt(year),
  );
  const addSalary = useAddSalaryRecord();

  const existingMap = new Map(payBill.map((r) => [r.employeeId, r]));

  async function handleProcessAll() {
    if (!isCurrentMonth) {
      toast.error("Cannot modify previous month salary records");
      return;
    }
    try {
      const records: SalaryRecord[] = employees.map((emp) => ({
        ...calcSalary(emp.basicSalary),
        employeeId: emp.id,
        month: BigInt(month),
        year: BigInt(year),
        isFinalized: false,
      }));
      await Promise.all(records.map((r) => addSalary.mutateAsync(r)));
      toast.success("Salary calculated for all employees");
    } catch {
      toast.error("Failed to process salary");
    }
  }

  const totals = payBill.reduce(
    (acc, r) => ({
      basic: acc.basic + r.basic,
      hra: acc.hra + r.hra,
      da: acc.da + r.da,
      pf: acc.pf + r.pfDeduction,
      esi: acc.esi + r.esiDeduction,
      net: acc.net + r.netSalary,
    }),
    { basic: 0n, hra: 0n, da: 0n, pf: 0n, esi: 0n, net: 0n },
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Salary</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isCurrentMonth
              ? "Current month — editable"
              : "Previous month — read only"}
          </p>
        </div>
        <div className="flex gap-2">
          {!isCurrentMonth && (
            <Badge variant="secondary" className="gap-1">
              <Lock size={12} /> Locked
            </Badge>
          )}
          {isCurrentMonth && (
            <Button
              onClick={handleProcessAll}
              disabled={addSalary.isPending}
              data-ocid="salary.process.primary_button"
            >
              <Calculator size={16} className="mr-2" />
              {addSalary.isPending ? "Processing..." : "Calculate Salary"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          data-ocid="salary.month.select"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-9 w-24 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          data-ocid="salary.year.input"
        />
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <Table data-ocid="salary.table">
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="font-semibold">Employee</TableHead>
              <TableHead className="font-semibold text-right">Basic</TableHead>
              <TableHead className="font-semibold text-right">
                HRA (40%)
              </TableHead>
              <TableHead className="font-semibold text-right">
                DA (10%)
              </TableHead>
              <TableHead className="font-semibold text-right">Gross</TableHead>
              <TableHead className="font-semibold text-right">
                PF (12%)
              </TableHead>
              <TableHead className="font-semibold text-right">
                ESI (0.75%)
              </TableHead>
              <TableHead className="font-semibold text-right">
                Net Salary
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empLoading || billLoading ? (
              SKELETON_ROWS.map((rowKey) => (
                <TableRow key={rowKey} data-ocid="salary.loading_state">
                  {SKELETON_COLS.map((colKey) => (
                    <TableCell key={colKey}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div
                    className="text-center py-12"
                    data-ocid="salary.empty_state"
                  >
                    <IndianRupee className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No employees found.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp, idx) => {
                const rec = existingMap.get(emp.id);
                const calc = rec ?? calcSalary(emp.basicSalary);
                const gross = calc.basic + calc.hra + calc.da;
                return (
                  <TableRow
                    key={emp.id}
                    className={!rec ? "opacity-60" : ""}
                    data-ocid={`salary.item.${idx + 1}`}
                  >
                    <TableCell>
                      <p className="font-medium text-sm">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {emp.designation}
                      </p>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {fmt(calc.basic)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {fmt(calc.hra)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {fmt(calc.da)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {fmt(gross)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-destructive">
                      -{fmt(calc.pfDeduction)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-destructive">
                      -{fmt(calc.esiDeduction)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-success">
                      {fmt(calc.netSalary)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {payBill.length > 0 && (
          <div className="border-t border-border bg-secondary/30 px-4 py-3 flex flex-wrap gap-6 text-sm">
            <span>
              <span className="text-muted-foreground">Total Basic:</span>{" "}
              <strong>{fmt(totals.basic)}</strong>
            </span>
            <span>
              <span className="text-muted-foreground">Total PF:</span>{" "}
              <strong className="text-destructive">{fmt(totals.pf)}</strong>
            </span>
            <span>
              <span className="text-muted-foreground">Total ESI:</span>{" "}
              <strong className="text-destructive">{fmt(totals.esi)}</strong>
            </span>
            <span>
              <span className="text-muted-foreground">Total Net:</span>{" "}
              <strong className="text-success text-base">
                {fmt(totals.net)}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
