import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, Lock, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAllEmployees } from "../hooks/useQueries";

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

const INSTITUTES = [
  "Bhel Shiksha Mandal",
  "Jawharlal Nehru School (PW)",
  "Jawharlal Nehru School (SW)",
  "Vikram Higher Secondary School",
  "Kasturba College Of Nursing",
];

const SALARY_STORAGE_KEY = "salary_mgr_salary";
const ATTENDANCE_KEY = "salary_mgr_attendance";

interface SalaryFields {
  lwp: number;
  specialPay: number;
  bonus: number;
  daArrears: number;
  conveyanceAllowance: number;
  washingAllowance: number;
  ltc: number;
  festivalAdvance: number;
  incentive: number;
  otherEarnings: number;
  houseRent: number;
  electricityCharges: number;
  lwf: number;
  vpf: number;
  lic: number;
  profTax: number;
  incomeTax: number;
  festivalAdvanceRecovery: number;
  securityDeposit: number;
  otherDeductions: number;
}

const DEFAULT_FIELDS: SalaryFields = {
  lwp: 0,
  specialPay: 0,
  bonus: 0,
  daArrears: 0,
  conveyanceAllowance: 0,
  washingAllowance: 0,
  ltc: 0,
  festivalAdvance: 0,
  incentive: 0,
  otherEarnings: 0,
  houseRent: 0,
  electricityCharges: 0,
  lwf: 0,
  vpf: 0,
  lic: 0,
  profTax: 0,
  incomeTax: 0,
  festivalAdvanceRecovery: 0,
  securityDeposit: 0,
  otherDeductions: 0,
};

function calcRow(basic: number, fields: SalaryFields) {
  const da = Math.round(basic * 2.57);
  const hra = Math.round(basic * 0.2);
  const grossEarnings =
    basic +
    fields.specialPay +
    da +
    hra +
    fields.bonus +
    fields.daArrears +
    fields.conveyanceAllowance +
    fields.washingAllowance +
    fields.ltc +
    fields.festivalAdvance +
    fields.incentive +
    fields.otherEarnings;
  const epf = Math.round(basic * 0.12);
  const esi = Math.round(grossEarnings * 0.0075);
  const totalDeductions =
    fields.houseRent +
    fields.electricityCharges +
    fields.lwf +
    epf +
    fields.vpf +
    fields.lic +
    fields.profTax +
    fields.incomeTax +
    fields.festivalAdvanceRecovery +
    esi +
    fields.securityDeposit +
    fields.otherDeductions;
  const netEarnings = grossEarnings - totalDeductions;
  return { da, hra, grossEarnings, epf, esi, totalDeductions, netEarnings };
}

const SKELETON_ROWS = ["sk1", "sk2", "sk3", "sk4"];
const COL_SPAN = 30;

