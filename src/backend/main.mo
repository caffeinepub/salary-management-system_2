import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ── Legacy types kept for stable variable migration compatibility ──

  type EmployeeV1 = {
    id : Text;
    name : Text;
    designation : Text;
    department : Text;
    basicSalary : Nat;
    joiningDate : Time.Time;
    pfNumber : Text;
    esiNumber : Text;
    bankAccount : Text;
    allowances : Nat;
  };

  public type UserProfile = {
    name : Text;
    employeeId : ?Text;
  };

  // ── Current Employee type ──

  type Employee = {
    id : Text;
    name : Text;
    designation : Text;
    department : Text;
    basicSalary : Nat;
    joiningDate : Time.Time;
    pfNumber : Text;
    esiNumber : Text;
    bankAccount : Text;
    allowances : Nat;
    institute : Text;
    address : Text;
    bhelQuarter : Bool;
    profilePic : Text;
    dob : Text;
    religion : Text;
    gender : Text;
    category : Text;
    employeeType : Text;
    employeeStatus : Text;
    bankName : Text;
    phone : Text;
    ifscCode : Text;
    aadhaarNo : Text;
    emailId : Text;
    panNo : Text;
    uanNo : Text;
    licNo : Text;
  };

  module Employee {
    public func compare(a : Employee, b : Employee) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type SalaryRecord = {
    employeeId : Text;
    month : Nat;
    year : Nat;
    basic : Nat;
    hra : Nat;
    da : Nat;
    allowances : Nat;
    pfDeduction : Nat;
    esiDeduction : Nat;
    tds : Nat;
    netSalary : Nat;
    isFinalized : Bool;
  };

  type AttendanceRecord = {
    employeeId : Text;
    month : Nat;
    year : Nat;
    daysPresent : Nat;
    daysAbsent : Nat;
    leaves : Nat;
  };

  // ── Stable variables (legacy preserved for upgrade compatibility) ──

  let employees = Map.empty<Text, EmployeeV1>();      // legacy V1, not used
  let userProfiles = Map.empty<Principal, UserProfile>(); // legacy, not used
  let accessControlState = AccessControl.initState(); // legacy, not used
  include MixinAuthorization(accessControlState);     // legacy mixin kept for stable state compat

  // ── Active stable variables ──

  let employeesV2 = Map.empty<Text, Employee>();
  let salaryRecords = Map.empty<Text, SalaryRecord>();
  let attendanceRecords = Map.empty<Text, AttendanceRecord>();

  // Migrate V1 records into V2 on upgrade.
  system func postupgrade() {
    for (v in employees.values()) {
      if (employeesV2.get(v.id) == null) {
        employeesV2.add(v.id, {
          id = v.id;
          name = v.name;
          designation = v.designation;
          department = v.department;
          basicSalary = v.basicSalary;
          joiningDate = v.joiningDate;
          pfNumber = v.pfNumber;
          esiNumber = v.esiNumber;
          bankAccount = v.bankAccount;
          allowances = v.allowances;
          institute = "";
          address = "";
          bhelQuarter = false;
          profilePic = "";
          dob = "";
          religion = "";
          gender = "";
          category = "";
          employeeType = "";
          employeeStatus = "Active";
          bankName = "";
          phone = "";
          ifscCode = "";
          aadhaarNo = "";
          emailId = "";
          panNo = "";
          uanNo = "";
          licNo = "";
        });
      };
    };
  };

  // ── Employee management (no auth checks) ──────────────────────────

  public shared func addEmployee(employee : Employee) : async () {
    employeesV2.add(employee.id, employee);
  };

  public query func getEmployee(id : Text) : async ?Employee {
    employeesV2.get(id);
  };

  public query func getAllEmployees() : async [Employee] {
    employeesV2.values().toArray().sort();
  };

  // ── Attendance management ─────────────────────────────────────────

  public shared func recordAttendance(record : AttendanceRecord) : async () {
    let key = record.employeeId # "_" # record.month.toText() # "_" # record.year.toText();
    attendanceRecords.add(key, record);
  };

  // ── Salary management ─────────────────────────────────────────────

  public shared func addSalaryRecord(record : SalaryRecord) : async () {
    let key = record.employeeId # "_" # record.month.toText() # "_" # record.year.toText();
    switch (salaryRecords.get(key)) {
      case (null) { salaryRecords.add(key, record) };
      case (?existing) {
        if (not existing.isFinalized) {
          salaryRecords.add(key, record);
        };
      };
    };
  };

  // ── Reports ───────────────────────────────────────────────────────

  public query func getMonthlyPayBill(month : Nat, year : Nat) : async [SalaryRecord] {
    salaryRecords.values().toArray().filter(
      func(record) { record.month == month and record.year == year }
    );
  };
};
