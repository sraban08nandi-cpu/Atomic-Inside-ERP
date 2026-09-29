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
export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_TEACHERS: Teacher[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_CLASS_LOGS: TeacherClassLog[] = [];

export const INITIAL_RECEIPTS: ReceiptData[] = [];

export const INITIAL_STAFF: StaffMember[] = [];

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
