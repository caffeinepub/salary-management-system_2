import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttendanceRecord, Employee, SalaryRecord } from "../backend.d";
import * as employeeStorage from "../utils/employeeStorage";

const ATTENDANCE_KEY = "salary_mgr_attendance";
const SALARY_KEY = "salary_mgr_salary";

function getAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) ?? "[]");
    return raw.map((r: Record<string, string>) => ({
      ...r,
      month: BigInt(r.month),
      year: BigInt(r.year),
      daysAbsent: BigInt(r.daysAbsent),
      leaves: BigInt(r.leaves),
      daysPresent: BigInt(r.daysPresent),
    }));
  } catch {
    return [];
  }
}

function saveAttendanceRecord(record: AttendanceRecord): void {
  const existing = getAttendanceRecords().filter(
    (r) =>
      !(
        r.employeeId === record.employeeId &&
        r.month === record.month &&
        r.year === record.year
      ),
  );
  const toStore = [...existing, record].map((r) => ({
    ...r,
    month: r.month.toString(),
    year: r.year.toString(),
    daysAbsent: r.daysAbsent.toString(),
    leaves: r.leaves.toString(),
    daysPresent: r.daysPresent.toString(),
  }));
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(toStore));
}

function getSalaryRecords(): SalaryRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SALARY_KEY) ?? "[]");
    return raw.map((r: Record<string, string | boolean>) => ({
      ...r,
      da: BigInt(r.da as string),
      hra: BigInt(r.hra as string),
      tds: BigInt(r.tds as string),
      month: BigInt(r.month as string),
      year: BigInt(r.year as string),
      netSalary: BigInt(r.netSalary as string),
      esiDeduction: BigInt(r.esiDeduction as string),
      basic: BigInt(r.basic as string),
      allowances: BigInt(r.allowances as string),
      pfDeduction: BigInt(r.pfDeduction as string),
    }));
  } catch {
    return [];
  }
}

function saveSalaryRecord(record: SalaryRecord): void {
  const existing = getSalaryRecords().filter(
    (r) =>
      !(
        r.employeeId === record.employeeId &&
        r.month === record.month &&
        r.year === record.year
      ),
  );
  const toStore = [...existing, record].map((r) => ({
    ...r,
    da: r.da.toString(),
    hra: r.hra.toString(),
    tds: r.tds.toString(),
    month: r.month.toString(),
    year: r.year.toString(),
    netSalary: r.netSalary.toString(),
    esiDeduction: r.esiDeduction.toString(),
    basic: r.basic.toString(),
    allowances: r.allowances.toString(),
    pfDeduction: r.pfDeduction.toString(),
  }));
  localStorage.setItem(SALARY_KEY, JSON.stringify(toStore));
}

export function useAllEmployees() {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: () => employeeStorage.getAllEmployees(),
    staleTime: 0,
  });
}

export function useEmployee(id: string) {
  return useQuery<Employee | null>({
    queryKey: ["employee", id],
    queryFn: () => employeeStorage.getEmployee(id),
    enabled: !!id,
  });
}

export function useMonthlyPayBill(month: bigint, year: bigint) {
  return useQuery<SalaryRecord[]>({
    queryKey: ["payBill", month.toString(), year.toString()],
    queryFn: () =>
      getSalaryRecords().filter((r) => r.month === month && r.year === year),
  });
}

export function useAddEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Employee) => {
      employeeStorage.saveEmployee(employee);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useRecordAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AttendanceRecord) => {
      saveAttendanceRecord(record);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useAddSalaryRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: SalaryRecord) => {
      saveSalaryRecord(record);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payBill"] });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      employeeStorage.deleteEmployee(id);
      // Remove attendance records for this employee
      const attendance = JSON.parse(
        localStorage.getItem(ATTENDANCE_KEY) ?? "[]",
      );
      const filteredAttendance = attendance.filter(
        (r: Record<string, string>) => r.employeeId !== id,
      );
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(filteredAttendance));
      // Remove salary records for this employee
      const salary = JSON.parse(localStorage.getItem(SALARY_KEY) ?? "[]");
      const filteredSalary = salary.filter(
        (r: Record<string, string>) => r.employeeId !== id,
      );
      localStorage.setItem(SALARY_KEY, JSON.stringify(filteredSalary));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
