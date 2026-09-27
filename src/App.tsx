import React, { useState, useEffect, useRef } from 'react';
import { TabType, Branch, User, Student, Teacher, Expense, TeacherClassLog, ReceiptData, StaffMember } from './types';
import {
  loadStudents,
  saveStudents,
  loadTeachers,
  saveTeachers,
  loadExpenses,
  saveExpenses,
  loadClassLogs,
  saveClassLogs,
  loadReceipts,
  saveReceipts,
  loadStaffMembers,
  saveStaffMembers,
  loadCurrentUser,
  saveCurrentUser,
  clearAllDataToZero,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_STAFF,
  INITIAL_EXPENSES,
  INITIAL_CLASS_LOGS,
  INITIAL_RECEIPTS,
} from './utils/storage';
import {
  subscribeToStudents,
  subscribeToTeachers,
  subscribeToStaff,
  subscribeToExpenses,
  subscribeToClassLogs,
  subscribeToReceipts,
  addStudentDoc,
  recordStudentPaymentDoc,
  deleteStudentDoc,
  addTeacherDoc,
  recordTeacherPaymentDoc,
  deleteTeacherDoc,
  addStaffDoc,
  recordStaffPaymentDoc,
  deleteStaffPaymentDoc,
  deleteStaffDoc,
  addClassLogDoc,
  deleteClassLogDoc,
  addExpenseDoc,
  deleteExpenseDoc,
  deleteReceiptDoc,
  seedInitialDataToFirestore,
  resetAllFirestoreDataToZero,
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentPayments } from './components/StudentPayments';
import { TeacherManagement } from './components/TeacherManagement';
import { TeacherClassCounting } from './components/TeacherClassCounting';
import { ExpenseTracker } from './components/ExpenseTracker';
import { StaffSalaryManagement } from './components/StaffSalaryManagement';
import { ReceiptsList } from './components/ReceiptsList';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { CashMemoModal } from './components/CashMemoModal';
import { AtomicLogo } from './components/AtomicLogo';
import { ToastProvider, useToast } from './components/ToastContext';
import {
  FontSettingsModal,
  FontSettings,
  getSavedFontSettings,
  applyFontSettingsToDOM,
  FONT_OPTIONS,
} from './components/FontSettingsModal';
import { RotateCcw } from 'lucide-react';

