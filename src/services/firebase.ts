import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import {
  Student,
  Teacher,
  StaffMember,
  Expense,
  TeacherClassLog,
  ReceiptData,
  StudentPaymentRecord,
  TeacherPaymentRecord,
  StaffPaymentRecord,
} from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: "AIzaSyDYYjNCbuxndjan415cXF6LlQ_7CFnc20c",
  authDomain: "coaching-erp-33050.firebaseapp.com",
  projectId: "coaching-erp-33050",
  storageBucket: "coaching-erp-33050.firebasestorage.app",
  messagingSenderId: "416568570392",
  appId: "1:416568570392:web:8248a8a2452093a593896d",
  measurementId: "G-PWYYXHQ4KE",
};

// Initialize Firebase App singleton
export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore (default database for coaching-erp-33050)
export const db = getFirestore(app);

// Firestore Collections References
export const studentsCollection = collection(db, 'students');
export const teachersCollection = collection(db, 'teachers');
export const staffCollection = collection(db, 'staff');
export const expensesCollection = collection(db, 'expenses');
export const classLogsCollection = collection(db, 'classLogs');
export const receiptsCollection = collection(db, 'receipts');

// ==========================================
// REAL-TIME SUBSCRIBERS (onSnapshot)
// ==========================================

export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(studentsCollection);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Student[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Student, 'id'>) });
      });
      // Sort in-memory by admissionDate or name
      items.sort((a, b) => (b.admissionDate || '').localeCompare(a.admissionDate || ''));
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore students subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToTeachers(
  onUpdate: (teachers: Teacher[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(teachersCollection);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Teacher[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Teacher, 'id'>) });
      });
      items.sort((a, b) => (b.joiningDate || '').localeCompare(a.joiningDate || ''));
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore teachers subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToStaff(
  onUpdate: (staff: StaffMember[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(staffCollection);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: StaffMember[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<StaffMember, 'id'>) });
      });
      items.sort((a, b) => (a.staffId || '').localeCompare(b.staffId || ''));
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore staff subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToExpenses(
  onUpdate: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(expensesCollection);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Expense[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Expense, 'id'>) });
      });
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore expenses subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToClassLogs(
  onUpdate: (logs: TeacherClassLog[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(classLogsCollection);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: TeacherClassLog[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<TeacherClassLog, 'id'>) });
      });
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore classLogs subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToReceipts(
  onUpdate: (receipts: ReceiptData[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(receiptsCollection);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReceiptData[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<ReceiptData, 'id'>) });
      });
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore receipts subscription error:', err);
      if (onError) onError(err);
    }
  );
}

// ==========================================
// STUDENT CRUD OPERATIONS
// ==========================================

export async function addStudentDoc(student: Student, receipt?: ReceiptData): Promise<void> {
  const studentRef = doc(db, 'students', student.id);
  const batch = writeBatch(db);
  batch.set(studentRef, student);
  if (receipt) {
    const receiptRef = doc(db, 'receipts', receipt.id);
    batch.set(receiptRef, receipt);
  }
  await batch.commit();
}

export async function updateStudentDoc(studentId: string, updates: Partial<Student>): Promise<void> {
  const studentRef = doc(db, 'students', studentId);
  await setDoc(studentRef, updates, { merge: true });
}

export async function deleteStudentDoc(studentId: string): Promise<void> {
  const studentRef = doc(db, 'students', studentId);
  await deleteDoc(studentRef);
}

export async function recordStudentPaymentDoc(
  student: Student,
  newPayment: StudentPaymentRecord,
  newReceipt: ReceiptData
): Promise<void> {
  const batch = writeBatch(db);
  const studentRef = doc(db, 'students', student.id);
  const receiptRef = doc(db, 'receipts', newReceipt.id);

  const updatedHistory = [...(student.paymentHistory || []), newPayment];
  const updatedPaid = (student.paidAmount || 0) + newPayment.amount;
  const updatedDue = Math.max(0, (student.totalFee || 0) - updatedPaid);

  batch.set(
    studentRef,
    {
      paidAmount: updatedPaid,
      dueAmount: updatedDue,
      lastPaymentDate: newPayment.date,
      paymentHistory: updatedHistory,
    },
    { merge: true }
  );

  batch.set(receiptRef, newReceipt);
  await batch.commit();
}

// ==========================================
// TEACHER CRUD OPERATIONS
// ==========================================

export async function addTeacherDoc(teacher: Teacher): Promise<void> {
  const teacherRef = doc(db, 'teachers', teacher.id);
  await setDoc(teacherRef, teacher);
}

