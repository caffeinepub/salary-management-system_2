import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AttendanceRecord } from "../backend.d";
import { useAllEmployees, useRecordAttendance } from "../hooks/useQueries";

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

const SKELETON_ROWS = ["sk-att-1", "sk-att-2", "sk-att-3", "sk-att-4"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6"];

type AttRow = { daysPresent: number; daysAbsent: number; leaves: number };

export default function Attendance() {
  const now = new Date();
  const [selectedInstitute, setSelectedInstitute] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data: allEmployees = [], isLoading } = useAllEmployees();
  const recordAttendance = useRecordAttendance();
  const totalDays = new Date(year, month, 0).getDate();

  const employees = selectedInstitute
    ? allEmployees.filter((emp) => emp.institute === selectedInstitute)
    : [];

  const [rows, setRows] = useState<Record<string, AttRow>>({});

  function getRow(id: string): AttRow {
    return rows[id] ?? { daysPresent: totalDays, daysAbsent: 0, leaves: 0 };
  }

  function setRow(id: string, field: keyof AttRow, val: number) {
    setRows((prev) => {
      const cur = prev[id] ?? {
        daysPresent: totalDays,
        daysAbsent: 0,
        leaves: 0,
      };
      const updated = { ...cur, [field]: val };
      if (field === "daysPresent") {
        updated.daysAbsent = Math.max(0, totalDays - val - updated.leaves);
      } else if (field === "leaves") {
        updated.daysAbsent = Math.max(0, totalDays - updated.daysPresent - val);
      }
      return { ...prev, [id]: updated };
    });
  }

  async function handleSaveAll() {
    if (!selectedInstitute) {
      toast.error("Please select an institute first");
      return;
    }
    if (employees.length === 0) {
      toast.error("No employees found for this institute");
      return;
    }
    try {
      const records: AttendanceRecord[] = employees.map((emp) => {
        const r = getRow(emp.id);
        return {
          employeeId: emp.id,
          month: BigInt(month),
          year: BigInt(year),
          daysPresent: BigInt(r.daysPresent),
          daysAbsent: BigInt(r.daysAbsent),
          leaves: BigInt(r.leaves),
        };
      });
      await Promise.all(records.map((r) => recordAttendance.mutateAsync(r)));
      toast.success(`Attendance saved for ${selectedInstitute}`);
    } catch {
      toast.error("Failed to save attendance");
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Select an institute and record monthly attendance
          </p>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={recordAttendance.isPending || !selectedInstitute}
          data-ocid="attendance.save_button"
        >
          {recordAttendance.isPending ? "Saving..." : "Save Attendance"}
        </Button>
      </div>

      {/* Institute selector */}
      <div className="mb-4">
        <label
          htmlFor="institute-select"
          className="text-sm font-medium mb-1 block"
        >
          Select Institute
        </label>
        <select
          value={selectedInstitute}
          onChange={(e) => {
            setSelectedInstitute(e.target.value);
            setRows({});
          }}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full max-w-xs"
          id="institute-select"
          data-ocid="attendance.institute.select"
        >
          <option value="">-- Select Institute --</option>
          {INSTITUTES.map((inst) => (
            <option key={inst} value={inst}>
              {inst}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 mb-5">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          data-ocid="attendance.month.select"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <Input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-24"
          data-ocid="attendance.year.input"
        />
        <span className="text-sm text-muted-foreground self-center">
          {totalDays} working days
        </span>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <Table data-ocid="attendance.table">
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="font-semibold">Employee</TableHead>
              <TableHead className="font-semibold">Institute</TableHead>
              <TableHead className="font-semibold w-32">Days Present</TableHead>
              <TableHead className="font-semibold w-32">Days Absent</TableHead>
              <TableHead className="font-semibold w-32">Leaves</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              SKELETON_ROWS.map((rowKey) => (
                <TableRow key={rowKey} data-ocid="attendance.loading_state">
                  {SKELETON_COLS.map((colKey) => (
                    <TableCell key={colKey}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !selectedInstitute ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div
                    className="text-center py-12"
                    data-ocid="attendance.empty_state"
                  >
                    <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Please select an institute above to load employees.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div
                    className="text-center py-12"
                    data-ocid="attendance.empty_state"
                  >
                    <CalendarCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No employees found for this institute.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp, idx) => {
                const row = getRow(emp.id);
                const pct = Math.round((row.daysPresent / totalDays) * 100);
                return (
                  <TableRow
                    key={emp.id}
                    data-ocid={`attendance.item.${idx + 1}`}
                  >
                    <TableCell>
                      <p className="font-medium text-sm">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {emp.designation}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{emp.institute}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={totalDays}
                        value={row.daysPresent}
                        onChange={(e) =>
                          setRow(emp.id, "daysPresent", Number(e.target.value))
                        }
                        className="w-20 h-8 text-sm"
                        data-ocid={`attendance.present.input.${idx + 1}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={totalDays}
                        value={row.daysAbsent}
                        onChange={(e) =>
                          setRow(emp.id, "daysAbsent", Number(e.target.value))
                        }
                        className="w-20 h-8 text-sm"
                        data-ocid={`attendance.absent.input.${idx + 1}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={totalDays}
                        value={row.leaves}
                        onChange={(e) =>
                          setRow(emp.id, "leaves", Number(e.target.value))
                        }
                        className="w-20 h-8 text-sm"
                        data-ocid={`attendance.leaves.input.${idx + 1}`}
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          pct >= 90
                            ? "bg-success/15 text-success"
                            : pct >= 75
                              ? "bg-warning/15 text-warning"
                              : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {pct}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
