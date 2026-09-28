import { Student, Teacher, Expense, TeacherClassLog, ReceiptData, User, StaffMember } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'atomic_erp_students_v2',
  TEACHERS: 'atomic_erp_teachers_v2',
  STAFF: 'atomic_erp_staff_v2',
  EXPENSES: 'atomic_erp_expenses_v2',
  CLASS_LOGS: 'atomic_erp_class_logs_v2',
  RECEIPTS: 'atomic_erp_receipts_v2',
  CURRENT_USER: 'atomic_erp_current_user_v1',
};

// Initial Seed Data with zero demo amounts (clean operational baseline)
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_101',
    studentId: 'AI-ST-8821',
    name: 'ফারহান আহমেদ (Farhan Ahmed)',
    mobileNumber: '01712-345678',
    studentClass: 'Class 10',
    programme: 'Class 10 Science Special',
    batchTime: 'রবি-মঙ্গল-বৃহস্পতি (সকাল ৯:০০)',
    totalFee: 12000,
    paidAmount: 0,
    dueAmount: 12000,
    branch: 'Narayanganj',
    admissionDate: '2026-09-01',
    paymentHistory: [],
  },
  {
    id: 'std_102',
    studentId: 'AI-ST-8822',
    name: 'নুসরাত জাহান (Nusrat Jahan)',
    mobileNumber: '01911-987654',
    studentClass: 'Class 9',
    programme: 'Class 9 General Science & Math',
    batchTime: 'শনি-সোম-বুধ (বিকাল ৩:০০)',
    totalFee: 15000,
    paidAmount: 0,
    dueAmount: 15000,
    branch: 'Narayanganj',
    admissionDate: '2026-09-05',
    paymentHistory: [],
  },
  {
    id: 'std_103',
    studentId: 'AI-ST-8823',
    name: 'সাকিব আল হাসান (Sakib Al Hasan)',
    mobileNumber: '01823-456789',
    studentClass: 'Class 8',
    programme: 'Class 8 Junior Science & Math',
    batchTime: 'রবি-মঙ্গল-বৃহস্পতি (বিকাল ৪:৩০)',
    totalFee: 10000,
    paidAmount: 0,
    dueAmount: 10000,
    branch: 'Narayanganj',
    admissionDate: '2026-09-10',
    paymentHistory: [],
  },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch_201',
    name: 'ড. কাজী শফিকুল ইসলাম (Dr. Kazi Shafiq)',
    mobileNumber: '01819-876543',
    subject: 'পদার্থবিজ্ঞান (Physics Mechanics & Quantum)',
    ratePerClass: 1500,
    totalClassesTaken: 0,
    totalEarned: 0,
    totalPaid: 0,
    pendingPayable: 0,
    branch: 'Narayanganj',
    joiningDate: '2026-08-01',
    paymentHistory: [],
  },
  {
    id: 'tch_202',
    name: 'প্রকৌশলী মাহমুদুল হাসান (Engr. Mahmud)',
    mobileNumber: '01733-112233',
    subject: 'উচ্চতর গণিত (Higher Mathematics Calculus)',
    ratePerClass: 1200,
    totalClassesTaken: 0,
    totalEarned: 0,
    totalPaid: 0,
    pendingPayable: 0,
    branch: 'Narayanganj',
    joiningDate: '2026-08-15',
    paymentHistory: [],
  },
  {
    id: 'tch_203',
    name: 'তানজিলা রহমান (Tanzila Rahman)',
    mobileNumber: '01677-445566',
    subject: 'রসায়ন (Chemistry Organic & Periodic)',
    ratePerClass: 1200,
    totalClassesTaken: 0,
    totalEarned: 0,
    totalPaid: 0,
    pendingPayable: 0,
    branch: 'Narayanganj',
    joiningDate: '2026-08-20',
    paymentHistory: [],
  },
];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_CLASS_LOGS: TeacherClassLog[] = [];

