import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend.d";
import {
  useAddEmployee,
  useAllEmployees,
  useDeleteEmployee,
} from "../hooks/useQueries";
import { exportAllData, importAllData } from "../utils/employeeStorage";

// SheetJS loaded via CDN in index.html
declare let XLSX: any;

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Operations",
  "Sales",
  "Marketing",
];

const INSTITUTES = [
  "Bhel Shiksha Mandal",
  "Jawharlal Nehru School (PW)",
  "Jawharlal Nehru School (SW)",
  "Vikram Higher Secondary School",
  "Kasturba College Of Nursing",
];

const RELIGIONS = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Buddhist",
  "Jain",
  "Other",
];
const GENDERS = ["Male", "Female", "Other"];
const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const EMPLOYEE_TYPES = ["Regular", "Contract", "Temporary", "Probation"];
const EMPLOYEE_STATUSES = ["Active", "Inactive", "Resigned", "Retired"];

const BANKS = [
  "BOI Bank",
  "ICICI Bank",
  "UCO Bank",
  "HDFC Bank",
  "State Bank of India",
];

const BANK_BRANCHES: Record<string, string[]> = {
  "State Bank of India": ["(HET) Piplani", "(Kasturba) Habibganj"],
  "ICICI Bank": ["Arera Colony"],
  "BOI Bank": ["Indrapuri"],
  "UCO Bank": ["Piplani"],
  "HDFC Bank": ["Indrapuri"],
};

const COUNTRY_CODES = [
  { code: "+91", label: "+91 (India)" },
  { code: "+1", label: "+1 (USA/Canada)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+81", label: "+81 (Japan)" },
  { code: "+86", label: "+86 (China)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+966", label: "+966 (Saudi Arabia)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+60", label: "+60 (Malaysia)" },
  { code: "+92", label: "+92 (Pakistan)" },
  { code: "+880", label: "+880 (Bangladesh)" },
  { code: "+94", label: "+94 (Sri Lanka)" },
  { code: "+977", label: "+977 (Nepal)" },
  { code: "+975", label: "+975 (Bhutan)" },
  { code: "+95", label: "+95 (Myanmar)" },
];

const SKELETON_ROWS = ["sk-emp-1", "sk-emp-2", "sk-emp-3", "sk-emp-4"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];

const TEMPLATE_COLUMNS = [
  "EmployeeID",
  "Name",
  "Designation",
  "Department",
  "Institute",
  "EmployeeType",
  "EmployeeStatus",
  "BasicSalary",
  "Allowances",
  "DateOfBirth",
  "DateOfJoining",
  "Gender",
  "Religion",
  "Category",
  "Phone",
  "EmailID",
  "Address",
  "BHELQuarter",
  "BankName",
  "BankAccount",
  "IFSCCode",
  "PFNumber",
  "ESINumber",
  "AadhaarNo",
  "PANNo",
  "UANNo",
  "LICNo",
];

const emptyForm = (): Employee => ({
  id: "",
  name: "",
  designation: "",
  department: "",
  basicSalary: 0n,
  allowances: 0n,
  joiningDate: BigInt(Date.now()) * 1_000_000n,
  pfNumber: "",
  esiNumber: "",
  bankAccount: "",
  institute: "",
  address: "",
  bhelQuarter: false,
  profilePic: "",
  dob: "",
  religion: "",
  gender: "",
  category: "",
  employeeType: "",
  employeeStatus: "Active",
  bankName: "",
  phone: "",
  ifscCode: "",
  aadhaarNo: "",
  emailId: "",
  panNo: "",
  uanNo: "",
  licNo: "",
});

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = url;
  });
}

