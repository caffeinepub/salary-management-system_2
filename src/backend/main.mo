import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // V1 type kept for stable variable migration compatibility.
  // The deployed canister has 'employees' with this shape; it must
  // remain here so Motoko can deserialise the old state on upgrade.
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

  // Current Employee type with all new fields.
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

  public type UserProfile = {
    name : Text;
    employeeId : ?Text;
  };

  // 'employees' retains V1 type to deserialise existing stable state.
  // All live data lives in 'employeesV2' after postupgrade.
  let employees = Map.empty<Text, EmployeeV1>();
  let employeesV2 = Map.empty<Text, Employee>();
  let salaryRecords = Map.empty<Text, SalaryRecord>();
  let attendanceRecords = Map.empty<Text, AttendanceRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  // ── User profile management ─────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Employee management ─────────────────────────────────────────

  public shared ({ caller }) func addEmployee(employee : Employee) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add employees");
    };
    employeesV2.add(employee.id, employee);
  };

  public query ({ caller }) func getEmployee(id : Text) : async ?Employee {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view employee details");
    };
    employeesV2.get(id);
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view employees");
    };
    employeesV2.values().toArray().sort();
  };

  // ── Attendance management ───────────────────────────────────────

  public shared ({ caller }) func recordAttendance(record : AttendanceRecord) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record attendance");
    };
    let key = record.employeeId # "_" # record.month.toText() # "_" # record.year.toText();
    attendanceRecords.add(key, record);
  };

  // ── Salary management ───────────────────────────────────────────

  public shared ({ caller }) func addSalaryRecord(record : SalaryRecord) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add salary records");
    };
    let key = record.employeeId # "_" # record.month.toText() # "_" # record.year.toText();
    switch (salaryRecords.get(key)) {
      case (null) {
        salaryRecords.add(key, record);
      };
      case (?existing) {
        if (existing.isFinalized) {
          Runtime.trap("Cannot modify finalized salary record");
        };
        salaryRecords.add(key, record);
      };
    };
  };

  // ── Reports ─────────────────────────────────────────────────────

  public query ({ caller }) func getMonthlyPayBill(month : Nat, year : Nat) : async [SalaryRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view pay bills");
    };
    salaryRecords.values().toArray().filter(
      func(record) {
        record.month == month and record.year == year
      }
    );
  };
};