export const INITIAL_RECEIPTS: ReceiptData[] = [];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf_01',
    staffId: 'AI-STF-01',
    name: 'অনির্বাণ ঘোষ (Anirban Ghosh)',
    mobileNumber: '01834-899620',
    designation: 'Founder & Academic Director',
    department: 'Executive Administration',
    monthlySalary: 45000,
    branch: 'Narayanganj',
    joiningDate: '2018-01-01',
    status: 'active',
    paymentHistory: [],
  },
  {
    id: 'stf_02',
    staffId: 'AI-STF-02',
    name: 'শ্রাবণ নন্দী (Srabon Nondi)',
    mobileNumber: '01711-223344',
    designation: 'ICT Head & Systems Lead',
    department: 'IT & Software Operations',
    monthlySalary: 35000,
    branch: 'Narayanganj',
    joiningDate: '2019-03-01',
    status: 'active',
    paymentHistory: [],
  },
  {
    id: 'stf_03',
    staffId: 'AI-STF-03',
    name: 'অঙ্কন সাহা (Ankon Saha)',
    mobileNumber: '01912-334455',
    designation: 'Campus Manager & Admin In-Charge',
    department: 'Campus Administration',
    monthlySalary: 30000,
    branch: 'Narayanganj',
    joiningDate: '2020-07-15',
    status: 'active',
    paymentHistory: [],
  },
  {
    id: 'stf_04',
    staffId: 'AI-STF-04',
    name: 'আফরোজা আক্তার (Afroza Akter)',
    mobileNumber: '01622-445566',
    designation: 'Senior Front Desk & Accounts Executive',
    department: 'Accounts & Student Care',
    monthlySalary: 18000,
    branch: 'Narayanganj',
    joiningDate: '2022-02-01',
    status: 'active',
    paymentHistory: [],
  },
  {
    id: 'stf_05',
    staffId: 'AI-STF-05',
    name: 'মোঃ রফিকুল ইসলাম (Md. Rafiqul Islam)',
    mobileNumber: '01815-667788',
    designation: 'Lab Assistant & IT Caretaker',
    department: 'Science & Computer Lab',
    monthlySalary: 15000,
    branch: 'Narayanganj',
    joiningDate: '2023-01-10',
    status: 'active',
    paymentHistory: [],
  },
  {
    id: 'stf_06',
    staffId: 'AI-STF-06',
    name: 'কামাল হোসেন (Kamal Hossain)',
    mobileNumber: '01799-887766',
    designation: 'Support Staff & Security Lead',
    department: 'Facility & Maintenance',
    monthlySalary: 12000,
    branch: 'Narayanganj',
    joiningDate: '2021-06-01',
    status: 'active',
    paymentHistory: [],
  },
];

export function loadStudents(): Student[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving students:', err);
  }
}

export function loadTeachers(): Teacher[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return data ? JSON.parse(data) : INITIAL_TEACHERS;
  } catch {
    return INITIAL_TEACHERS;
  }
}

export function saveTeachers(teachers: Teacher[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (err) {
    console.error('Error saving teachers:', err);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : INITIAL_EXPENSES;
  } catch {
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('Error saving expenses:', err);
  }
}

export function loadClassLogs(): TeacherClassLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLASS_LOGS);
    return data ? JSON.parse(data) : INITIAL_CLASS_LOGS;
  } catch {
    return INITIAL_CLASS_LOGS;
  }
}

export function saveClassLogs(logs: TeacherClassLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASS_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving class logs:', err);
  }
}

export function loadReceipts(): ReceiptData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    return data ? JSON.parse(data) : INITIAL_RECEIPTS;
  } catch {
    return INITIAL_RECEIPTS;
  }
}

export function saveReceipts(receipts: ReceiptData[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  } catch (err) {
    console.error('Error saving receipts:', err);
  }
}

export function loadStaffMembers(): StaffMember[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    return data ? JSON.parse(data) : INITIAL_STAFF;
  } catch {
    return INITIAL_STAFF;
  }
}

export function saveStaffMembers(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  } catch (err) {
    console.error('Error saving staff members:', err);
  }
}

export function loadCurrentUser(): User | null {
  try {
    // Clear any persistent local storage user to ensure fresh visits always see login page
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    const data = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (data) {
      return JSON.parse(data);
    }
    // Always start with login screen first
    return null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Error saving current user:', err);
  }
}

export function resetFinancialDataKeepStudents(
  currentStudents: Student[],
  currentTeachers: Teacher[] = [],
  currentStaff: StaffMember[] = []
): {
  resetStudents: Student[];
  resetTeachers: Teacher[];
  resetStaff: StaffMember[];
} {
  const resetStudents: Student[] = currentStudents.map((s) => ({
    ...s,
    paidAmount: 0,
    dueAmount: s.totalFee,
    paymentHistory: [],
    lastPaymentDate: undefined,
  }));

  const resetTeachers: Teacher[] = currentTeachers.map((t) => ({
    ...t,
    totalClassesTaken: 0,
    totalEarned: 0,
    totalPaid: 0,
    pendingPayable: 0,
    paymentHistory: [],
  }));

  const resetStaff: StaffMember[] = currentStaff.map((st) => ({
    ...st,
    paymentHistory: [],
  }));

  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(resetStudents));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(resetTeachers));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(resetStaff));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CLASS_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
  } catch (err) {
    console.error('Error resetting financial data:', err);
  }

  return { resetStudents, resetTeachers, resetStaff };
}

export function clearAllDataToZero(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CLASS_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
  } catch (err) {
    console.error('Error resetting data:', err);
  }
}
