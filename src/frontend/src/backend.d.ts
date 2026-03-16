export interface Employee {
    id: string;
    bankAccount: string;
    name: string;
    designation: string;
    joiningDate: bigint;
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
export interface AttendanceRecord {
    month: bigint;
    year: bigint;
    daysAbsent: bigint;
    employeeId: string;
    leaves: bigint;
    daysPresent: bigint;
}
export interface backendInterface {
    addEmployee(employee: Employee): Promise<void>;
    addSalaryRecord(record: SalaryRecord): Promise<void>;
    getAllEmployees(): Promise<Array<Employee>>;
    getEmployee(id: string): Promise<Employee | null>;
    getMonthlyPayBill(month: bigint, year: bigint): Promise<Array<SalaryRecord>>;
    getAttendanceForMonth(month: bigint, year: bigint): Promise<Array<AttendanceRecord>>;
    recordAttendance(record: AttendanceRecord): Promise<void>;
}
