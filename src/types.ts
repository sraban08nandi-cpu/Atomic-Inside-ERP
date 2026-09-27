export type TabType =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'class-counting'
  | 'expenses'
  | 'staff-salary'
  | 'receipts';

export type Branch = 'Narayanganj';

export type StaffRole = 'founder' | 'ict_head' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  branch: Branch;
}

export interface StudentPaymentRecord {
  id: string;
  date: string;
  time: string;
  amount: number;
  method: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | string;
  transactionId?: string;
  receivedBy: string;
  receiptNo: string;
  note?: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  mobileNumber: string;
  programme: string;
  batchTime?: string;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  branch: Branch;
  admissionDate: string;
  lastPaymentDate?: string;
  paymentHistory: StudentPaymentRecord[];
}

export interface TeacherPaymentRecord {
  id: string;
  date: string;
  time: string;
  amount: number;
  method: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | string;
  transactionId?: string;
  disbursedBy: string;
  receiptNo: string;
  note?: string;
}

export interface Teacher {
  id: string;
  name: string;
  mobileNumber: string;
  subject: string;
  ratePerClass: number;
  totalClassesTaken: number;
  totalEarned: number;
  totalPaid: number;
  pendingPayable: number;
  branch: Branch;
  joiningDate: string;
  paymentHistory: TeacherPaymentRecord[];
}

export interface StaffPaymentRecord {
  id: string;
  voucherNo: string;
  date: string;
  time: string;
  month: string;
  basicSalary: number;
  bonus: number;
  deduction: number;
  netAmount: number;
  method: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | string;
  transactionId?: string;
  disbursedBy: string;
  note?: string;
}

export interface StaffMember {
  id: string;
  staffId: string;
  name: string;
  mobileNumber: string;
  designation: string;
  department: string;
  monthlySalary: number;
  branch: Branch;
  joiningDate: string;
  status: 'active' | 'inactive';
  paymentHistory: StaffPaymentRecord[];
}

export interface TeacherClassLog {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  batchName: string;
  date: string;
  time: string;
  durationHours: number;
  studentAttendanceCount: number;
  topic: string;
  branch: Branch;
  status: 'conducted' | 'scheduled' | 'cancelled';
  rateApplied: number;
}

export interface Expense {
  id: string;
  voucherNo: string;
  title: string;
  category:
    | 'rent'
    | 'utilities'
    | 'printing'
    | 'salary_staff'
    | 'refreshment'
    | 'marketing'
    | 'maintenance'
    | 'other';
  amount: number;
  date: string;
  branch: Branch;
  recordedBy: string;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  notes?: string;
}

export interface ReceiptData {
  id: string;
  receiptNo: string;
  type: 'student' | 'teacher' | 'staff';
  targetId: string;
  targetName: string;
  studentId?: string;
  rollNumber?: string;
  contactNumber: string;
  programme: string;
  branch: Branch;
  amountPaid: number;
  totalFee: number;
  dueAmount: number;
  date: string;
  time: string;
  receiverName: string;
  paymentMethod: string;
  transactionId?: string;
  batchTime?: string;
  salaryMonth?: string;
  salaryDetails?: {
    basicSalary: number;
    bonus: number;
    deduction: number;
  };
}
