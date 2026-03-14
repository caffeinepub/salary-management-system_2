import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SalaryRecord {
    da: bigint;
    hra: bigint;
    tds: bigint;
    month: bigint;
    year: bigint;
    netSalary: bigint;
    isFinalized: boolean;
    employeeId: string;
    esiDeduction: bigint;
    basic: bigint;
    allowances: bigint;
    pfDeduction: bigint;
}
export interface Employee {
    id: string;
    bankAccount: string;
    name: string;
    designation: string;
    joiningDate: Time;
    pfNumber: string;
    allowances: bigint;
    department: string;
    esiNumber: string;
    basicSalary: bigint;
    institute: string;
    address: string;
    bhelQuarter: boolean;
    profilePic: string;
    dob: string;
    religion: string;
    gender: string;
    category: string;
    employeeType: string;
    employeeStatus: string;
    bankName: string;
    phone: string;
    ifscCode: string;
    aadhaarNo: string;
    emailId: string;
    panNo: string;
    uanNo: string;
    licNo: string;
}
export type Time = bigint;
export interface AttendanceRecord {
    month: bigint;
    year: bigint;
    daysAbsent: bigint;
    employeeId: string;
    leaves: bigint;
    daysPresent: bigint;
}
export interface UserProfile {
    name: string;
    employeeId?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEmployee(employee: Employee): Promise<void>;
    addSalaryRecord(record: SalaryRecord): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllEmployees(): Promise<Array<Employee>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmployee(id: string): Promise<Employee | null>;
    getMonthlyPayBill(month: bigint, year: bigint): Promise<Array<SalaryRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordAttendance(record: AttendanceRecord): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