function CoachingApp() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<Branch>('Narayanganj');
  const [currentUser, setCurrentUser] = useState<User | null>(loadCurrentUser);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Core Data State (Loaded initially from local cache, then updated live via Firestore onSnapshot)
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(loadTeachers);
  const [staffList, setStaffList] = useState<StaffMember[]>(loadStaffMembers);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [classLogs, setClassLogs] = useState<TeacherClassLog[]>(loadClassLogs);
  const [receipts, setReceipts] = useState<ReceiptData[]>(loadReceipts);

  // Track if initial seed check was performed
  const isInitialSeedChecked = useRef(false);

  // Modals & Preferences
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isCashMemoOpen, setIsCashMemoOpen] = useState(false);
  const [isFontSettingsOpen, setIsFontSettingsOpen] = useState(false);
  const [fontSettings, setFontSettings] = useState<FontSettings>(getSavedFontSettings);

  // Apply typography preference to DOM on load and updates
  useEffect(() => {
    applyFontSettingsToDOM(fontSettings);
  }, [fontSettings]);

  // Global ESC key handler for top-level modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isResetModalOpen) setIsResetModalOpen(false);
        else if (isLoginOpen) setIsLoginOpen(false);
        else if (isStudentModalOpen) setIsStudentModalOpen(false);
        else if (isTeacherModalOpen) setIsTeacherModalOpen(false);
        else if (isExpenseModalOpen) setIsExpenseModalOpen(false);
        else if (isClassModalOpen) setIsClassModalOpen(false);
        else if (isMonthlyReportOpen) setIsMonthlyReportOpen(false);
        else if (isCashMemoOpen) setIsCashMemoOpen(false);
        else if (isFontSettingsOpen) setIsFontSettingsOpen(false);
        else if (activeReceipt) setActiveReceipt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isResetModalOpen,
    isLoginOpen,
    isStudentModalOpen,
    isTeacherModalOpen,
    isExpenseModalOpen,
    isClassModalOpen,
    isMonthlyReportOpen,
    isCashMemoOpen,
    isFontSettingsOpen,
    activeReceipt,
  ]);

  // =================================================================
  // FIREBASE FIRESTORE REAL-TIME SUBSCRIPTIONS (onSnapshot)
  // =================================================================
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    try {
      // 1. Students Subscription
      const unsubStudents = subscribeToStudents(
        (fetchedStudents) => {
          setIsCloudSynced(true);
          // If Firestore is brand new/empty and not seeded yet, seed initial baseline
          if (fetchedStudents.length === 0 && !isInitialSeedChecked.current) {
            isInitialSeedChecked.current = true;
            seedInitialDataToFirestore({
              students: INITIAL_STUDENTS,
              teachers: INITIAL_TEACHERS,
              staff: INITIAL_STAFF,
              expenses: INITIAL_EXPENSES,
              classLogs: INITIAL_CLASS_LOGS,
              receipts: INITIAL_RECEIPTS,
            }).catch((err) => console.warn('Seeding notice:', err));
          } else if (fetchedStudents.length > 0) {
            isInitialSeedChecked.current = true;
            setStudents(fetchedStudents);
            saveStudents(fetchedStudents);
          } else {
            setStudents([]);
            saveStudents([]);
          }
        },
        (err) => {
          console.warn('Firestore students sync error:', err);
          setIsCloudSynced(false);
        }
      );
      unsubs.push(unsubStudents);

      // 2. Teachers Subscription
      const unsubTeachers = subscribeToTeachers(
        (fetchedTeachers) => {
          if (fetchedTeachers.length > 0) {
            setTeachers(fetchedTeachers);
            saveTeachers(fetchedTeachers);
          } else if (isInitialSeedChecked.current) {
            setTeachers([]);
            saveTeachers([]);
          }
        },
        () => setIsCloudSynced(false)
      );
      unsubs.push(unsubTeachers);

      // 3. Staff Subscription
      const unsubStaff = subscribeToStaff(
        (fetchedStaff) => {
          if (fetchedStaff.length > 0) {
            setStaffList(fetchedStaff);
            saveStaffMembers(fetchedStaff);
          } else if (isInitialSeedChecked.current) {
            setStaffList([]);
            saveStaffMembers([]);
          }
        },
        () => setIsCloudSynced(false)
      );
      unsubs.push(unsubStaff);

      // 4. Expenses Subscription
      const unsubExpenses = subscribeToExpenses(
        (fetchedExpenses) => {
          if (fetchedExpenses.length > 0) {
            setExpenses(fetchedExpenses);
            saveExpenses(fetchedExpenses);
          } else if (isInitialSeedChecked.current) {
            setExpenses([]);
            saveExpenses([]);
          }
        },
        () => setIsCloudSynced(false)
      );
      unsubs.push(unsubExpenses);

      // 5. Class Logs Subscription
      const unsubClassLogs = subscribeToClassLogs(
        (fetchedLogs) => {
          if (fetchedLogs.length > 0) {
            setClassLogs(fetchedLogs);
            saveClassLogs(fetchedLogs);
          } else if (isInitialSeedChecked.current) {
            setClassLogs([]);
            saveClassLogs([]);
          }
        },
        () => setIsCloudSynced(false)
      );
      unsubs.push(unsubClassLogs);

      // 6. Receipts Subscription
      const unsubReceipts = subscribeToReceipts(
        (fetchedReceipts) => {
          if (fetchedReceipts.length > 0) {
            setReceipts(fetchedReceipts);
            saveReceipts(fetchedReceipts);
          } else if (isInitialSeedChecked.current) {
            setReceipts([]);
            saveReceipts([]);
          }
        },
        () => setIsCloudSynced(false)
      );
      unsubs.push(unsubReceipts);
    } catch (err) {
      console.warn('Firebase listeners initialization warning:', err);
      setIsCloudSynced(false);
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Sync current user to localStorage
  useEffect(() => saveCurrentUser(currentUser), [currentUser]);

  // Handler: Confirm Reset All Data to Zero (Firestore & Local)
  const handleConfirmReset = async () => {
    try {
      await resetAllFirestoreDataToZero();
    } catch (err) {
      console.warn('Firestore reset notice:', err);
    }
    clearAllDataToZero();
    setStudents([]);
    setTeachers([]);
    setStaffList([]);
    setExpenses([]);
    setClassLogs([]);
    setReceipts([]);
    setIsResetModalOpen(false);
    showToast('info', 'কাউন্টিং শূন্য (০) করা হয়েছে', 'সকল রেকর্ড মুছে ক্লাউড ও লোকাল ডেটাবেজে পরিষ্কার ফ্রেশ হিসাব প্রস্তুত করা হয়েছে।');
  };

  // Handler: Add Student & Auto-generate receipt (Firestore synced)
  const handleAddStudent = async (newStudent: Student) => {
    let newReceipt: ReceiptData | undefined;

    if (newStudent.paidAmount > 0) {
      const receiptNo = newStudent.paymentHistory[0]?.receiptNo || `RCP-${Date.now().toString().slice(-6)}`;
      newReceipt = {
        id: `rcp_${Date.now()}`,
        receiptNo,
        type: 'student',
        targetId: newStudent.id,
        targetName: newStudent.name,
        studentId: newStudent.studentId,
        contactNumber: newStudent.mobileNumber,
        programme: newStudent.programme,
        branch: newStudent.branch,
        amountPaid: newStudent.paidAmount,
        totalFee: newStudent.totalFee,
        dueAmount: newStudent.dueAmount,
        date: newStudent.admissionDate,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        receiverName: currentUser ? currentUser.name : 'Anirban Ghosh (Founder)',
        paymentMethod: newStudent.paymentHistory[0]?.method || 'cash',
        batchTime: newStudent.batchTime,
      };

      setReceipts((prev) => [newReceipt!, ...prev]);
      setActiveReceipt(newReceipt); // Immediate automatic receipt preview
    }

    // Optimistic UI update
    setStudents((prev) => [newStudent, ...prev]);

    // Save to Firestore in real-time
    try {
      await addStudentDoc(newStudent, newReceipt);
      showToast('success', 'শিক্ষার্থী সফলভাবে যুক্ত হয়েছে', `${newStudent.name} ক্লাউড ডেটাবেজে সংরক্ষিত হয়েছে।`);
    } catch (err) {
      console.error('Firestore student save error:', err);
    }
  };

  // Handler: Subsequent Student Payment Installment (Firestore synced)
  const handleRecordStudentPayment = async (
    studentId: string,
    amount: number,
    paymentMethod: any,
    note?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const newPaid = student.paidAmount + amount;
    const newDue = Math.max(0, student.totalFee - newPaid);
    const receiptNo = `RCP-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const receiver = currentUser ? currentUser.name : 'Anirban Ghosh (Founder)';

    const newPaymentRecord = {
      id: `pay_${Date.now()}`,
      date: today,
      time: currentTime,
      amount,
      method: paymentMethod,
      receivedBy: receiver,
      receiptNo,
      note: note || 'Fee Installment',
    };

    const newReceipt: ReceiptData = {
      id: `rcp_${Date.now()}`,
      receiptNo,
      type: 'student',
      targetId: student.id,
      targetName: student.name,
      studentId: student.studentId,
      contactNumber: student.mobileNumber,
      programme: student.programme,
      branch: student.branch,
      amountPaid: amount,
      totalFee: student.totalFee,
      dueAmount: newDue,
      date: today,
      time: currentTime,
      receiverName: receiver,
      paymentMethod,
      batchTime: student.batchTime,
    };

    // Optimistic UI update
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          paidAmount: newPaid,
          dueAmount: newDue,
          lastPaymentDate: today,
          paymentHistory: [...s.paymentHistory, newPaymentRecord],
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    setReceipts((prev) => [newReceipt, ...prev]);
    setActiveReceipt(newReceipt);

    // Save to Firestore in real-time
    try {
      await recordStudentPaymentDoc(student, newPaymentRecord, newReceipt);
      showToast('success', 'ফি পেমেন্ট সফল হয়েছে', `রসিদ #${receiptNo} স্বয়ংক্রিয় তৈরি ও ক্লাউড সিঙ্ক হয়েছে।`);
    } catch (err) {
      console.error('Firestore payment record error:', err);
    }
  };

  // Handler: Delete Student (Firestore synced)
  const handleDeleteStudent = async (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    try {
      await deleteStudentDoc(studentId);
      showToast('info', 'শিক্ষার্থী অপসারিত', 'শিক্ষার্থীর তথ্য ক্লাউড ডেটাবেজ থেকে মুছে দেওয়া হয়েছে।');
    } catch (err) {
      console.error('Firestore delete student error:', err);
    }
  };

  // Handler: Add Teacher (Firestore synced)
  const handleAddTeacher = async (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    try {
      await addTeacherDoc(newTeacher);
      showToast('success', 'শিক্ষক সফলভাবে যুক্ত হয়েছে', `${newTeacher.name} ক্লাউডে সংরক্ষিত হয়েছে।`);
    } catch (err) {
      console.error('Firestore teacher save error:', err);
    }
  };

  // Handler: Delete Teacher (Firestore synced)
  const handleDeleteTeacher = async (teacherId: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    try {
      await deleteTeacherDoc(teacherId);
    } catch (err) {
      console.error('Firestore teacher delete error:', err);
    }
  };

  // Handler: Pay Teacher Honorarium (Firestore synced)
  const handlePayTeacher = async (
    teacherId: string,
    amount: number,
    paymentMethod: any,
    note?: string
  ) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return;

    const newPaid = teacher.totalPaid + amount;
    const newPending = Math.max(0, teacher.totalEarned - newPaid);
    const receiptNo = `VCH-TCH-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const issuer = currentUser ? currentUser.name : 'Anirban Ghosh (Founder)';

    const newPaymentRecord = {
      id: `tch_pay_${Date.now()}`,
      date: today,
      time: currentTime,
      amount,
      method: paymentMethod,
      disbursedBy: issuer,
      receiptNo,
      note: note || 'Honorarium Remuneration',
    };

    const newReceipt: ReceiptData = {
      id: `rcp_tch_${Date.now()}`,
      receiptNo,
      type: 'teacher',
      targetId: teacher.id,
      targetName: teacher.name,
      contactNumber: teacher.mobileNumber,
      programme: teacher.subject,
      branch: teacher.branch,
      amountPaid: amount,
      totalFee: teacher.totalEarned,
      dueAmount: newPending,
      date: today,
      time: currentTime,
      receiverName: issuer,
      paymentMethod,
    };

    // Optimistic UI update
    const updatedTeachers = teachers.map((t) => {
      if (t.id === teacherId) {
        return {
          ...t,
          totalPaid: newPaid,
          pendingPayable: newPending,
          paymentHistory: [...t.paymentHistory, newPaymentRecord],
        };
      }
      return t;
    });

    setTeachers(updatedTeachers);
    setReceipts((prev) => [newReceipt, ...prev]);
    setActiveReceipt(newReceipt);

    // Save to Firestore in real-time
    try {
      await recordTeacherPaymentDoc(teacher, newPaymentRecord, newReceipt);
      showToast('success', 'সম্মানী ভাউচার তৈরি হয়েছে', `ভাউচার #${receiptNo} সফলভাবে ক্লাউডে সংরক্ষিত হয়েছে।`);
    } catch (err) {
      console.error('Firestore teacher payment error:', err);
    }
  };

  // Handler: Staff Management & Salary (Firestore synced)
  const handleAddStaff = async (newStaff: StaffMember) => {
    setStaffList((prev) => [newStaff, ...prev]);
    try {
      await addStaffDoc(newStaff);
      showToast('success', 'স্টাফ মেম্বার যুক্ত হয়েছে', `${newStaff.name} ক্লাউডে সংরক্ষিত হয়েছে।`);
    } catch (err) {
      console.error('Firestore staff save error:', err);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    try {
      await deleteStaffDoc(staffId);
    } catch (err) {
      console.error('Firestore staff delete error:', err);
    }
  };

  const handlePayStaffSalary = async (
    staffId: string,
    payment: {
      voucherNo?: string;
      month: string;
      basicSalary: number;
      bonus: number;
      deduction: number;
      netAmount: number;
      paymentMethod: string;
      transactionId?: string;
      disbursedBy: string;
      note?: string;
      autoLogExpense?: boolean;
    }
  ) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;

    const voucherNo = payment.voucherNo || `VCH-SAL-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newPaymentRecord = {
      id: `stf_pay_${Date.now()}`,
      voucherNo,
      date: today,
      time: currentTime,
      month: payment.month,
      basicSalary: payment.basicSalary,
      bonus: payment.bonus,
      deduction: payment.deduction,
      netAmount: payment.netAmount,
      method: payment.paymentMethod,
      transactionId: payment.transactionId,
      disbursedBy: payment.disbursedBy,
      note: payment.note,
    };

    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            paymentHistory: [newPaymentRecord, ...(s.paymentHistory || [])],
          };
        }
        return s;
      })
    );

    const newReceipt: ReceiptData = {
      id: `rcp_sal_${Date.now()}`,
      receiptNo: voucherNo,
      type: 'staff',
      targetId: staff.id,
      targetName: staff.name,
      contactNumber: staff.mobileNumber,
      programme: staff.designation,
      branch: staff.branch,
      amountPaid: payment.netAmount,
      totalFee: staff.monthlySalary,
      dueAmount: 0,
      date: today,
      time: currentTime,
      receiverName: payment.disbursedBy,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      salaryMonth: payment.month,
      salaryDetails: {
        basicSalary: payment.basicSalary,
        bonus: payment.bonus,
        deduction: payment.deduction,
      },
    };

    setReceipts((prev) => [newReceipt, ...prev]);

    const newExpense: Expense = {
      id: `exp_sal_${Date.now()}`,
      voucherNo,
      title: `স্টাফ বেতন (${staff.name} - ${payment.month})`,
      category: 'salary_staff',
      amount: payment.netAmount,
      date: today,
      branch: staff.branch,
      recordedBy: payment.disbursedBy,
      paymentMethod: (payment.paymentMethod === 'cash' || payment.paymentMethod === 'bkash' || payment.paymentMethod === 'nagad' || payment.paymentMethod === 'bank') ? payment.paymentMethod : 'bank',
      notes: payment.note || `Staff Salary Disbursement for ${payment.month}`,
    };

    if (payment.autoLogExpense) {
      setExpenses((prev) => [newExpense, ...prev]);
    }

    // Save to Firestore in real-time
    try {
      await recordStaffPaymentDoc(staff, newPaymentRecord, newReceipt, newExpense);
      showToast('success', 'বেতন ভাউচার তৈরি হয়েছে', `ভাউচার #${voucherNo} ক্লাউডে সংরক্ষিত হয়েছে।`);
    } catch (err) {
      console.error('Firestore staff salary error:', err);
    }
  };

  const handleDeleteStaffVoucher = async (staffId: string, paymentId: string, voucherNo: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            paymentHistory: s.paymentHistory.filter((p) => p.id !== paymentId),
          };
        }
        return s;
      })
    );
    setReceipts((prev) => prev.filter((r) => r.receiptNo !== voucherNo));
    setExpenses((prev) => prev.filter((e) => e.voucherNo !== voucherNo));

    try {
      await deleteStaffPaymentDoc(staffId, paymentId, voucherNo);
    } catch (err) {
      console.error('Firestore staff voucher delete error:', err);
    }
  };

  // Handler: Log Completed Teacher Class (Firestore synced)
  const handleAddClassLog = async (newLog: TeacherClassLog) => {
    const teacher = teachers.find((t) => t.id === newLog.teacherId);
    setClassLogs((prev) => [newLog, ...prev]);

    // Optimistic teacher calculation
    if (teacher) {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === newLog.teacherId) {
            const updatedClasses = t.totalClassesTaken + 1;
            const updatedEarned = t.totalEarned + newLog.rateApplied;
            const updatedPending = updatedEarned - t.totalPaid;
            return {
              ...t,
              totalClassesTaken: updatedClasses,
              totalEarned: updatedEarned,
              pendingPayable: updatedPending,
            };
          }
          return t;
        })
      );
    }

    try {
      await addClassLogDoc(newLog, teacher);
      showToast('success', 'ক্লাস রেকর্ড কাউন্ট হয়েছে', `${newLog.subject} ক্লাস ক্লাউডে সিঙ্ক হয়েছে।`);
    } catch (err) {
      console.error('Firestore class log save error:', err);
    }
  };

  // Handler: Delete Class Log (Firestore synced)
  const handleDeleteClassLog = async (logId: string) => {
    const targetLog = classLogs.find((c) => c.id === logId);
    const teacher = targetLog ? teachers.find((t) => t.id === targetLog.teacherId) : undefined;
    const rateApplied = targetLog?.rateApplied || 0;

    if (targetLog && teacher) {
      setTeachers((prev) =>
        prev.map((t) => {
          if (t.id === targetLog.teacherId) {
            const updatedClasses = Math.max(0, t.totalClassesTaken - 1);
            const updatedEarned = Math.max(0, t.totalEarned - targetLog.rateApplied);
            const updatedPending = Math.max(0, updatedEarned - t.totalPaid);
            return {
              ...t,
              totalClassesTaken: updatedClasses,
              totalEarned: updatedEarned,
              pendingPayable: updatedPending,
            };
          }
          return t;
        })
      );
    }
    setClassLogs((prev) => prev.filter((c) => c.id !== logId));

    try {
      await deleteClassLogDoc(logId, teacher, rateApplied);
    } catch (err) {
      console.error('Firestore class log delete error:', err);
    }
  };

  // Handler: Add Expense (Firestore synced)
  const handleAddExpense = async (newExpense: Expense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    try {
      await addExpenseDoc(newExpense);
      showToast('success', 'খরচ ভাউচার যুক্ত হয়েছে', `${newExpense.title} ক্লাউডে সংরক্ষিত হয়েছে।`);
    } catch (err) {
      console.error('Firestore expense save error:', err);
    }
  };

  // Handler: Delete Expense (Firestore synced)
  const handleDeleteExpense = async (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    try {
      await deleteExpenseDoc(expenseId);
    } catch (err) {
      console.error('Firestore expense delete error:', err);
    }
  };

  // Handler: Delete Receipt (Firestore synced)
  const handleDeleteReceipt = async (receiptId: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    try {
      await deleteReceiptDoc(receiptId);
    } catch (err) {
      console.error('Firestore receipt delete error:', err);
    }
  };

  // If user is not authenticated, display full-screen Login Screen with Entry Code
  if (!currentUser) {
    return (
      <LoginScreen
        defaultBranch="Narayanganj"
        onLogin={(user) => {
          setCurrentUser(user);
          setSelectedBranch('Narayanganj');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#241315] flex flex-col font-sans selection:bg-[#6d1a22] selection:text-[#fcf7ee]">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        onLogout={() => setCurrentUser(null)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onResetAllData={() => setIsResetModalOpen(true)}
        onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
        onOpenCashMemo={() => setIsCashMemoOpen(true)}
        onOpenFontSettings={() => setIsFontSettingsOpen(true)}
        currentFontName={FONT_OPTIONS.find((f) => f.id === fontSettings.banglaFont)?.nameBn}
        isCloudSynced={isCloudSynced}
      />

      {/* Main Content Area - Full Width Edge-to-Edge Responsiveness */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            students={students}
            teachers={teachers}
            staffList={staffList}
            expenses={expenses}
            classLogs={classLogs}
            receipts={receipts}
            selectedBranch={selectedBranch}
            onNavigate={(tab) => setActiveTab(tab)}
            onViewReceipt={(r) => setActiveReceipt(r)}
            onResetAllData={() => setIsResetModalOpen(true)}
            onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
            onNewStudentPayment={() => {
              setActiveTab('students');
              setIsStudentModalOpen(true);
            }}
            onNewTeacherPayment={() => {
              setActiveTab('teachers');
              setIsTeacherModalOpen(true);
            }}
            onNewExpense={() => {
              setActiveTab('expenses');
              setIsExpenseModalOpen(true);
            }}
            onNewClassLog={() => {
              setActiveTab('class-counting');
              setIsClassModalOpen(true);
            }}
          />
        )}

        {activeTab === 'students' && (
          <StudentPayments
            students={students}
            onAddStudent={handleAddStudent}
            onRecordPayment={handleRecordStudentPayment}
            onDeleteStudent={handleDeleteStudent}
            onViewReceipt={(r) => setActiveReceipt(r)}
            selectedBranch={selectedBranch}
            currentUser={currentUser}
            isAddModalOpen={isStudentModalOpen}
            setIsAddModalOpen={setIsStudentModalOpen}
          />
        )}

        {activeTab === 'teachers' && (
          <TeacherManagement
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onPayTeacher={handlePayTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onViewReceipt={(r) => setActiveReceipt(r)}
            selectedBranch={selectedBranch}
            currentUser={currentUser}
            isAddModalOpen={isTeacherModalOpen}
            setIsAddModalOpen={setIsTeacherModalOpen}
          />
        )}

        {activeTab === 'class-counting' && (
          <TeacherClassCounting
            classLogs={classLogs}
            teachers={teachers}
            onAddClassLog={handleAddClassLog}
            onDeleteClassLog={handleDeleteClassLog}
            selectedBranch={selectedBranch}
            isAddModalOpen={isClassModalOpen}
            setIsAddModalOpen={setIsClassModalOpen}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTracker
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            selectedBranch={selectedBranch}
            currentUser={currentUser}
            isAddModalOpen={isExpenseModalOpen}
            setIsAddModalOpen={setIsExpenseModalOpen}
          />
        )}

        {activeTab === 'staff-salary' && (
          <StaffSalaryManagement
            staffList={staffList}
            onAddStaff={handleAddStaff}
            onPaySalary={handlePayStaffSalary}
            onDeleteStaff={handleDeleteStaff}
            onDeleteVoucher={handleDeleteStaffVoucher}
            onViewReceipt={(r) => setActiveReceipt(r)}
            selectedBranch={selectedBranch}
            currentUser={currentUser}
            expenses={expenses}
          />
        )}

        {activeTab === 'receipts' && (
          <ReceiptsList
            receipts={receipts}
            onViewReceipt={(r) => setActiveReceipt(r)}
            onDeleteReceipt={handleDeleteReceipt}
            selectedBranch={selectedBranch}
            onOpenNewCashMemo={() => setIsCashMemoOpen(true)}
          />
        )}
      </main>

      {/* Official Receipt & Voucher Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* Standalone Cash Memo & Payment Voucher Modal */}
      <CashMemoModal
        isOpen={isCashMemoOpen}
        onClose={() => setIsCashMemoOpen(false)}
        students={students}
        currentUser={currentUser}
        onSaveReceipt={(newReceipt) => {
          setReceipts((prev) => [newReceipt, ...prev]);

          // If this voucher corresponds to an existing registered student, update their ledger as well!
          if (newReceipt.targetId && !newReceipt.targetId.startsWith('guest_')) {
            const studentExists = students.find((s) => s.id === newReceipt.targetId);
            if (studentExists) {
              const newPaid = studentExists.paidAmount + newReceipt.amountPaid;
              const newDue = Math.max(0, studentExists.totalFee - newPaid);
              setStudents((prev) =>
                prev.map((s) =>
                  s.id === newReceipt.targetId
                    ? {
                        ...s,
                        paidAmount: newPaid,
                        dueAmount: newDue,
                        lastPaymentDate: newReceipt.date,
                        paymentHistory: [
                          ...s.paymentHistory,
                          {
                            id: `pay_memo_${Date.now()}`,
                            date: newReceipt.date,
                            time: newReceipt.time,
                            amount: newReceipt.amountPaid,
                            method: newReceipt.paymentMethod,
                            receivedBy: newReceipt.receiverName,
                            receiptNo: newReceipt.receiptNo,
                            note: 'Cash Memo Voucher',
                          },
                        ],
                      }
                    : s
                )
              );
            }
          }

          showToast(
            'success',
            'ক্যাশ মেমো সংরক্ষিত হয়েছে',
            `ভাউচার #${newReceipt.receiptNo} সফলভাবে রসিদ খতিয়ানে যুক্ত হয়েছে।`
          );
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={(user) => setCurrentUser(user)}
      />

      {/* Monthly Audit & Calculations Excel Export Modal */}
      <MonthlyReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        students={students}
        teachers={teachers}
        staffList={staffList}
        expenses={expenses}
        classLogs={classLogs}
        receipts={receipts}
        selectedBranch={selectedBranch}
        currentUser={currentUser}
      />

      {/* Bangla Font & Typography Customizer Modal */}
      <FontSettingsModal
        isOpen={isFontSettingsOpen}
        onClose={() => setIsFontSettingsOpen(false)}
        currentSettings={fontSettings}
        onSaveSettings={(newSettings) => setFontSettings(newSettings)}
      />

      {/* Confirmation Modal: Reset All Data to Zero */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#be123c] flex items-center justify-center mx-auto mb-3">
              <RotateCcw size={24} />
            </div>
            <h3 className="text-lg font-black text-[#521218] font-serif">
              সব হিসাব ও কাউন্টিং ০ করতে চান?
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              সিস্টেমের সকল পূর্ববর্তী হিসাব, ছাত্র-ছাত্রী, শিক্ষক, ক্লাসের হিসাব, খরচ ও রসিদের রেকর্ড সম্পূর্ণ মুছে শূন্য (০) থেকে শুরু হবে।
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-[#d9c7b4] text-gray-700 hover:bg-[#faf4ea] cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-black rounded-xl bg-[#be123c] hover:bg-[#9f1239] text-white shadow-md transition-all active:scale-95 cursor-pointer"
              >
                হ্যাঁ, সব ০ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="no-print bg-[#fbf7f0] border-t border-[#e2d5c3] mt-12 py-8 text-center text-xs text-gray-600">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col items-center gap-3">
          <AtomicLogo size="sm" showText={true} />

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-700 font-medium">
            <span className="font-black text-[#6d1a22]">নারায়ণগঞ্জ ক্যাম্পাস (Narayanganj Campus)</span>
            <span>•</span>
            <span>১. প্রতিষ্ঠাতা: অনির্বাণ ঘোষ (Anirban Ghosh)</span>
            <span>•</span>
            <span>২. আইসিটি প্রধান: শ্রাবণ নন্দী (Srabon Nondi)</span>
            <span>•</span>
            <span>৩. ব্যবস্থাপক: অঙ্কন সাহা (Ankon Saha)</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            © {new Date().getFullYear()} অ্যাটমিক শিক্ষা পরিবার (Atomic Inside ERP) • কেন্দ্রীয় প্রাতিষ্ঠানিক হিসাব ও স্বয়ংক্রিয় মানি রসিদ সিস্টেম • সর্বস্বত্ব সংরক্ষিত
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CoachingApp />
    </ToastProvider>
  );
}
