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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useAllEmployees, useMonthlyPayBill } from "../hooks/useQueries";

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

function fmt(n: bigint) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [activeTab, setActiveTab] = useState("paybill");
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: employees = [], isLoading: empLoading } = useAllEmployees();
  const { data: payBill = [], isLoading: billLoading } = useMonthlyPayBill(
    BigInt(month),
    BigInt(year),
  );

  const empMap = new Map(employees.map((e) => [e.id, e]));

  const selectedEmp = empMap.get(selectedEmpId);
  const selectedRecord = payBill.find((r) => r.employeeId === selectedEmpId);

  const totals = payBill.reduce(
    (acc, r) => ({
      basic: acc.basic + r.basic,
      hra: acc.hra + r.hra,
      da: acc.da + r.da,
      pf: acc.pf + r.pfDeduction,
      esi: acc.esi + r.esiDeduction,
      tds: acc.tds + r.tds,
      net: acc.net + r.netSalary,
    }),
    { basic: 0n, hra: 0n, da: 0n, pf: 0n, esi: 0n, tds: 0n, net: 0n },
  );

  function handlePrint() {
    window.print();
  }

  const isLoading = empLoading || billLoading;
  const monthLabel = `${MONTHS[month - 1]} ${year}`;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate payroll and compliance reports
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handlePrint}
          data-ocid="reports.print.button"
        >
          <Printer size={16} className="mr-2" /> Print Report
        </Button>
      </div>

      {/* Month/Year */}
      <div className="flex gap-3 mb-5 no-print">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          data-ocid="reports.month.select"
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
          data-ocid="reports.year.input"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 no-print" data-ocid="reports.tabs.tab">
          <TabsTrigger value="paybill" data-ocid="reports.paybill.tab">
            Pay Bill
          </TabsTrigger>
          <TabsTrigger value="salaryslip" data-ocid="reports.salaryslip.tab">
            Salary Slip
          </TabsTrigger>
          <TabsTrigger value="form3a" data-ocid="reports.form3a.tab">
            Form 3A
          </TabsTrigger>
          <TabsTrigger value="form6a" data-ocid="reports.form6a.tab">
            Form 6A
          </TabsTrigger>
          <TabsTrigger value="esi" data-ocid="reports.esi.tab">
            ESI Report
          </TabsTrigger>
          <TabsTrigger value="pf" data-ocid="reports.pf.tab">
            PF Report
          </TabsTrigger>
        </TabsList>

        <div ref={printRef} className="print-area">
          {/* PAY BILL */}
          <TabsContent value="paybill">
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-display text-lg font-bold">
                  Pay Bill — {monthLabel}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Monthly payroll summary
                </p>
              </div>
              {isLoading ? (
                <div
                  className="p-5 space-y-3"
                  data-ocid="reports.paybill.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : payBill.length === 0 ? (
                <div
                  className="text-center py-16"
                  data-ocid="reports.paybill.empty_state"
                >
                  <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No salary records for {monthLabel}
                  </p>
                </div>
              ) : (
                <>
                  <Table data-ocid="reports.paybill.table">
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead className="text-right">Basic</TableHead>
                        <TableHead className="text-right">HRA</TableHead>
                        <TableHead className="text-right">DA</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">PF</TableHead>
                        <TableHead className="text-right">ESI</TableHead>
                        <TableHead className="text-right font-bold">
                          Net
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payBill.map((r, idx) => {
                        const emp = empMap.get(r.employeeId);
                        const gross = r.basic + r.hra + r.da;
                        return (
                          <TableRow
                            key={r.employeeId}
                            data-ocid={`reports.paybill.item.${idx + 1}`}
                          >
                            <TableCell className="text-muted-foreground text-xs">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {emp?.name ?? r.employeeId}
                            </TableCell>
                            <TableCell className="text-sm">
                              {emp?.designation ?? "—"}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {fmt(r.basic)}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {fmt(r.hra)}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {fmt(r.da)}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {fmt(gross)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-destructive">
                              {fmt(r.pfDeduction)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-destructive">
                              {fmt(r.esiDeduction)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-success">
                              {fmt(r.netSalary)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="border-t border-border bg-secondary/30 px-5 py-3 flex flex-wrap gap-6 text-sm font-medium">
                    <span>Basic: {fmt(totals.basic)}</span>
                    <span>HRA: {fmt(totals.hra)}</span>
                    <span>DA: {fmt(totals.da)}</span>
                    <span className="text-destructive">
                      PF: -{fmt(totals.pf)}
                    </span>
                    <span className="text-destructive">
                      ESI: -{fmt(totals.esi)}
                    </span>
                    <span className="text-success font-bold">
                      Net Total: {fmt(totals.net)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* SALARY SLIP */}
          <TabsContent value="salaryslip">
            <div className="space-y-4">
              <div className="no-print">
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[220px]"
                  data-ocid="reports.salaryslip.select"
                >
                  <option value="">Select Employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedEmpId ? (
                <div
                  className="bg-card rounded-lg border p-12 text-center"
                  data-ocid="reports.salaryslip.empty_state"
                >
                  <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Select an employee to view salary slip
                  </p>
                </div>
              ) : !selectedRecord ? (
                <div className="bg-card rounded-lg border p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No salary record for {selectedEmp?.name} in {monthLabel}
                  </p>
                </div>
              ) : (
                <div className="bg-card rounded-lg border border-border shadow-card p-8 max-w-2xl">
                  <div className="text-center border-b border-border pb-4 mb-6">
                    <h2 className="font-display text-2xl font-bold">
                      SALARY SLIP
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {monthLabel}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
                    <div>
                      <span className="text-muted-foreground">
                        Employee Name:
                      </span>{" "}
                      <strong>{selectedEmp?.name}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Employee ID:
                      </span>{" "}
                      <strong>{selectedEmp?.id}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Designation:
                      </span>{" "}
                      <strong>{selectedEmp?.designation}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>{" "}
                      <strong>{selectedEmp?.department}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PF Number:</span>{" "}
                      <strong>{selectedEmp?.pfNumber || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ESI Number:</span>{" "}
                      <strong>{selectedEmp?.esiNumber || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Bank Account:
                      </span>{" "}
                      <strong>{selectedEmp?.bankAccount || "—"}</strong>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-2 border-b pb-1">
                        Earnings
                      </h3>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span>Basic Salary</span>
                          <span>{fmt(selectedRecord.basic)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HRA</span>
                          <span>{fmt(selectedRecord.hra)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DA</span>
                          <span>{fmt(selectedRecord.da)}</span>
                        </div>
                        {selectedRecord.allowances > 0n && (
                          <div className="flex justify-between">
                            <span>Allowances</span>
                            <span>{fmt(selectedRecord.allowances)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Gross</span>
                          <span>
                            {fmt(
                              selectedRecord.basic +
                                selectedRecord.hra +
                                selectedRecord.da +
                                selectedRecord.allowances,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-2 border-b pb-1">
                        Deductions
                      </h3>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span>PF (12%)</span>
                          <span className="text-destructive">
                            {fmt(selectedRecord.pfDeduction)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ESI (0.75%)</span>
                          <span className="text-destructive">
                            {fmt(selectedRecord.esiDeduction)}
                          </span>
                        </div>
                        {selectedRecord.tds > 0n && (
                          <div className="flex justify-between">
                            <span>TDS</span>
                            <span className="text-destructive">
                              {fmt(selectedRecord.tds)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Total Deductions</span>
                          <span className="text-destructive">
                            {fmt(
                              selectedRecord.pfDeduction +
                                selectedRecord.esiDeduction +
                                selectedRecord.tds,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg flex justify-between items-center">
                    <span className="font-display font-bold text-lg">
                      Net Salary
                    </span>
                    <span className="font-display font-bold text-2xl text-success">
                      {fmt(selectedRecord.netSalary)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* FORM 3A */}
          <TabsContent value="form3a">
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-display text-lg font-bold">
                  Form 3A — PF Monthly Challan
                </h2>
                <p className="text-xs text-muted-foreground">
                  {monthLabel} | Member-wise contribution statement
                </p>
              </div>
              {isLoading ? (
                <div className="p-5" data-ocid="reports.form3a.loading_state">
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <Table data-ocid="reports.form3a.table">
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>#</TableHead>
                      <TableHead>Member Name</TableHead>
                      <TableHead>PF Number</TableHead>
                      <TableHead className="text-right">Basic Wages</TableHead>
                      <TableHead className="text-right">
                        Employee PF (12%)
                      </TableHead>
                      <TableHead className="text-right">
                        Employer PF (12%)
                      </TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payBill.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div
                            className="text-center py-8"
                            data-ocid="reports.form3a.empty_state"
                          >
                            <p className="text-sm text-muted-foreground">
                              No records for {monthLabel}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payBill.map((r, idx) => {
                        const emp = empMap.get(r.employeeId);
                        const empPF = r.pfDeduction;
                        const erPF = (r.basic * 12n) / 100n;
                        return (
                          <TableRow
                            key={r.employeeId}
                            data-ocid={`reports.form3a.item.${idx + 1}`}
                          >
                            <TableCell className="text-xs text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {emp?.name ?? r.employeeId}
                            </TableCell>
                            <TableCell className="text-sm">
                              {emp?.pfNumber || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(r.basic)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(empPF)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(erPF)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {fmt(empPF + erPF)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* FORM 6A */}
          <TabsContent value="form6a">
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-display text-lg font-bold">
                  Form 6A — Annual PF Return
                </h2>
                <p className="text-xs text-muted-foreground">
                  Annual member-wise contribution (year {year})
                </p>
              </div>
              {isLoading ? (
                <div className="p-5" data-ocid="reports.form6a.loading_state">
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <Table data-ocid="reports.form6a.table">
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>#</TableHead>
                      <TableHead>Member Name</TableHead>
                      <TableHead>PF Number</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-right">Annual Wages</TableHead>
                      <TableHead className="text-right">Total PF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payBill.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div
                            className="text-center py-8"
                            data-ocid="reports.form6a.empty_state"
                          >
                            <p className="text-sm text-muted-foreground">
                              No records for year {year}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payBill.map((r, idx) => {
                        const emp = empMap.get(r.employeeId);
                        return (
                          <TableRow
                            key={r.employeeId}
                            data-ocid={`reports.form6a.item.${idx + 1}`}
                          >
                            <TableCell className="text-xs text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {emp?.name ?? r.employeeId}
                            </TableCell>
                            <TableCell className="text-sm">
                              {emp?.pfNumber || "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {emp?.designation || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(r.basic * 12n)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {fmt(r.pfDeduction * 12n)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* ESI REPORT */}
          <TabsContent value="esi">
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-display text-lg font-bold">
                  ESI Report — {monthLabel}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Employee State Insurance contribution statement
                </p>
              </div>
              {isLoading ? (
                <div className="p-5" data-ocid="reports.esi.loading_state">
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <Table data-ocid="reports.esi.table">
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>ESI Number</TableHead>
                      <TableHead className="text-right">Gross Wages</TableHead>
                      <TableHead className="text-right">
                        Employee ESI (0.75%)
                      </TableHead>
                      <TableHead className="text-right">
                        Employer ESI (3.25%)
                      </TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payBill.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <div
                            className="text-center py-8"
                            data-ocid="reports.esi.empty_state"
                          >
                            <p className="text-sm text-muted-foreground">
                              No records for {monthLabel}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payBill.map((r, idx) => {
                        const emp = empMap.get(r.employeeId);
                        const gross = r.basic + r.hra + r.da;
                        const empESI = r.esiDeduction;
                        const erESI = (gross * 325n) / 10000n;
                        return (
                          <TableRow
                            key={r.employeeId}
                            data-ocid={`reports.esi.item.${idx + 1}`}
                          >
                            <TableCell className="text-xs text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {emp?.name ?? r.employeeId}
                            </TableCell>
                            <TableCell className="text-sm">
                              {emp?.esiNumber || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(gross)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(empESI)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(erESI)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {fmt(empESI + erESI)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* PF REPORT */}
          <TabsContent value="pf">
            <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-display text-lg font-bold">
                  PF Report — {monthLabel}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Provident Fund contribution statement
                </p>
              </div>
              {isLoading ? (
                <div className="p-5" data-ocid="reports.pf.loading_state">
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : (
                <Table data-ocid="reports.pf.table">
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>PF Number</TableHead>
                      <TableHead className="text-right">Basic</TableHead>
                      <TableHead className="text-right">Emp PF (12%)</TableHead>
                      <TableHead className="text-right">EPS (8.33%)</TableHead>
                      <TableHead className="text-right">EPF (3.67%)</TableHead>
                      <TableHead className="text-right">
                        Total Employer
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payBill.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div
                            className="text-center py-8"
                            data-ocid="reports.pf.empty_state"
                          >
                            <p className="text-sm text-muted-foreground">
                              No records for {monthLabel}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payBill.map((r, idx) => {
                        const emp = empMap.get(r.employeeId);
                        const empPF = r.pfDeduction;
                        const eps = (r.basic * 833n) / 10000n;
                        const epf = (r.basic * 367n) / 10000n;
                        return (
                          <TableRow
                            key={r.employeeId}
                            data-ocid={`reports.pf.item.${idx + 1}`}
                          >
                            <TableCell className="text-xs text-muted-foreground">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {emp?.name ?? r.employeeId}
                            </TableCell>
                            <TableCell className="text-sm">
                              {emp?.pfNumber || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(r.basic)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(empPF)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(eps)}
                            </TableCell>
                            <TableCell className="text-right">
                              {fmt(epf)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {fmt(eps + epf)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-muted-foreground no-print">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