function fmt(n: bigint) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-2 border-b border-border pb-1 mt-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {children}
      </h3>
    </div>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  "data-ocid": ocid,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  "data-ocid"?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring ${!value ? "text-muted-foreground" : ""}`}
      data-ocid={ocid}
    >
      <option value="" className="text-muted-foreground">
        {placeholder || "Select"}
      </option>
      {options.map((o) => (
        <option key={o} value={o} className="text-foreground">
          {o}
        </option>
      ))}
    </select>
  );
}

/** Map institute abbreviations to full names */
const INSTITUTE_ABBR_MAP: Record<string, string> = {
  bsm: "Bhel Shiksha Mandal",
  "jns(pw)": "Jawharlal Nehru School (PW)",
  "jns(sw)": "Jawharlal Nehru School (SW)",
  vhss: "Vikram Higher Secondary School",
  kcon: "Kasturba College Of Nursing",
};

function resolveInstitute(raw: string): string {
  const lower = raw.trim().toLowerCase();
  if (INSTITUTE_ABBR_MAP[lower]) return INSTITUTE_ABBR_MAP[lower];
  return raw.trim();
}

function resolveEmployeeType(raw: string): string {
  const lower = raw.trim().toLowerCase();
  if (lower === "permanent") return "Permanent";
  if (lower === "adhoc") return "Temporary";
  if (lower === "temporary") return "Temporary";
  return raw.trim();
}

function rowToEmployee(
  row: Record<string, string | number | boolean>,
): Employee {
  const keyMap: Record<string, string> = {};
  for (const k of Object.keys(row)) {
    keyMap[k.toLowerCase().replace(/[\s_\-\.]/g, "")] = k;
  }

  const get = (lower: string) => keyMap[lower] ?? "";

  const str = (lowerKey: string) => {
    const k = get(lowerKey);
    return k ? String(row[k] ?? "").trim() : "";
  };

  const num = (lowerKey: string) => {
    const k = get(lowerKey);
    return BigInt(Math.floor(Number(k ? row[k] : 0) || 0));
  };

  const dateToNs = (lowerKey: string): bigint => {
    const k = get(lowerKey);
    const v = k ? row[k] : undefined;
    if (!v) return BigInt(Date.now()) * 1_000_000n;
    if (typeof v === "number") {
      const date = XLSX.SSF.parse_date_code(v);
      const ms = Date.UTC(date.y, date.m - 1, date.d);
      return BigInt(ms) * 1_000_000n;
    }
    const d = new Date(String(v));
    if (!Number.isNaN(d.getTime())) return BigInt(d.getTime()) * 1_000_000n;
    return BigInt(Date.now()) * 1_000_000n;
  };

  const dobStr = (lowerKey: string): string => {
    const k = get(lowerKey);
    const v = k ? row[k] : undefined;
    if (!v) return "";
    if (typeof v === "number") {
      const date = XLSX.SSF.parse_date_code(v);
      return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    }
    return String(v).trim();
  };

  const empId = str("staffno") || str("employeeid");

  const rawInstitute = str("institute");
  const resolvedInstitute = rawInstitute ? resolveInstitute(rawInstitute) : "";

  const rawStatus = str("status");
  const rawEmployeeType = str("employeetype");
  const resolvedType = rawStatus
    ? resolveEmployeeType(rawStatus)
    : rawEmployeeType
      ? resolveEmployeeType(rawEmployeeType)
      : "";

  const bhelRaw = get("bhelquarter");
  const bhelVal = bhelRaw ? row[bhelRaw] : "";

  return {
    id: empId,
    name: str("name"),
    designation: str("designation"),
    department: str("department"),
    institute: resolvedInstitute,
    employeeType: resolvedType,
    employeeStatus: str("employeestatus") || "Active",
    basicSalary: num("basicsalary"),
    allowances: num("allowances"),
    dob: dobStr("dateofbirth"),
    joiningDate: dateToNs("dateofjoining"),
    gender: str("gender"),
    religion: str("religion"),
    category: str("category"),
    phone: str("phone"),
    emailId: str("emailid"),
    address: str("address"),
    bhelQuarter: String(bhelVal).toLowerCase() === "yes",
    bankName: str("bankname"),
    bankAccount: str("bankaccount"),
    ifscCode: str("ifsccode"),
    pfNumber: str("pfnumber"),
    esiNumber: str("esinumber"),
    aadhaarNo: str("aadhaarno"),
    panNo: str("panno"),
    uanNo: str("uanno"),
    licNo: str("licno"),
    profilePic: "",
  };
}

export default function Employees() {
  const { data: employees = [], isLoading } = useAllEmployees();
  const addEmployee = useAddEmployee();
  const deleteEmployee = useDeleteEmployee();
  const queryClient = useQueryClient();
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const picInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Employee>(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [phonePrefix, setPhonePrefix] = useState("+91");
  const [bankBranch, setBankBranch] = useState("");

  // Bulk import state
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<Employee[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setForm(emptyForm());
    setEditId(null);
    setPhonePrefix("+91");
    setBankBranch("");
    setOpen(true);
  }

  function openEdit(emp: Employee) {
    setForm({ ...emp });
    setEditId(emp.id);
    setPhonePrefix("+91");
    setBankBranch("");
    setOpen(true);
  }

  function setField(k: keyof Employee, v: string | bigint | boolean) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit() {
    if (!form.name || !form.id || !form.designation) {
      toast.error("Please fill in Employee ID, Name and Designation");
      return;
    }
    try {
      await addEmployee.mutateAsync(form);
      toast.success(editId ? "Employee updated" : "Employee added");
      setOpen(false);
    } catch {
      toast.error("Failed to save employee");
    }
  }

  function downloadTemplate() {
    const sampleRow: Record<string, string | number> = {
      EmployeeID: "EMP001",
      Name: "Rajesh Kumar",
      Designation: "Teacher",
      Department: "Science",
      Institute: "Bhel Shiksha Mandal",
      EmployeeType: "Regular",
      EmployeeStatus: "Active",
      BasicSalary: 45000,
      Allowances: 5000,
      DateOfBirth: "1985-06-15",
      DateOfJoining: "2010-04-01",
      Gender: "Male",
      Religion: "Hindu",
      Category: "General",
      Phone: "9876543210",
      EmailID: "rajesh@example.com",
      Address: "123 Main St, Bhopal",
      BHELQuarter: "No",
      BankName: "State Bank of India",
      BankAccount: "1234567890",
      IFSCCode: "SBIN0001234",
      PFNumber: "MH/1234/5678",
      ESINumber: "ESI1234567",
      AadhaarNo: "1234 5678 9012",
      PANNo: "ABCDE1234F",
      UANNo: "100123456789",
      LICNo: "",
    };
    const ws = XLSX.utils.json_to_sheet([sampleRow], {
      header: TEMPLATE_COLUMNS,
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employee_import_template.xlsx");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
        const errors: string[] = [];
        const parsed: Employee[] = [];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i] as Record<string, string | number | boolean>;
          const emp = rowToEmployee(row);
          if (!emp.id)
            errors.push(`Row ${i + 2}: Employee ID (staffno) is missing`);
          else if (!emp.name) errors.push(`Row ${i + 2}: Name is missing`);
          else if (!emp.designation)
            errors.push(`Row ${i + 2}: Designation is missing`);
          else parsed.push(emp);
        }
        setImportRows(parsed);
        setImportErrors(errors);
        setImportOpen(true);
      } catch {
        toast.error(
          "Failed to read file. Make sure it is a valid .xlsx or .csv file.",
        );
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  async function handleBulkImport() {
    if (importRows.length === 0) return;
    setImporting(true);
    let success = 0;
    let failed = 0;
    for (const emp of importRows) {
      try {
        await addEmployee.mutateAsync(emp);
        success++;
      } catch {
        failed++;
      }
    }
    setImporting(false);
    setImportOpen(false);
    setImportRows([]);
    setImportErrors([]);
    if (failed === 0) {
      toast.success(
        `${success} employee${success !== 1 ? "s" : ""} imported successfully`,
      );
    } else {
      toast.warning(`${success} imported, ${failed} failed`);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteEmployee.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted permanently`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete employee");
    }
  }

  async function handleProfilePicChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    setField("profilePic", dataUrl);
    e.target.value = "";
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Employees
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {employees.length} total employees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileSelect}
            data-ocid="employees.upload_button"
          />
          <Button
            variant="outline"
            onClick={() => {
              const json = exportAllData();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `employees_backup_${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Backup exported successfully");
            }}
            data-ocid="employees.export.secondary_button"
          >
            <Download size={16} className="mr-2" /> Export Backup
          </Button>
          <input
            ref={backupInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              try {
                const count = importAllData(text);
                queryClient.invalidateQueries({ queryKey: ["employees"] });
                toast.success(`${count} employees restored from backup`);
              } catch {
                toast.error("Invalid backup file");
              }
              e.target.value = "";
            }}
            data-ocid="employees.backup.upload_button"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                data-ocid="employees.backup.open_modal_button"
              >
                <Upload size={16} className="mr-2" /> Import Backup
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="employees.backup.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Import Backup</AlertDialogTitle>
                <AlertDialogDescription>
                  This will add/update employees from the backup file. Existing
                  employees will not be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="employees.backup.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => backupInputRef.current?.click()}
                  data-ocid="employees.backup.confirm_button"
                >
                  Choose File
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="employees.import.secondary_button"
          >
            <Upload size={16} className="mr-2" /> Import Excel
          </Button>
          <Button onClick={openAdd} data-ocid="employees.add.primary_button">
            <Plus size={16} className="mr-2" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          placeholder="Search by name, department, designation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-ocid="employees.search_input"
        />
      </div>

      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <Table data-ocid="employees.table">
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="font-semibold">Employee ID</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Designation</TableHead>
              <TableHead className="font-semibold">Institute</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Basic Salary</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              SKELETON_ROWS.map((rowKey) => (
                <TableRow key={rowKey} data-ocid="employees.loading_state">
                  {SKELETON_COLS.map((colKey) => (
                    <TableCell key={colKey}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div
                    className="flex flex-col items-center py-12"
                    data-ocid="employees.empty_state"
                  >
                    <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {search
                        ? "No employees match your search"
                        : "No employees yet. Add your first employee."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp, idx) => (
                <TableRow
                  key={emp.id}
                  className="hover:bg-secondary/30"
                  data-ocid={`employees.item.${idx + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {emp.id}
                  </TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emp.institute || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{emp.department}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {fmt(emp.basicSalary)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(emp)}
                      data-ocid={`employees.edit_button.${idx + 1}`}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(emp)}
                      data-ocid={`employees.delete_button.${idx + 1}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          data-ocid="employees.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editId ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Basic Info */}
            <SectionTitle>Basic Information</SectionTitle>
            {/* Profile Picture - spans full width */}
            <div className="col-span-2 flex flex-col items-center gap-3 py-2">
              <button
                type="button"
                className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-secondary flex items-center justify-center cursor-pointer relative group p-0"
                onClick={() => picInputRef.current?.click()}
                aria-label="Upload profile photo"
              >
                {form.profilePic ? (
                  <img
                    src={form.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera size={32} className="text-muted-foreground/50" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera size={20} className="text-white" />
                </div>
              </button>
              <input
                ref={picInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => picInputRef.current?.click()}
                data-ocid="employees.profile_pic.upload_button"
              >
                <Camera size={14} className="mr-1" />
                {form.profilePic ? "Change Photo" : "Upload Photo"}
              </Button>
            </div>
            <Field label="Employee ID *">
              <Input
                value={form.id}
                onChange={(e) => setField("id", e.target.value)}
                placeholder="Enter Employee ID"
                disabled={!!editId}
                data-ocid="employees.id.input"
              />
            </Field>
            <Field label="Full Name *">
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Enter Name"
                data-ocid="employees.name.input"
              />
            </Field>
            <Field label="Designation *">
              <Input
                value={form.designation}
                onChange={(e) => setField("designation", e.target.value)}
                placeholder="Enter Designation"
                data-ocid="employees.designation.input"
              />
            </Field>
            <Field label="Institute">
              <SelectField
                value={form.institute}
                onChange={(v) => setField("institute", v)}
                options={INSTITUTES}
                placeholder="Select institute"
                data-ocid="employees.institute.select"
              />
            </Field>
            <Field label="Department">
              <SelectField
                value={form.department}
                onChange={(v) => setField("department", v)}
                options={DEPARTMENTS}
                placeholder="Select department"
                data-ocid="employees.department.select"
              />
            </Field>
            <Field label="Employee Type">
              <SelectField
                value={form.employeeType}
                onChange={(v) => setField("employeeType", v)}
                options={EMPLOYEE_TYPES}
                placeholder="Select type"
                data-ocid="employees.type.select"
              />
            </Field>
            <Field label="Employee Status">
              <SelectField
                value={form.employeeStatus}
                onChange={(v) => setField("employeeStatus", v)}
                options={EMPLOYEE_STATUSES}
                placeholder="Select status"
                data-ocid="employees.status.select"
              />
            </Field>
            <div className="col-span-2 space-y-1.5">
              <Label>Address</Label>
              <textarea
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="Enter Full Address"
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                data-ocid="employees.address.textarea"
              />
            </div>
            <Field label="BHEL Quarter Allotted">
              <div className="flex items-center gap-3 h-9">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bhelQuarter"
                    checked={form.bhelQuarter === true}
                    onChange={() => setField("bhelQuarter", true)}
                    data-ocid="employees.bhel_quarter_yes.radio"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bhelQuarter"
                    checked={form.bhelQuarter === false}
                    onChange={() => setField("bhelQuarter", false)}
                    data-ocid="employees.bhel_quarter_no.radio"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </Field>

            {/* Personal Details */}
            <SectionTitle>Personal Details</SectionTitle>
            <Field label="Date of Birth">
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => setField("dob", e.target.value)}
                placeholder="dd-mmm,yyyy"
                data-ocid="employees.dob.input"
              />
            </Field>
            <Field label="Date of Joining">
              <Input
                type="date"
                value={
                  form.joiningDate
                    ? new Date(Number(form.joiningDate) / 1_000_000)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  setField("joiningDate", BigInt(d.getTime()) * 1_000_000n);
                }}
                placeholder="dd-mmm,yyyy"
                data-ocid="employees.doj.input"
              />
            </Field>
            <Field label="Gender">
              <SelectField
                value={form.gender}
                onChange={(v) => setField("gender", v)}
                options={GENDERS}
                placeholder="Select Gender"
                data-ocid="employees.gender.select"
              />
            </Field>
            <Field label="Religion">
              <SelectField
                value={form.religion}
                onChange={(v) => setField("religion", v)}
                options={RELIGIONS}
                placeholder="Select Religion"
                data-ocid="employees.religion.select"
              />
            </Field>
            <Field label="Category">
              <SelectField
                value={form.category}
                onChange={(v) => setField("category", v)}
                options={CATEGORIES}
                placeholder="Select Category"
                data-ocid="employees.category.select"
              />
            </Field>
            <Field label="Phone Number">
              <div className="flex gap-2">
                <select
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground w-28 shrink-0"
                  data-ocid="employees.phone_prefix.select"
                >
                  {COUNTRY_CODES.map(({ code, label }) => (
                    <option key={code} value={code} className="text-foreground">
                      {label}
                    </option>
                  ))}
                </select>
                <Input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="9876543210"
                  data-ocid="employees.phone.input"
                  className="flex-1"
                />
              </div>
            </Field>
            <Field label="Email ID">
              <Input
                type="email"
                value={form.emailId}
                onChange={(e) => setField("emailId", e.target.value)}
                placeholder="employee@example.com"
                data-ocid="employees.email.input"
              />
            </Field>

            {/* Financial Details */}
            <SectionTitle>Financial Details</SectionTitle>
            <Field label="Basic Salary (₹)">
              <Input
                type="number"
                value={Number(form.basicSalary)}
                onChange={(e) =>
                  setField(
                    "basicSalary",
                    BigInt(Math.floor(Number(e.target.value) || 0)),
                  )
                }
                placeholder="45000"
                data-ocid="employees.salary.input"
              />
            </Field>
            <Field label="Bank Name">
              <SelectField
                value={form.bankName}
                onChange={(v) => {
                  setField("bankName", v);
                  setBankBranch("");
                }}
                options={BANKS}
                placeholder="Select Bank"
                data-ocid="employees.bank_name.select"
              />
            </Field>
            <Field label="Bank Branch">
              <SelectField
                value={bankBranch}
                onChange={(v) => setBankBranch(v)}
                options={
                  form.bankName ? (BANK_BRANCHES[form.bankName] ?? []) : []
                }
                placeholder="Select Branch"
                data-ocid="employees.bank_branch.select"
              />
            </Field>
            <Field label="Bank Account Number">
              <Input
                value={form.bankAccount}
                onChange={(e) => setField("bankAccount", e.target.value)}
                placeholder="Enter account number"
                data-ocid="employees.bank_account.input"
              />
            </Field>
            <Field label="IFSC Code">
              <Input
                value={form.ifscCode}
                onChange={(e) => setField("ifscCode", e.target.value)}
                placeholder="Enter IFSC code"
                data-ocid="employees.ifsc.input"
              />
            </Field>

            {/* Statutory Details */}
            <SectionTitle>Statutory Details</SectionTitle>
            <Field label="PF Number">
              <Input
                value={form.pfNumber}
                onChange={(e) => setField("pfNumber", e.target.value)}
                placeholder="Enter PF number"
                data-ocid="employees.pf_number.input"
              />
            </Field>
            <Field label="ESI Number">
              <Input
                value={form.esiNumber}
                onChange={(e) => setField("esiNumber", e.target.value)}
                placeholder="Enter ESI number"
                data-ocid="employees.esi_number.input"
              />
            </Field>
            <Field label="Aadhaar Number">
              <Input
                value={form.aadhaarNo}
                onChange={(e) => setField("aadhaarNo", e.target.value)}
                placeholder="Enter Aadhaar number"
                data-ocid="employees.aadhaar.input"
              />
            </Field>
            <Field label="PAN Number">
              <Input
                value={form.panNo}
                onChange={(e) => setField("panNo", e.target.value)}
                placeholder="Enter PAN number"
                data-ocid="employees.pan.input"
              />
            </Field>
            <Field label="UAN Number">
              <Input
                value={form.uanNo}
                onChange={(e) => setField("uanNo", e.target.value)}
                placeholder="Enter UAN number"
                data-ocid="employees.uan.input"
              />
            </Field>
            <Field label="LIC Number">
              <Input
                value={form.licNo}
                onChange={(e) => setField("licNo", e.target.value)}
                placeholder="Enter LIC number"
                data-ocid="employees.lic.input"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="employees.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addEmployee.isPending}
              data-ocid="employees.save_button"
            >
              {addEmployee.isPending
                ? "Saving..."
                : editId
                  ? "Update"
                  : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Preview Dialog */}
      <Dialog
        open={importOpen}
        onOpenChange={(v) => {
          setImportOpen(v);
          if (!v) {
            setImportRows([]);
            setImportErrors([]);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-4xl w-full max-h-[85vh] overflow-y-auto overflow-x-hidden"
          data-ocid="employees.import.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Import Employees</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {importErrors.length > 0 && (
              <div
                className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive space-y-1"
                data-ocid="employees.import.error_state"
              >
                <p className="font-semibold">Skipped rows with errors:</p>
                {importErrors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}

            {importRows.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-6"
                data-ocid="employees.import.empty_state"
              >
                No valid employee rows found in the file.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {importRows.length} employee
                  {importRows.length !== 1 ? "s" : ""} ready to import:
                </p>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead>#</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Institute</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importRows.map((emp, i) => (
                        <TableRow
                          key={emp.id}
                          data-ocid={`employees.import.item.${i + 1}`}
                        >
                          <TableCell className="text-muted-foreground">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {emp.id}
                          </TableCell>
                          <TableCell>{emp.name}</TableCell>
                          <TableCell>{emp.designation}</TableCell>
                          <TableCell>{emp.institute || "—"}</TableCell>
                          <TableCell>{emp.employeeType || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadTemplate}
                data-ocid="employees.import.template.button"
              >
                <Download size={14} className="mr-1" /> Download Template
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportOpen(false);
                setImportRows([]);
                setImportErrors([]);
              }}
              data-ocid="employees.import.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={importing || importRows.length === 0}
              data-ocid="employees.import.confirm_button"
            >
              {importing
                ? "Importing..."
                : `Import ${importRows.length} Employee${importRows.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="employees.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong>{deleteTarget?.name}</strong>? This will also remove all
              their attendance and salary records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="employees.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              data-ocid="employees.delete.confirm_button"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
