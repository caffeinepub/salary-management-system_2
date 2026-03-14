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
import { Pencil, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Employee } from "../backend.d";
import { useAddEmployee, useAllEmployees } from "../hooks/useQueries";

const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Operations",
  "Sales",
  "Marketing",
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

const SKELETON_ROWS = ["sk-emp-1", "sk-emp-2", "sk-emp-3", "sk-emp-4"];
const SKELETON_COLS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];

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
      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      data-ocid={ocid}
    >
      <option value="">{placeholder || "Select"}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default function Employees() {
  const { data: employees = [], isLoading } = useAllEmployees();
  const addEmployee = useAddEmployee();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Employee>(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setForm(emptyForm());
    setEditId(null);
    setOpen(true);
  }

  function openEdit(emp: Employee) {
    setForm({ ...emp });
    setEditId(emp.id);
    setOpen(true);
  }

  function setField(k: keyof Employee, v: string | bigint | boolean) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit() {
    if (!form.name || !form.id || !form.department) {
      toast.error("Please fill in Employee ID, Name and Department");
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
        <Button onClick={openAdd} data-ocid="employees.add.primary_button">
          <Plus size={16} className="mr-2" /> Add Employee
        </Button>
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
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Institute</TableHead>
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
                  <TableCell>
                    <Badge variant="secondary">{emp.department}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {emp.institute || "—"}
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
            <Field label="Employee ID *">
              <Input
                value={form.id}
                onChange={(e) => setField("id", e.target.value)}
                placeholder="EMP001"
                disabled={!!editId}
                data-ocid="employees.id.input"
              />
            </Field>
            <Field label="Full Name *">
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Rajesh Kumar"
                data-ocid="employees.name.input"
              />
            </Field>
            <Field label="Designation">
              <Input
                value={form.designation}
                onChange={(e) => setField("designation", e.target.value)}
                placeholder="Software Engineer"
                data-ocid="employees.designation.input"
              />
            </Field>
            <Field label="Department *">
              <SelectField
                value={form.department}
                onChange={(v) => setField("department", v)}
                options={DEPARTMENTS}
                placeholder="Select department"
                data-ocid="employees.department.select"
              />
            </Field>
            <Field label="Institute">
              <Input
                value={form.institute}
                onChange={(e) => setField("institute", e.target.value)}
                placeholder="BHEL Haridwar"
                data-ocid="employees.institute.input"
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
                placeholder="Full address"
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
                data-ocid="employees.doj.input"
              />
            </Field>
            <Field label="Gender">
              <SelectField
                value={form.gender}
                onChange={(v) => setField("gender", v)}
                options={GENDERS}
                data-ocid="employees.gender.select"
              />
            </Field>
            <Field label="Religion">
              <SelectField
                value={form.religion}
                onChange={(v) => setField("religion", v)}
                options={RELIGIONS}
                data-ocid="employees.religion.select"
              />
            </Field>
            <Field label="Category">
              <SelectField
                value={form.category}
                onChange={(v) => setField("category", v)}
                options={CATEGORIES}
                data-ocid="employees.category.select"
              />
            </Field>
            <Field label="Phone Number">
              <Input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="9876543210"
                data-ocid="employees.phone.input"
              />
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
            <Field label="Allowances (₹)">
              <Input
                type="number"
                value={Number(form.allowances)}
                onChange={(e) =>
                  setField(
                    "allowances",
                    BigInt(Math.floor(Number(e.target.value) || 0)),
                  )
                }
                placeholder="5000"
                data-ocid="employees.allowances.input"
              />
            </Field>
            <Field label="Bank Name">
              <Input
                value={form.bankName}
                onChange={(e) => setField("bankName", e.target.value)}
                placeholder="State Bank of India"
                data-ocid="employees.bank_name.input"
              />
            </Field>
            <Field label="Bank Account Number">
              <Input
                value={form.bankAccount}
                onChange={(e) => setField("bankAccount", e.target.value)}
                placeholder="1234567890"
                data-ocid="employees.bank_account.input"
              />
            </Field>
            <Field label="IFSC Code">
              <Input
                value={form.ifscCode}
                onChange={(e) => setField("ifscCode", e.target.value)}
                placeholder="SBIN0001234"
                data-ocid="employees.ifsc.input"
              />
            </Field>

            {/* Statutory Details */}
            <SectionTitle>Statutory Details</SectionTitle>
            <Field label="PF Number">
              <Input
                value={form.pfNumber}
                onChange={(e) => setField("pfNumber", e.target.value)}
                placeholder="MH/1234/5678"
                data-ocid="employees.pf_number.input"
              />
            </Field>
            <Field label="ESI Number">
              <Input
                value={form.esiNumber}
                onChange={(e) => setField("esiNumber", e.target.value)}
                placeholder="ESI1234567"
                data-ocid="employees.esi_number.input"
              />
            </Field>
            <Field label="Aadhaar Number">
              <Input
                value={form.aadhaarNo}
                onChange={(e) => setField("aadhaarNo", e.target.value)}
                placeholder="1234 5678 9012"
                data-ocid="employees.aadhaar.input"
              />
            </Field>
            <Field label="PAN Number">
              <Input
                value={form.panNo}
                onChange={(e) => setField("panNo", e.target.value)}
                placeholder="ABCDE1234F"
                data-ocid="employees.pan.input"
              />
            </Field>
            <Field label="UAN Number">
              <Input
                value={form.uanNo}
                onChange={(e) => setField("uanNo", e.target.value)}
                placeholder="100123456789"
                data-ocid="employees.uan.input"
              />
            </Field>
            <Field label="LIC Number">
              <Input
                value={form.licNo}
                onChange={(e) => setField("licNo", e.target.value)}
                placeholder="LIC policy number"
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
    </div>
  );
}
