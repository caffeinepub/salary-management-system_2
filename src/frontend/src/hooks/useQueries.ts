import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttendanceRecord, Employee, SalaryRecord } from "../backend.d";
import { useActor } from "./useActor";

export function useAllEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployee(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Employee | null>({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getEmployee(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useMonthlyPayBill(month: bigint, year: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<SalaryRecord[]>({
    queryKey: ["payBill", month.toString(), year.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMonthlyPayBill(month, year);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Employee) => {
      if (!actor) throw new Error("Not connected");
      return actor.addEmployee(employee);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useRecordAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: AttendanceRecord) => {
      if (!actor) throw new Error("Not connected");
      return actor.recordAttendance(record);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useAddSalaryRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: SalaryRecord) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSalaryRecord(record);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payBill"] });
    },
  });
}