export async function updateTeacherDoc(teacherId: string, updates: Partial<Teacher>): Promise<void> {
  const teacherRef = doc(db, 'teachers', teacherId);
  await setDoc(teacherRef, updates, { merge: true });
}

export async function deleteTeacherDoc(teacherId: string): Promise<void> {
  const teacherRef = doc(db, 'teachers', teacherId);
  await deleteDoc(teacherRef);
}

export async function recordTeacherPaymentDoc(
  teacher: Teacher,
  newPayment: TeacherPaymentRecord,
  newReceipt: ReceiptData
): Promise<void> {
  const batch = writeBatch(db);
  const teacherRef = doc(db, 'teachers', teacher.id);
  const receiptRef = doc(db, 'receipts', newReceipt.id);

  const updatedHistory = [...(teacher.paymentHistory || []), newPayment];
  const updatedPaid = (teacher.totalPaid || 0) + newPayment.amount;
  const updatedPending = Math.max(0, (teacher.totalEarned || 0) - updatedPaid);

  batch.set(
    teacherRef,
    {
      totalPaid: updatedPaid,
      pendingPayable: updatedPending,
      paymentHistory: updatedHistory,
    },
    { merge: true }
  );

  batch.set(receiptRef, newReceipt);
  await batch.commit();
}

// ==========================================
// STAFF CRUD OPERATIONS
// ==========================================

export async function addStaffDoc(staff: StaffMember): Promise<void> {
  const staffRef = doc(db, 'staff', staff.id);
  await setDoc(staffRef, staff);
}

export async function updateStaffDoc(staffId: string, updates: Partial<StaffMember>): Promise<void> {
  const staffRef = doc(db, 'staff', staffId);
  await setDoc(staffRef, updates, { merge: true });
}

export async function deleteStaffDoc(staffId: string): Promise<void> {
  const staffRef = doc(db, 'staff', staffId);
  await deleteDoc(staffRef);
}

export async function recordStaffPaymentDoc(
  staff: StaffMember,
  newPayment: StaffPaymentRecord,
  newReceipt: ReceiptData,
  newExpense: Expense
): Promise<void> {
  const batch = writeBatch(db);
  const staffRef = doc(db, 'staff', staff.id);
  const receiptRef = doc(db, 'receipts', newReceipt.id);
  const expenseRef = doc(db, 'expenses', newExpense.id);

  const updatedHistory = [...(staff.paymentHistory || []), newPayment];

  batch.set(
    staffRef,
    {
      paymentHistory: updatedHistory,
    },
    { merge: true }
  );

  batch.set(receiptRef, newReceipt);
  batch.set(expenseRef, newExpense);
  await batch.commit();
}

export async function deleteStaffPaymentDoc(
  staffId: string,
  paymentId: string,
  voucherNo: string
): Promise<void> {
  const staffDocSnap = await getDocs(query(staffCollection));
  let targetStaff: StaffMember | undefined;
  staffDocSnap.forEach((d) => {
    if (d.id === staffId) {
      targetStaff = { id: d.id, ...(d.data() as Omit<StaffMember, 'id'>) };
    }
  });

  const batch = writeBatch(db);
  if (targetStaff) {
    const updatedHistory = (targetStaff.paymentHistory || []).filter((p) => p.id !== paymentId);
    batch.set(doc(db, 'staff', staffId), { paymentHistory: updatedHistory }, { merge: true });
  }

  // Delete matching receipts and expenses with this voucherNo
  const receiptsSnap = await getDocs(query(receiptsCollection));
  receiptsSnap.forEach((d) => {
    if (d.data().receiptNo === voucherNo) {
      batch.delete(doc(db, 'receipts', d.id));
    }
  });

  const expensesSnap = await getDocs(query(expensesCollection));
  expensesSnap.forEach((d) => {
    if (d.data().voucherNo === voucherNo) {
      batch.delete(doc(db, 'expenses', d.id));
    }
  });

  await batch.commit();
}

// ==========================================
// EXPENSE CRUD OPERATIONS
// ==========================================

export async function addExpenseDoc(expense: Expense): Promise<void> {
  const expenseRef = doc(db, 'expenses', expense.id);
  await setDoc(expenseRef, expense);
}

export async function deleteExpenseDoc(expenseId: string): Promise<void> {
  const expenseRef = doc(db, 'expenses', expenseId);
  await deleteDoc(expenseRef);
}

// ==========================================
// CLASS LOGS CRUD OPERATIONS
// ==========================================