export default function Salary() {
  const now = new Date();
  const [selectedInstitute, setSelectedInstitute] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

  const [fieldsMap, setFieldsMap] = useState<Record<string, SalaryFields>>({});
  const [isSaved, setIsSaved] = useState(false);

  const { data: allEmployees = [], isLoading: empLoading } = useAllEmployees();

  const employees = selectedInstitute
    ? allEmployees.filter((emp) => emp.institute === selectedInstitute)
    : [];

  useEffect(() => {
    if (!selectedInstitute) return;
    try {
      const raw = JSON.parse(localStorage.getItem(SALARY_STORAGE_KEY) ?? "[]");
      const empIds = new Set(
        allEmployees
          .filter((e) => e.institute === selectedInstitute)
          .map((e) => e.id),
      );
      const existing = raw.filter(
        (r: { employeeId: string; month: number; year: number }) =>
          empIds.has(r.employeeId) &&
          String(r.month) === String(month) &&
          String(r.year) === String(year),
      );
      if (existing.length > 0) {
        const newMap: Record<string, SalaryFields> = {};
        for (const r of existing) {
          newMap[r.employeeId] = {
            lwp: r.lwp ?? 0,
            specialPay: r.specialPay ?? 0,
            bonus: r.bonus ?? 0,
            daArrears: r.daArrears ?? 0,
            conveyanceAllowance: r.conveyanceAllowance ?? 0,
            washingAllowance: r.washingAllowance ?? 0,
            ltc: r.ltc ?? 0,
            festivalAdvance: r.festivalAdvance ?? 0,
            incentive: r.incentive ?? 0,
            otherEarnings: r.otherEarnings ?? 0,
            houseRent: r.houseRent ?? 0,
            electricityCharges: r.electricityCharges ?? 0,
            lwf: r.lwf ?? 0,
            vpf: r.vpf ?? 0,
            lic: r.lic ?? 0,
            profTax: r.profTax ?? 0,
            incomeTax: r.incomeTax ?? 0,
            festivalAdvanceRecovery: r.festivalAdvanceRecovery ?? 0,
            securityDeposit: r.securityDeposit ?? 0,
            otherDeductions: r.otherDeductions ?? 0,
          };
        }
        setFieldsMap(newMap);
        setIsSaved(true);
      } else {
        setFieldsMap({});
        setIsSaved(false);
      }
    } catch {
      setFieldsMap({});
      setIsSaved(false);
    }
  }, [selectedInstitute, month, year, allEmployees]);

  function getFields(empId: string): SalaryFields {
    return fieldsMap[empId] ?? DEFAULT_FIELDS;
  }

  function setField(empId: string, field: keyof SalaryFields, value: number) {
    setFieldsMap((prev) => ({
      ...prev,
      [empId]: { ...(prev[empId] ?? DEFAULT_FIELDS), [field]: value },
    }));
  }

  function handleClear() {
    setFieldsMap({});
    toast.info("Salary fields cleared");
  }

  function handleSave() {
    if (!selectedInstitute) {
      toast.error("Please select an institute first");
      return;
    }
    if (!isCurrentMonth) {
      toast.error("Cannot modify previous month salary records");
      return;
    }
    try {
      const raw = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) ?? "[]");
      const empIds = new Set(employees.map((e) => e.id));
      const hasAttendance = raw.some(
        (r: { employeeId: string; month: string; year: string }) =>
          empIds.has(r.employeeId) &&
          String(r.month) === String(month) &&
          String(r.year) === String(year),
      );
      if (!hasAttendance) {
        toast.error(
          `Please save attendance for ${selectedInstitute} first before saving salary`,
        );
        return;
      }
    } catch {
      toast.error(
        `Please save attendance for ${selectedInstitute} first before saving salary`,
      );
      return;
    }
    try {
      const existing = JSON.parse(
        localStorage.getItem(SALARY_STORAGE_KEY) ?? "[]",
      );
      const empIds = new Set(employees.map((e) => e.id));
      const filtered = existing.filter(
        (r: { employeeId: string; month: string; year: string }) =>
          !(
            empIds.has(r.employeeId) &&
            String(r.month) === String(month) &&
            String(r.year) === String(year)
          ),
      );
      const newRecords = employees.map((emp) => {
        const basic = Number(emp.basicSalary);
        const fields = getFields(emp.id);
        const calc = calcRow(basic, fields);
        return {
          employeeId: emp.id,
          employeeName: emp.name,
          month,
          year,
          institute: selectedInstitute,
          basic,
          ...fields,
          ...calc,
        };
      });
      localStorage.setItem(
        SALARY_STORAGE_KEY,
        JSON.stringify([...filtered, ...newRecords]),
      );
      setIsSaved(true);
      toast.success(
        `Salary saved for ${selectedInstitute} - ${MONTHS[month - 1]} ${year}`,
      );
    } catch {
      toast.error("Failed to save salary");
    }
  }

  function handleDelete() {
    if (!selectedInstitute) {
      toast.error("Please select an institute first");
      return;
    }
    if (
      !window.confirm(
        `Delete salary for ${selectedInstitute} - ${MONTHS[month - 1]} ${year}?`,
      )
    )
      return;
    try {
      const existing = JSON.parse(
        localStorage.getItem(SALARY_STORAGE_KEY) ?? "[]",
      );
      const empIds = new Set(employees.map((e) => e.id));
      const filtered = existing.filter(
        (r: { employeeId: string; month: string; year: string }) =>
          !(
            empIds.has(r.employeeId) &&
            String(r.month) === String(month) &&
            String(r.year) === String(year)
          ),
      );
      localStorage.setItem(SALARY_STORAGE_KEY, JSON.stringify(filtered));
      setFieldsMap({});
      setIsSaved(false);
      toast.success(
        `Salary deleted for ${selectedInstitute} - ${MONTHS[month - 1]} ${year}`,
      );
    } catch {
      toast.error("Failed to delete salary records");
    }
  }

  const totals = employees.reduce(
    (acc, emp) => {
      const basic = Number(emp.basicSalary);
      const fields = getFields(emp.id);
      const calc = calcRow(basic, fields);
      return {
        basic: acc.basic + basic,
        lwp: acc.lwp + fields.lwp,
        specialPay: acc.specialPay + fields.specialPay,
        da: acc.da + calc.da,
        hra: acc.hra + calc.hra,
        bonus: acc.bonus + fields.bonus,
        daArrears: acc.daArrears + fields.daArrears,
        conveyanceAllowance:
          acc.conveyanceAllowance + fields.conveyanceAllowance,
        washingAllowance: acc.washingAllowance + fields.washingAllowance,
        ltc: acc.ltc + fields.ltc,
        festivalAdvance: acc.festivalAdvance + fields.festivalAdvance,
        incentive: acc.incentive + fields.incentive,
        otherEarnings: acc.otherEarnings + fields.otherEarnings,
        grossEarnings: acc.grossEarnings + calc.grossEarnings,
        houseRent: acc.houseRent + fields.houseRent,
        electricityCharges: acc.electricityCharges + fields.electricityCharges,
        lwf: acc.lwf + fields.lwf,
        epf: acc.epf + calc.epf,
        vpf: acc.vpf + fields.vpf,
        lic: acc.lic + fields.lic,
        profTax: acc.profTax + fields.profTax,
        incomeTax: acc.incomeTax + fields.incomeTax,
        festivalAdvanceRecovery:
          acc.festivalAdvanceRecovery + fields.festivalAdvanceRecovery,
        esi: acc.esi + calc.esi,
        securityDeposit: acc.securityDeposit + fields.securityDeposit,
        otherDeductions: acc.otherDeductions + fields.otherDeductions,
        totalDeductions: acc.totalDeductions + calc.totalDeductions,
        netEarnings: acc.netEarnings + calc.netEarnings,
      };
    },
    {
      basic: 0,
      lwp: 0,
      specialPay: 0,
      da: 0,
      hra: 0,
      bonus: 0,
      daArrears: 0,
      conveyanceAllowance: 0,
      washingAllowance: 0,
      ltc: 0,
      festivalAdvance: 0,
      incentive: 0,
      otherEarnings: 0,
      grossEarnings: 0,
      houseRent: 0,
      electricityCharges: 0,
      lwf: 0,
      epf: 0,
      vpf: 0,
      lic: 0,
      profTax: 0,
      incomeTax: 0,
      festivalAdvanceRecovery: 0,
      esi: 0,
      securityDeposit: 0,
      otherDeductions: 0,
      totalDeductions: 0,
      netEarnings: 0,
    },
  );

  const inp2 =
    "w-20 h-7 rounded border border-input bg-background px-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed";
  const th = "text-xs font-semibold whitespace-nowrap px-2 py-2";
  const td = "px-2 py-1.5 text-xs text-right whitespace-nowrap";
  const tdCalc =
    "px-2 py-1.5 text-xs text-right whitespace-nowrap bg-muted/40 font-medium";
  const tdAmber = `${tdCalc} bg-amber-50/30 dark:bg-amber-950/10`;
  const thAmber = `${th} bg-amber-50/50 dark:bg-amber-950/20`;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Salary</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSaved ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Lock size={12} /> Saved — delete to edit
              </span>
            ) : isCurrentMonth ? (
              "Current month — editable"
            ) : (
              "Previous month — read only"
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isSaved}
            data-ocid="salary.clear.button"
          >
            <RotateCcw size={14} className="mr-1.5" /> Clear
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!selectedInstitute || !isCurrentMonth || isSaved}
            data-ocid="salary.save.primary_button"
          >
            <Save size={14} className="mr-1.5" /> Save Salary
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={!selectedInstitute}
            data-ocid="salary.delete.delete_button"
          >
            <Trash2 size={14} className="mr-1.5" /> Delete Salary
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div>
          <label
            htmlFor="sal-institute"
            className="text-xs font-medium text-muted-foreground mb-1 block"
          >
            Institute
          </label>
          <select
            id="sal-institute"
            value={selectedInstitute}
            onChange={(e) => {
              setSelectedInstitute(e.target.value);
              setIsSaved(false);
            }}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-52"
            data-ocid="salary.institute.select"
          >
            <option value="">-- Select Institute --</option>
            {INSTITUTES.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="sal-month"
            className="text-xs font-medium text-muted-foreground mb-1 block"
          >
            Month
          </label>
          <select
            id="sal-month"
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
        </div>
        <div>
          <label
            htmlFor="sal-year"
            className="text-xs font-medium text-muted-foreground mb-1 block"
          >
            Year
          </label>
          <input
            id="sal-year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 w-24 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            data-ocid="salary.year.input"
          />
        </div>
      </div>

      <div
        className="bg-card rounded-lg border border-border shadow-sm overflow-x-auto"
        data-ocid="salary.table"
      >
        <table className="min-w-max w-full text-sm border-collapse">
          <thead>
            <tr className="bg-secondary/60 border-b border-border">
              <th
                className={`${th} text-left sticky left-0 bg-secondary/60 z-10 min-w-8`}
              >
                #
              </th>
              <th className={`${th} text-left min-w-36`}>Employee Name</th>
              <th className={th}>Basic Pay</th>
              <th className={th}>LWP</th>
              <th className={th}>Special Pay</th>
              <th className={thAmber}>DA@257%</th>
              <th className={thAmber}>HRA@20%</th>
              <th className={th}>Bonus</th>
              <th className={th}>DA Arrears</th>
              <th className={th}>Conveyance Allow.</th>
              <th className={th}>Washing Allow.</th>
              <th className={th}>LTC</th>
              <th className={th}>Festival Adv.</th>
              <th className={th}>Incentive</th>
              <th className={th}>Other Earnings</th>
              <th
                className={`${th} bg-green-50/70 dark:bg-green-950/30 text-green-700 dark:text-green-400`}
              >
                Gross Earnings
              </th>
              <th className={th}>House Rent</th>
              <th className={th}>Electricity Charges</th>
              <th className={th}>LWF</th>
              <th className={thAmber}>EPF@12%</th>
              <th className={th}>VPF</th>
              <th className={th}>LIC</th>
              <th className={th}>Prof. Tax</th>
              <th className={th}>Income Tax</th>
              <th className={th}>Fest. Adv. Recovery</th>
              <th className={thAmber}>ESI@0.75%</th>
              <th className={th}>Security Deposit</th>
              <th className={th}>Other Deductions</th>
              <th
                className={`${th} bg-red-50/70 dark:bg-red-950/30 text-red-700 dark:text-red-400`}
              >
                Total Deductions
              </th>
              <th
                className={`${th} bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400`}
              >
                Net Earnings
              </th>
            </tr>
          </thead>
          <tbody>
            {empLoading ? (
              SKELETON_ROWS.map((k) => (
                <tr key={k} data-ocid="salary.loading_state">
                  {Array.from({ length: COL_SPAN }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                    <td key={i} className="px-2 py-2">
                      <Skeleton className="h-4 w-14" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !selectedInstitute ? (
              <tr>
                <td colSpan={COL_SPAN}>
                  <div
                    className="text-center py-12"
                    data-ocid="salary.empty_state"
                  >
                    <IndianRupee className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Select an institute above to load employees.
                    </p>
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={COL_SPAN}>
                  <div
                    className="text-center py-12"
                    data-ocid="salary.empty_state"
                  >
                    <IndianRupee className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No employees found for this institute.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((emp, idx) => {
                const basic = Number(emp.basicSalary);
                const fields = getFields(emp.id);
                const calc = calcRow(basic, fields);
                const locked = isSaved || !isCurrentMonth;

                function renderInput(field: keyof SalaryFields) {
                  return (
                    <input
                      type="number"
                      min="0"
                      value={fields[field]}
                      disabled={locked}
                      className={inp2}
                      onChange={(e) =>
                        setField(emp.id, field, Number(e.target.value))
                      }
                      data-ocid={`salary.${field}.input`}
                    />
                  );
                }

                return (
                  <tr
                    key={emp.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`salary.item.${idx + 1}`}
                  >
                    <td className="px-2 py-1.5 text-xs text-muted-foreground sticky left-0 bg-card">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-1.5">
                      <p className="text-xs font-medium whitespace-nowrap">
                        {emp.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emp.designation}
                      </p>
                    </td>
                    <td className={tdCalc}>{basic.toLocaleString("en-IN")}</td>
                    <td className={td}>{renderInput("lwp")}</td>
                    <td className={td}>{renderInput("specialPay")}</td>
                    <td className={tdAmber}>
                      {calc.da.toLocaleString("en-IN")}
                    </td>
                    <td className={tdAmber}>
                      {calc.hra.toLocaleString("en-IN")}
                    </td>
                    <td className={td}>{renderInput("bonus")}</td>
                    <td className={td}>{renderInput("daArrears")}</td>
                    <td className={td}>{renderInput("conveyanceAllowance")}</td>
                    <td className={td}>{renderInput("washingAllowance")}</td>
                    <td className={td}>{renderInput("ltc")}</td>
                    <td className={td}>{renderInput("festivalAdvance")}</td>
                    <td className={td}>{renderInput("incentive")}</td>
                    <td className={td}>{renderInput("otherEarnings")}</td>
                    <td className="px-2 py-1.5 text-xs text-right font-bold text-green-700 dark:text-green-400 bg-green-50/40 dark:bg-green-950/20 whitespace-nowrap">
                      {calc.grossEarnings.toLocaleString("en-IN")}
                    </td>
                    <td className={td}>{renderInput("houseRent")}</td>
                    <td className={td}>{renderInput("electricityCharges")}</td>
                    <td className={td}>{renderInput("lwf")}</td>
                    <td className={tdAmber}>
                      {calc.epf.toLocaleString("en-IN")}
                    </td>
                    <td className={td}>{renderInput("vpf")}</td>
                    <td className={td}>{renderInput("lic")}</td>
                    <td className={td}>{renderInput("profTax")}</td>
                    <td className={td}>{renderInput("incomeTax")}</td>
                    <td className={td}>
                      {renderInput("festivalAdvanceRecovery")}
                    </td>
                    <td className={tdAmber}>
                      {calc.esi.toLocaleString("en-IN")}
                    </td>
                    <td className={td}>{renderInput("securityDeposit")}</td>
                    <td className={td}>{renderInput("otherDeductions")}</td>
                    <td className="px-2 py-1.5 text-xs text-right font-bold text-red-700 dark:text-red-400 bg-red-50/40 dark:bg-red-950/20 whitespace-nowrap">
                      {calc.totalDeductions.toLocaleString("en-IN")}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20 whitespace-nowrap">
                      {calc.netEarnings.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })
            )}

            {employees.length > 0 && (
              <tr
                className="border-t-2 border-border bg-secondary/40 font-semibold"
                data-ocid="salary.totals.row"
              >
                <td className="px-2 py-2 text-xs sticky left-0 bg-secondary/40">
                  —
                </td>
                <td className="px-2 py-2 text-xs font-bold">TOTAL</td>
                <td className={`${tdCalc} font-bold`}>
                  {totals.basic.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>{totals.lwp}</td>
                <td className={`${td} font-semibold`}>
                  {totals.specialPay.toLocaleString("en-IN")}
                </td>
                <td className={`${tdAmber} font-bold`}>
                  {totals.da.toLocaleString("en-IN")}
                </td>
                <td className={`${tdAmber} font-bold`}>
                  {totals.hra.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.bonus.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.daArrears.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.conveyanceAllowance.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.washingAllowance.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.ltc.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.festivalAdvance.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.incentive.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.otherEarnings.toLocaleString("en-IN")}
                </td>
                <td className="px-2 py-2 text-xs text-right font-bold text-green-700 dark:text-green-400 bg-green-50/40 dark:bg-green-950/20">
                  {totals.grossEarnings.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.houseRent.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.electricityCharges.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.lwf.toLocaleString("en-IN")}
                </td>
                <td className={`${tdAmber} font-bold`}>
                  {totals.epf.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.vpf.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.lic.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.profTax.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.incomeTax.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.festivalAdvanceRecovery.toLocaleString("en-IN")}
                </td>
                <td className={`${tdAmber} font-bold`}>
                  {totals.esi.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.securityDeposit.toLocaleString("en-IN")}
                </td>
                <td className={`${td} font-semibold`}>
                  {totals.otherDeductions.toLocaleString("en-IN")}
                </td>
                <td className="px-2 py-2 text-xs text-right font-bold text-red-700 dark:text-red-400 bg-red-50/40 dark:bg-red-950/20">
                  {totals.totalDeductions.toLocaleString("en-IN")}
                </td>
                <td className="px-2 py-2 text-xs text-right font-bold text-blue-700 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20">
                  {totals.netEarnings.toLocaleString("en-IN")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