export async function addClassLogDoc(log: TeacherClassLog, teacher?: Teacher): Promise<void> {
  const batch = writeBatch(db);
  const logRef = doc(db, 'classLogs', log.id);
  batch.set(logRef, log);

  if (teacher) {
    const teacherRef = doc(db, 'teachers', teacher.id);
    const updatedClasses = (teacher.totalClassesTaken || 0) + 1;
    const updatedEarned = (teacher.totalEarned || 0) + log.rateApplied;
    const updatedPending = updatedEarned - (teacher.totalPaid || 0);
    batch.set(
      teacherRef,
      {
        totalClassesTaken: updatedClasses,
        totalEarned: updatedEarned,
        pendingPayable: updatedPending,
      },
      { merge: true }
    );
  }

  await batch.commit();
}

export async function deleteClassLogDoc(logId: string, teacher?: Teacher, logRate: number = 0): Promise<void> {
  const batch = writeBatch(db);
  const logRef = doc(db, 'classLogs', logId);
  batch.delete(logRef);

  if (teacher) {
    const teacherRef = doc(db, 'teachers', teacher.id);
    const updatedClasses = Math.max(0, (teacher.totalClassesTaken || 0) - 1);
    const updatedEarned = Math.max(0, (teacher.totalEarned || 0) - logRate);
    const updatedPending = Math.max(0, updatedEarned - (teacher.totalPaid || 0));
    batch.set(
      teacherRef,
      {
        totalClassesTaken: updatedClasses,
        totalEarned: updatedEarned,
        pendingPayable: updatedPending,
      },
      { merge: true }
    );
  }

  await batch.commit();
}

// ==========================================
// RECEIPT CRUD OPERATIONS
// ==========================================

export async function addReceiptDoc(receipt: ReceiptData): Promise<void> {
  const receiptRef = doc(db, 'receipts', receipt.id);
  await setDoc(receiptRef, receipt);
}

export async function deleteReceiptDoc(receiptId: string): Promise<void> {
  const receiptRef = doc(db, 'receipts', receiptId);
  await deleteDoc(receiptRef);
}

// ==========================================
// SEED & RESET UTILITIES
// ==========================================

export async function seedInitialDataToFirestore(initialData: {
  students: Student[];
  teachers: Teacher[];
  staff: StaffMember[];
  expenses: Expense[];
  classLogs: TeacherClassLog[];
  receipts: ReceiptData[];
}): Promise<void> {
  const batch = writeBatch(db);

  initialData.students.forEach((s) => {
    batch.set(doc(db, 'students', s.id), s);
  });
  initialData.teachers.forEach((t) => {
    batch.set(doc(db, 'teachers', t.id), t);
  });
  initialData.staff.forEach((st) => {
    batch.set(doc(db, 'staff', st.id), st);
  });
  initialData.expenses.forEach((e) => {
    batch.set(doc(db, 'expenses', e.id), e);
  });
  initialData.classLogs.forEach((c) => {
    batch.set(doc(db, 'classLogs', c.id), c);
  });
  initialData.receipts.forEach((r) => {
    batch.set(doc(db, 'receipts', r.id), r);
  });

  await batch.commit();
}

export async function resetAllFirestoreDataToZero(): Promise<void> {
  // 1. Reset Students: Retain all enrolled students, reset payments to 0 and full fee to due
  const studentsSnap = await getDocs(collection(db, 'students'));
  if (!studentsSnap.empty) {
    const batch = writeBatch(db);
    studentsSnap.forEach((d) => {
      const data = d.data();
      const totalFee = typeof data.totalFee === 'number' ? data.totalFee : 0;
      batch.update(doc(db, 'students', d.id), {
        paidAmount: 0,
        dueAmount: totalFee,
        paymentHistory: [],
        lastPaymentDate: null,
      });
    });
    await batch.commit();
  }

  // 2. Reset Teachers: Retain teacher profiles, reset honorarium and counting
  const teachersSnap = await getDocs(collection(db, 'teachers'));
  if (!teachersSnap.empty) {
    const batch = writeBatch(db);
    teachersSnap.forEach((d) => {
      batch.update(doc(db, 'teachers', d.id), {
        totalClassesTaken: 0,
        totalEarned: 0,
        totalPaid: 0,
        pendingPayable: 0,
        paymentHistory: [],
      });
    });
    await batch.commit();
  }

  // 3. Reset Staff: Retain staff members, reset salary payment history
  const staffSnap = await getDocs(collection(db, 'staff'));
  if (!staffSnap.empty) {
    const batch = writeBatch(db);
    staffSnap.forEach((d) => {
      batch.update(doc(db, 'staff', d.id), {
        paymentHistory: [],
      });
    });
    await batch.commit();
  }

  // 4. Delete pure transaction collections: expenses, classLogs, receipts
  const transactionCollections = ['expenses', 'classLogs', 'receipts'];
  for (const colName of transactionCollections) {
    const snap = await getDocs(collection(db, colName));
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((d) => {
        batch.delete(doc(db, colName, d.id));
      });
      await batch.commit();
    }
  }
}
