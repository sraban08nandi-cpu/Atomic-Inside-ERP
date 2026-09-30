import React, { useState, useMemo, useEffect } from 'react';
import { Student, Teacher, Expense, TeacherClassLog, ReceiptData, Branch, User, StaffMember } from '../types';
import { exportMultiSectionExcel, exportToCSV } from '../utils/exportCsv';
import { generateMasterExcelWorkbook, MasterReportData } from '../utils/exportExcel';
import { useToast } from './ToastContext';
import {
  Calendar,
  Download,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarCheck,
  X,
  Info,
  Users,
  GraduationCap,
  Briefcase,
  Receipt,
  FileText,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  teachers: Teacher[];
  staffList: StaffMember[];
  expenses: Expense[];
  classLogs: TeacherClassLog[];
  receipts: ReceiptData[];
  selectedBranch: Branch;
  currentUser: User | null;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  students,
  teachers,
  staffList,
  expenses,
  classLogs,
  receipts,
  selectedBranch,
  currentUser,
}) => {
  const { showToast } = useToast();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [isExporting, setIsExporting] = useState<'monthly' | 'all-time' | 'csv' | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<
    'summary' | 'student-roster' | 'students' | 'classes' | 'teachers' | 'staff' | 'expenses' | 'receipts'
  >('summary');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Month prefix in 'YYYY-MM' format
  const monthPrefix = useMemo(() => {
    const mm = String(selectedMonth + 1).padStart(2, '0');
    return `${selectedYear}-${mm}`;
  }, [selectedYear, selectedMonth]);

  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear} (${BENGALI_MONTHS[selectedMonth]} ${selectedYear})`;

  // Available Years
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentDate.getFullYear(), 2026, 2025]);
    students.forEach((s) => {
      if (s.admissionDate) years.add(new Date(s.admissionDate).getFullYear());
      s.paymentHistory?.forEach((p) => p.date && years.add(new Date(p.date).getFullYear()));
    });
    classLogs.forEach((c) => c.date && years.add(new Date(c.date).getFullYear()));
    expenses.forEach((e) => e.date && years.add(new Date(e.date).getFullYear()));
    receipts.forEach((r) => r.date && years.add(new Date(r.date).getFullYear()));
    teachers.forEach((t) => t.paymentHistory?.forEach((p) => p.date && years.add(new Date(p.date).getFullYear())));
    staffList.forEach((s) => s.paymentHistory?.forEach((p) => p.date && years.add(new Date(p.date).getFullYear())));
    return Array.from(years).sort((a, b) => b - a);
  }, [students, classLogs, expenses, receipts, teachers, staffList]);

  // Branch filtering
  const branchStudents = useMemo(() => students.filter((s) => !s.branch || s.branch === selectedBranch), [students, selectedBranch]);
  const branchTeachers = useMemo(() => teachers.filter((t) => !t.branch || t.branch === selectedBranch), [teachers, selectedBranch]);
  const branchStaff = useMemo(() => staffList.filter((s) => !s.branch || s.branch === selectedBranch), [staffList, selectedBranch]);
  const branchExpenses = useMemo(() => expenses.filter((e) => !e.branch || e.branch === selectedBranch), [expenses, selectedBranch]);
  const branchClassLogs = useMemo(() => classLogs.filter((c) => !c.branch || c.branch === selectedBranch), [classLogs, selectedBranch]);
  const branchReceipts = useMemo(() => receipts.filter((r) => !r.branch || r.branch === selectedBranch), [receipts, selectedBranch]);

  // 1. Monthly Student Payments (Collects student.paymentHistory + receipts)
  const monthlyStudentPayments = useMemo(() => {
    const seenReceipts = new Set<string>();
    const list: Array<{
      studentId: string;
      studentName: string;
      programme: string;
      mobileNumber: string;
      paymentDate: string;
      paymentTime: string;
      amount: number;
      method: string;
      receiptNo: string;
      receivedBy: string;
      note?: string;
    }> = [];

    // From student models
    branchStudents.forEach((student) => {
      student.paymentHistory?.forEach((p) => {
        if (p.date && p.date.startsWith(monthPrefix)) {
          seenReceipts.add(p.receiptNo);
          list.push({
            studentId: student.studentId,
            studentName: student.name,
            programme: student.programme,
            mobileNumber: student.mobileNumber,
            paymentDate: p.date,
            paymentTime: p.time,
            amount: p.amount,
            method: p.method,
            receiptNo: p.receiptNo,
            receivedBy: p.receivedBy,
            note: p.note,
          });
        }
      });
    });

    // Standalone student receipts
    branchReceipts.forEach((r) => {
      if (r.type === 'student' && r.date && r.date.startsWith(monthPrefix) && !seenReceipts.has(r.receiptNo)) {
        seenReceipts.add(r.receiptNo);
        list.push({
          studentId: r.studentId || '-',
          studentName: r.targetName,
          programme: r.programme,
          mobileNumber: r.contactNumber,
          paymentDate: r.date,
          paymentTime: r.time,
          amount: r.amountPaid,
          method: r.paymentMethod,
          receiptNo: r.receiptNo,
          receivedBy: r.receiverName,
          note: 'Cash Memo Voucher',
        });
      }
    });

    return list.sort((a, b) => (b.paymentDate + b.paymentTime).localeCompare(a.paymentDate + a.paymentTime));
  }, [branchStudents, branchReceipts, monthPrefix]);

  const totalMonthlyStudentIncome = useMemo(
    () => monthlyStudentPayments.reduce((acc, p) => acc + p.amount, 0),
    [monthlyStudentPayments]
  );

  // 2. Monthly Class Logs
  const monthlyClassLogs = useMemo(() => {
    return branchClassLogs
      .filter((log) => log.date && log.date.startsWith(monthPrefix))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [branchClassLogs, monthPrefix]);

  const totalMonthlyClasses = monthlyClassLogs.length;
  const totalMonthlyClassHours = useMemo(
    () => monthlyClassLogs.reduce((acc, c) => acc + c.durationHours, 0),
    [monthlyClassLogs]
  );
  const totalMonthlyHonorariumGenerated = useMemo(
    () => monthlyClassLogs.reduce((acc, c) => acc + c.rateApplied, 0),
    [monthlyClassLogs]
  );

  // 3. Monthly Teacher Payouts
  const monthlyTeacherPayouts = useMemo(() => {
    const list: Array<{
      teacherName: string;
      subject: string;
      paymentDate: string;
      paymentTime: string;
      amount: number;
      method: string;
      receiptNo: string;
      disbursedBy: string;
      note?: string;
    }> = [];

    branchTeachers.forEach((teacher) => {
      teacher.paymentHistory?.forEach((p) => {
        if (p.date && p.date.startsWith(monthPrefix)) {
          list.push({
            teacherName: teacher.name,
            subject: teacher.subject,
            paymentDate: p.date,
            paymentTime: p.time,
            amount: p.amount,
            method: p.method,
            receiptNo: p.receiptNo,
            disbursedBy: p.disbursedBy,
            note: p.note,
          });
        }
      });
    });

    return list.sort((a, b) => (b.paymentDate + b.paymentTime).localeCompare(a.paymentDate + a.paymentTime));
  }, [branchTeachers, monthPrefix]);

  const totalMonthlyTeacherPaid = useMemo(
    () => monthlyTeacherPayouts.reduce((acc, p) => acc + p.amount, 0),
    [monthlyTeacherPayouts]
  );

  // 4. Monthly Staff Salary Disbursements
  const monthlyStaffPayments = useMemo(() => {
    const list: Array<{
      voucherNo: string;
      staffId: string;
      staffName: string;
      designation: string;
      department: string;
      month: string;
      date: string;
      time: string;
      basicSalary: number;
      bonus: number;
      deduction: number;
      netAmount: number;
      method: string;
      transactionId?: string;
      disbursedBy: string;
      note?: string;
    }> = [];

    const monthStr = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

    branchStaff.forEach((st) => {
      (st.paymentHistory || []).forEach((p) => {
        const isMatchDate = p.date && p.date.startsWith(monthPrefix);
        const isMatchMonth = p.month && p.month.toLowerCase().includes(monthStr.toLowerCase());
        if (isMatchDate || isMatchMonth) {
          list.push({
            voucherNo: p.voucherNo,
            staffId: st.staffId,
            staffName: st.name,
            designation: st.designation,
            department: st.department,
            month: p.month || monthStr,
            date: p.date,
            time: p.time,
            basicSalary: p.basicSalary || st.monthlySalary,
            bonus: p.bonus || 0,
            deduction: p.deduction || 0,
            netAmount: p.netAmount,
            method: p.method,
            transactionId: p.transactionId,
            disbursedBy: p.disbursedBy,
            note: p.note,
          });
        }
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [branchStaff, monthPrefix, selectedMonth, selectedYear]);

  const totalMonthlyStaffPaid = useMemo(
    () => monthlyStaffPayments.reduce((acc, p) => acc + p.netAmount, 0),
    [monthlyStaffPayments]
  );

  // 5. Monthly Overhead Expenses (Excluding any staff salary already in expenses to avoid double counting)
  const monthlyExpenses = useMemo(() => {
    return branchExpenses
      .filter((e) => e.date && e.date.startsWith(monthPrefix))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [branchExpenses, monthPrefix]);

  const monthlyStaffExpensesInLog = useMemo(
    () => monthlyExpenses.filter((e) => e.category === 'salary_staff').reduce((acc, e) => acc + e.amount, 0),
    [monthlyExpenses]
  );

  const monthlyNonSalaryExpenses = useMemo(
    () => monthlyExpenses.filter((e) => e.category !== 'salary_staff'),
    [monthlyExpenses]
  );

  const totalMonthlyNonSalaryExpenses = useMemo(
    () => monthlyNonSalaryExpenses.reduce((acc, e) => acc + e.amount, 0),
    [monthlyNonSalaryExpenses]
  );

  // Total Outflow: Teachers + All Expenses + Any unlogged staff salary
  const unloggedStaffSalary = Math.max(0, totalMonthlyStaffPaid - monthlyStaffExpensesInLog);
  const totalMonthlyOutflow = totalMonthlyTeacherPaid + totalMonthlyNonSalaryExpenses + totalMonthlyStaffPaid;
  const monthlyNetCashFlow = totalMonthlyStudentIncome - totalMonthlyOutflow;

  // 6. Central Receipts in Month
  const monthlyReceipts = useMemo(() => {
    return branchReceipts
      .filter((r) => r.date && r.date.startsWith(monthPrefix))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [branchReceipts, monthPrefix]);

  const categoryLabelMap: Record<string, string> = {
    rent: 'ক্যাম্পাস রুম ভাড়া (Rent)',
    utilities: 'বিদ্যুৎ ও পরিষেবা (Utilities)',
    printing: 'লেকচার শিট ও ফটোকপি (Sheets)',
    salary_staff: 'স্টাফ ও অফিস বেতন (Staff Salary)',
    refreshment: 'চা ও আপ্যায়ন (Refreshment)',
    marketing: 'ব্যানার ও ভর্তি প্রচার (Marketing)',
    maintenance: 'ল্যাব ও রক্ষণাবেক্ষণ (Maintenance)',
    other: 'বিবিধ অফিস খরচ (Miscellaneous)',
  };

  // Build Master Report Data for ExcelJS
  const buildReportPayload = (isAllTime: boolean = false): MasterReportData => {
    const activeStudents = branchStudents;
    const activeTeachers = branchTeachers;
    const activeStaff = branchStaff;

    // Student collections
    const sourceStudentPayments = isAllTime
      ? branchStudents.flatMap((s) =>
          (s.paymentHistory || []).map((p) => ({
            studentId: s.studentId,
            studentName: s.name,
            programme: s.programme,
            mobileNumber: s.mobileNumber,
            paymentDate: p.date,
            paymentTime: p.time,
            amount: p.amount,
            method: p.method,
            receiptNo: p.receiptNo,
            receivedBy: p.receivedBy,
            note: p.note,
          }))
        )
      : monthlyStudentPayments;

    // Class Logs
    const sourceClassLogs = isAllTime ? branchClassLogs : monthlyClassLogs;

    // Teacher Payouts
    const sourceTeacherPayouts = isAllTime
      ? branchTeachers.flatMap((t) =>
          (t.paymentHistory || []).map((p) => ({
            teacherName: t.name,
            subject: t.subject,
            paymentDate: p.date,
            paymentTime: p.time,
            amount: p.amount,
            method: p.method,
            receiptNo: p.receiptNo,
            disbursedBy: p.disbursedBy,
            note: p.note,
          }))
        )
      : monthlyTeacherPayouts;

    // Staff Vouchers
    const sourceStaffVouchers = isAllTime
      ? branchStaff.flatMap((st) =>
          (st.paymentHistory || []).map((p) => ({
            voucherNo: p.voucherNo,
            staffId: st.staffId,
            staffName: st.name,
            designation: st.designation,
            department: st.department,
            month: p.month,
            date: p.date,
            time: p.time,
            basicSalary: p.basicSalary || st.monthlySalary,
            bonus: p.bonus || 0,
            deduction: p.deduction || 0,
            netAmount: p.netAmount,
            method: p.method,
            transactionId: p.transactionId,
            disbursedBy: p.disbursedBy,
            note: p.note,
          }))
        )
      : monthlyStaffPayments;

    // Expenses
    const sourceExpenses = isAllTime ? branchExpenses : monthlyExpenses;

    // Central Receipts
    const sourceReceipts = isAllTime ? branchReceipts : monthlyReceipts;

    // Financial totals
    const calcStudentIncome = sourceStudentPayments.reduce((acc, p) => acc + p.amount, 0);
    const calcTeacherPaid = sourceTeacherPayouts.reduce((acc, p) => acc + p.amount, 0);
    const calcStaffPaid = sourceStaffVouchers.reduce((acc, p) => acc + p.netAmount, 0);
    const calcNonSalaryExpenses = sourceExpenses
      .filter((e) => e.category !== 'salary_staff')
      .reduce((acc, e) => acc + e.amount, 0);
    const calcTotalOutflow = calcTeacherPaid + calcStaffPaid + calcNonSalaryExpenses;
    const calcNetCash = calcStudentIncome - calcTotalOutflow;

    const totalStudentDues = activeStudents.reduce((acc, s) => acc + s.dueAmount, 0);
    const totalFacultyDues = activeTeachers.reduce((acc, t) => acc + t.pendingPayable, 0);
    const totalStaffPayroll = activeStaff.reduce((acc, s) => acc + s.monthlySalary, 0);

    const calcClassCount = sourceClassLogs.length;
    const calcClassHours = sourceClassLogs.reduce((acc, c) => acc + c.durationHours, 0);
    const calcClassAccrued = sourceClassLogs.reduce((acc, c) => acc + c.rateApplied, 0);

    // Summary Rows for Sheet 1
    const summaryRows = [
      {
        sl: 'INFO',
        metric: 'ক্যাম্পাস ও পরিচালনা পরিষদ (Campus Board)',
        details: `${selectedBranch} Campus • 1. Founder- Anirban Ghosh • 2. ICT Head- Srabon Nondi • 3. Manager- Ankon Saha`,
        amount: `${selectedBranch} Branch`,
        impact: 'Official Registered Campus',
        type: 'neutral' as const,
      },
      {
        sl: 'INFO',
        metric: 'হিসাবকাল ও অডিট মাস (Accounting Period)',
        details: isAllTime ? 'সর্বকালীন সম্পূর্ণ ইআরপি ডেটা (All-Time Historical)' : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
        amount: isAllTime ? 'All-Time Master' : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
        impact: 'Master Audit Scope',
        type: 'neutral' as const,
      },
      // PART 1: REVENUE
      {
        sl: 'SEC-A',
        metric: '=== PART 1: 📥 REVENUE & CASH INFLOW (আয়ের খাত ও নেট আয়) ===',
        details: 'শিক্ষার্থীদের নিকট থেকে সংগৃহীত কোর্স ও ভর্তি ফি',
        amount: 'INFLOW AUDIT',
        impact: 'Cash Inflow (+)',
        type: 'section_header' as const,
      },
      {
        sl: 1,
        metric: 'শিক্ষার্থী কোর্স ফি ও কিস্তি আদায় (Student Fee Collections)',
        details: `${sourceStudentPayments.length} টি মানি রসিদ কিস্তি আদায়`,
        amount: calcStudentIncome,
        impact: 'ক্যাশ ইনফ্লো / মোট জমা (+)',
        type: 'inflow' as const,
      },
      {
        sl: 'TOTAL-1',
        metric: '💰 সর্বমোট নেট আয় (TOTAL NET EARNINGS / CASH INFLOW)',
        details: 'শিক্ষার্থীদের কোর্স ফি ও ভর্তি বাবদ মোট সংগৃহীত অর্থ (All Student Collections)',
        amount: calcStudentIncome,
        impact: '✅ TOTAL NET INFLOW (+)',
        type: 'subtotal_inflow' as const,
      },
      // PART 2: EXPENDITURE
      {
        sl: 'SEC-B',
        metric: '=== PART 2: 📤 EXPENDITURE & OUTFLOW (ব্যয়ের খাত ও নেট ব্যয়) ===',
        details: 'শিক্ষক সম্মানী + কর্মকর্তা/স্টাফ বেতন + অফিস পরিচালন ব্যয়',
        amount: 'OUTFLOW AUDIT',
        impact: 'Cash Outflow (-)',
        type: 'section_header' as const,
      },
      {
        sl: 2,
        metric: 'শিক্ষক সম্মানী প্রদান (Faculty Honorarium Paid)',
        details: `${sourceTeacherPayouts.length} টি পেমেন্ট ভাউচার প্রদান`,
        amount: calcTeacherPaid,
        impact: 'ক্যাশ আউটফ্লো / সম্মানী ব্যয় (-)',
        type: 'outflow' as const,
      },
      {
        sl: 3,
        metric: 'কর্মকর্তা ও স্টাফ বেতন প্রদান (Staff Salaries Paid)',
        details: `${sourceStaffVouchers.length} টি বেতন ভাউচার পরিশোধ`,
        amount: calcStaffPaid,
        impact: 'ক্যাশ আউটফ্লো / স্টাফ বেতন ব্যয় (-)',
        type: 'outflow' as const,
      },
      {
        sl: 4,
        metric: 'ক্যাম্পাস রুম ভাড়া, বিদ্যুৎ ও পরিষেবা (Rent & Utilities)',
        details: `${sourceExpenses.filter((e) => e.category === 'rent' || e.category === 'utilities').length} টি ভাউচার`,
        amount: sourceExpenses
          .filter((e) => e.category === 'rent' || e.category === 'utilities')
          .reduce((acc, e) => acc + e.amount, 0),
        impact: 'ক্যাশ আউটফ্লো / অফিস ব্যয় (-)',
        type: 'outflow' as const,
      },
      {
        sl: 5,
        metric: 'লেকচার শিট, ফটোকপি ও প্রিন্টিং (Sheets & Printing)',
        details: `${sourceExpenses.filter((e) => e.category === 'printing').length} টি ভাউচার`,
        amount: sourceExpenses
          .filter((e) => e.category === 'printing')
          .reduce((acc, e) => acc + e.amount, 0),
        impact: 'ক্যাশ আউটফ্লো / একাডেমিক প্রিন্টিং (-)',
        type: 'outflow' as const,
      },
      {
        sl: 6,
        metric: 'অন্যান্য প্রাতিষ্ঠানিক অফিস ও পরিচালন ব্যয় (Other Overhead Expenses)',
        details: `${sourceExpenses.filter((e) => !['salary_staff', 'rent', 'utilities', 'printing'].includes(e.category)).length} টি ভাউচার (চা-আপ্যায়ন, ব্যানার, ল্যাব ইত্যাদি)`,
        amount: sourceExpenses
          .filter((e) => !['salary_staff', 'rent', 'utilities', 'printing'].includes(e.category))
          .reduce((acc, e) => acc + e.amount, 0),
        impact: 'ক্যাশ আউটফ্লো / বিবিধ অফিস ব্যয় (-)',
        type: 'outflow' as const,
      },
      {
        sl: 'TOTAL-2',
        metric: '💸 সর্বমোট নেট ব্যয় (TOTAL NET EXPENSES / COMBINED OUTFLOW)',
        details: 'শিক্ষক সম্মানী + কর্মকর্তা বেতন + সার্বিক অফিস পরিচালন ব্যয় (Total Outflow)',
        amount: calcTotalOutflow,
        impact: '🔻 TOTAL NET OUTFLOW (-)',
        type: 'subtotal_outflow' as const,
      },
      // PART 3: NET BOTTOM LINE
      {
        sl: 'SEC-C',
        metric: '=== PART 3: ⚖️ BOTTOM LINE CASH POSITION (নিট নগদ স্থিতি ও মুনাফা) ===',
        details: 'মোট নেট আয় (৳) বিয়োগ মোট নেট ব্যয় (৳)',
        amount: 'NET POSITION',
        impact: 'P&L Bottom Line',
        type: 'section_header' as const,
      },
      {
        sl: 'NET-P&L',
        metric: '🌟 নিট ক্যাশ উদ্বৃত্ত / নিট লাভ (NET CASH SURPLUS / PROFIT)',
        details: calcNetCash >= 0 ? 'নিট ক্যাশ উদ্বৃত্ত / লাভ (Surplus Cash in Hand)' : 'নিট ঘাটতি / ঋণাত্মক স্থিতি (Deficit Cash)',
        amount: calcNetCash,
        impact: calcNetCash >= 0 ? '✓ নিট উদ্বৃত্ত / Surplus' : '⚠️ নিট ঘাটতি / Deficit',
        type: 'final_net' as const,
      },
      // PART 4: RECEIVABLES & ACCRUALS
      {
        sl: 'SEC-D',
        metric: '=== PART 4: ⏳ OUTSTANDING RECEIVABLES & LIABILITIES (বকেয়া খতিয়ান) ===',
        details: 'ভবিষ্যৎ আদায়যোগ্য পাওনা ও প্রদেয় দায়সমূহ',
        amount: 'ACCRUED BALANCES',
        impact: 'Audit Ledger',
        type: 'section_header' as const,
      },
      {
        sl: 7,
        metric: 'মোট শিক্ষার্থী বকেয়া পাওনা (Total Student Dues Receivable)',
        details: `${activeStudents.filter((s) => s.dueAmount > 0).length} জন শিক্ষার্থীর ফি বকেয়া`,
        amount: totalStudentDues,
        impact: 'ভবিষ্যৎ আদায়যোগ্য প্রাতিষ্ঠানিক সম্পদ',
        type: 'kpi' as const,
      },
      {
        sl: 8,
        metric: 'মোট শিক্ষক বকেয়া সম্মানী (Outstanding Faculty Dues Payable)',
        details: `${activeTeachers.filter((t) => t.pendingPayable > 0).length} জন শিক্ষকের সম্মানী বকেয়া`,
        amount: totalFacultyDues,
        impact: 'বকেয়া সম্মানী দায় (Payable)',
        type: 'kpi' as const,
      },
      {
        sl: 9,
        metric: 'মাসিক কর্মকর্তা পে-রোল বাজেট (Monthly Staff Payroll Budget)',
        details: `${activeStaff.length} জন সক্রিয় কর্মকর্তা/কর্মচারী`,
        amount: totalStaffPayroll,
        impact: 'মাসিক নির্ধারিত বেতন প্রতিশ্রুতি',
        type: 'kpi' as const,
      },
      {
        sl: 10,
        metric: 'সম্পন্ন ক্লাসের সংখ্যা ও মোট সময় (Classes Conducted Count)',
        details: `${calcClassHours.toFixed(1)} মোট পাঠদান ঘণ্টা সম্পন্ন`,
        amount: `${calcClassCount} টি ক্লাস`,
        impact: 'একাডেমিক পাঠদান আউটপুট',
        type: 'kpi' as const,
      },
    ];

    // Expense Category Breakdown
    const expenseCatCounts: Record<string, { count: number; total: number }> = {};
    sourceExpenses.forEach((e) => {
      const cat = e.category || 'other';
      if (!expenseCatCounts[cat]) expenseCatCounts[cat] = { count: 0, total: 0 };
      expenseCatCounts[cat].count += 1;
      expenseCatCounts[cat].total += e.amount;
    });

    const expenseCategories = Object.entries(expenseCatCounts).map(([cat, val], idx) => ({
      sl: idx + 1,
      category: cat,
      categoryName: categoryLabelMap[cat] || cat,
      vouchersCount: val.count,
      totalAmount: val.total,
      percentage: calcTotalOutflow > 0 ? (val.total / calcTotalOutflow) * 100 : 0,
    }));

    return {
      institution: 'Atomic Inside Coaching Care (অ্যাটমিক শিক্ষা পরিবার)',
      reportTitle: isAllTime
        ? 'All-Time Master ERP Comprehensive Financial & Academic Audit'
        : 'Master Monthly Accounting & Academic Audit Report',
      branch: `${selectedBranch} Campus (নারায়ণগঞ্জ শাখা)`,
      monthYear: isAllTime ? 'All-Time Historical Ledger' : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
      generatedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      generatedBy: currentUser ? currentUser.name : 'Srabon Nondi (ICT Head)',
      isAllTime,

      kpis: {
        totalStudentIncome: calcStudentIncome,
        totalTeacherPaid: calcTeacherPaid,
        totalStaffPaid: calcStaffPaid,
        totalOverheadExpenses: calcNonSalaryExpenses,
        totalCombinedOutflow: calcTotalOutflow,
        netCashFlow: calcNetCash,
        totalRegisteredStudents: activeStudents.length,
        totalStudentDue: totalStudentDues,
        totalFacultyCount: activeTeachers.length,
        totalClassesConducted: calcClassCount,
        totalClassHours: calcClassHours,
        totalHonorariumAccrued: calcClassAccrued,
        totalFacultyDue: totalFacultyDues,
        totalStaffCount: activeStaff.length,
        totalStaffPayrollBudget: totalStaffPayroll,
      },

      summaryRows,

      // Sheet 2: Master Student Directory & Dues
      allStudents: activeStudents.map((s, idx) => ({
        sl: idx + 1,
        studentId: s.studentId,
        name: s.name,
        mobileNumber: s.mobileNumber,
        programme: s.programme,
        batchTime: s.batchTime || 'Regular',
        branch: s.branch,
        admissionDate: s.admissionDate,
        totalFee: s.totalFee,
        paidAmount: s.paidAmount,
        dueAmount: s.dueAmount,
        status: s.dueAmount === 0 ? 'Full Paid / পরিশোধিত' : s.paidAmount > 0 ? 'Partial Due / আংশিক বকেয়া' : 'Unpaid / অপরিশোধিত',
        installmentsCount: s.paymentHistory?.length || 0,
        lastPaymentDate: s.lastPaymentDate || s.admissionDate || 'N/A',
      })),

      // Sheet 3: Student Collections
      students: sourceStudentPayments.map((p, idx) => ({
        sl: idx + 1,
        receiptNo: p.receiptNo,
        studentId: p.studentId || '-',
        studentName: p.studentName,
        programme: p.programme,
        mobileNumber: p.mobileNumber,
        paymentDate: p.paymentDate,
        paymentTime: p.paymentTime,
        amount: p.amount,
        method: p.method === 'cash' ? 'Cash / নগদ' : p.method,
        receivedBy: p.receivedBy,
        note: p.note,
      })),

      // Sheet 4: Master Teachers
      allTeachers: activeTeachers.map((t, idx) => ({
        sl: idx + 1,
        name: t.name,
        mobileNumber: t.mobileNumber,
        subject: t.subject,
        ratePerClass: t.ratePerClass,
        branch: t.branch,
        joiningDate: t.joiningDate,
        totalClassesTaken: t.totalClassesTaken,
        totalEarned: t.totalEarned,
        totalPaid: t.totalPaid,
        pendingPayable: t.pendingPayable,
        status: t.pendingPayable === 0 ? 'Settled / পরিশোধিত' : 'Payable Due / বকেয়া',
      })),

      // Sheet 5: Class Logs
      classLogs: sourceClassLogs.map((c, idx) => ({
        sl: idx + 1,
        date: c.date,
        time: c.time,
        teacherName: c.teacherName,
        subject: c.subject,
        batchName: c.batchName,
        topic: c.topic,
        durationHours: c.durationHours,
        studentAttendanceCount: c.studentAttendanceCount,
        rateApplied: c.rateApplied,
        status: c.status,
        branch: c.branch,
      })),

      // Sheet 6: Teacher Payouts
      teacherPayouts: sourceTeacherPayouts.map((p, idx) => ({
        sl: idx + 1,
        receiptNo: p.receiptNo,
        teacherName: p.teacherName,
        subject: p.subject,
        paymentDate: p.paymentDate,
        paymentTime: p.paymentTime,
        amount: p.amount,
        method: p.method === 'cash' ? 'Cash / নগদ' : p.method,
        disbursedBy: p.disbursedBy,
        note: p.note,
      })),

      // Sheet 7: Staff Directory
      allStaff: activeStaff.map((st, idx) => {
        const monthStr = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
        const paidThisMonth = (st.paymentHistory || []).some(
          (p) => (p.date && p.date.startsWith(monthPrefix)) || (p.month && p.month.toLowerCase().includes(monthStr.toLowerCase()))
        );
        const totalPaidToDate = (st.paymentHistory || []).reduce((acc, p) => acc + p.netAmount, 0);

        return {
          sl: idx + 1,
          staffId: st.staffId,
          name: st.name,
          designation: st.designation,
          department: st.department,
          mobileNumber: st.mobileNumber,
          branch: st.branch,
          joiningDate: st.joiningDate,
          monthlySalary: st.monthlySalary,
          totalPaidToDate,
          currentMonthStatus: paidThisMonth ? 'Paid / পরিশোধিত' : 'Pending / বাকি',
          status: st.status === 'active' ? 'Active / কর্মরত' : 'Inactive',
        };
      }),

      // Sheet 8: Staff Salary Vouchers
      staffSalaryVouchers: sourceStaffVouchers.map((sv, idx) => ({
        sl: idx + 1,
        voucherNo: sv.voucherNo,
        staffId: sv.staffId,
        staffName: sv.staffName,
        designation: sv.designation,
        department: sv.department,
        month: sv.month,
        date: sv.date,
        time: sv.time,
        basicSalary: sv.basicSalary,
        bonus: sv.bonus,
        deduction: sv.deduction,
        netAmount: sv.netAmount,
        method: sv.method === 'cash' ? 'Cash / নগদ' : sv.method,
        transactionId: sv.transactionId,
        disbursedBy: sv.disbursedBy,
        note: sv.note,
      })),

      // Sheet 9: Expenses
      expenses: sourceExpenses.map((e, idx) => ({
        sl: idx + 1,
        voucherNo: e.voucherNo,
        category: categoryLabelMap[e.category] || e.category,
        title: e.title,
        date: e.date,
        amount: e.amount,
        paymentMethod: e.paymentMethod === 'cash' ? 'Cash / নগদ' : e.paymentMethod,
        recordedBy: e.recordedBy,
        branch: e.branch,
        notes: e.notes,
      })),

      // Sheet 10: Central Master Receipts
      centralReceipts: sourceReceipts.map((r, idx) => {
        const isInflow = r.type === 'student';
        return {
          sl: idx + 1,
          receiptNo: r.receiptNo,
          type: r.type,
          typeLabel:
            r.type === 'student'
              ? 'শিক্ষার্থী ফি আদায় (Student Fee)'
              : r.type === 'teacher'
              ? 'শিক্ষক সম্মানী ভাউচার (Teacher Pay)'
              : 'স্টাফ বেতন ভাউচার (Staff Salary)',
          date: r.date,
          time: r.time,
          targetName: r.targetName,
          targetId: r.studentId || r.targetId || '-',
          contactNumber: r.contactNumber || 'N/A',
          particulars: r.programme || 'Campus Transaction',
          inflowAmount: isInflow ? r.amountPaid : 0,
          outflowAmount: !isInflow ? r.amountPaid : 0,
          paymentMethod: r.paymentMethod,
          receiverName: r.receiverName,
          branch: r.branch,
        };
      }),

      // Sheet 11: Expense Categories
      expenseCategories,
    };
  };

  // EXPORT 1: Selected Month Master Excel (.xlsx)
  const handleExportSelectedMonthExcel = async () => {
    try {
      setIsExporting('monthly');
      const reportData = buildReportPayload(false);
      await generateMasterExcelWorkbook(
        `Atomic_Inside_Master_Monthly_Report_${selectedYear}_${String(selectedMonth + 1).padStart(2, '0')}_${selectedBranch}`,
        reportData
      );
      showToast('success', 'এক্সেল রিপোর্ট প্রস্তুত', `${monthLabel}-এর ১১টি শিট সম্বলিত মাস্টার এক্সেল ফাইল ডাউনলোড হয়েছে।`);
    } catch (err) {
      console.error('Excel generation error:', err);
      showToast('error', 'এক্সেল তৈরি ব্যর্থ', 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsExporting(null);
    }
  };

  // EXPORT 2: Complete All-Time A-Z ERP Master Workbook (.xlsx)
  const handleExportAllTimeExcel = async () => {
    try {
      setIsExporting('all-time');
      const reportData = buildReportPayload(true);
      await generateMasterExcelWorkbook(
        `Atomic_Inside_ALL_TIME_Master_ERP_Ledger_${selectedBranch}_${new Date().toISOString().split('T')[0]}`,
        reportData
      );
      showToast('success', 'অল-টাইম মাস্টার ব্যাকআপ প্রস্তুত', 'সর্বকালীন পূর্ণাঙ্গ ERP এক্সেল ফাইল সফলভাবে ডাউনলোড হয়েছে।');
    } catch (err) {
      console.error('All-time Excel error:', err);
      showToast('error', 'এক্সেল তৈরি ব্যর্থ', 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsExporting(null);
    }
  };

  // EXPORT 3: Comprehensive Multi-Section CSV Backup
  const handleExportMasterCSV = () => {
    try {
      setIsExporting('csv');
      const reportData = buildReportPayload(false);

      exportMultiSectionExcel(
        `Atomic_Inside_Master_Monthly_Report_${selectedYear}_${String(selectedMonth + 1).padStart(2, '0')}_${selectedBranch}`,
        {
          institution: reportData.institution,
          reportTitle: reportData.reportTitle,
          branch: reportData.branch,
          monthYear: reportData.monthYear,
          generatedAt: reportData.generatedAt,
          generatedBy: reportData.generatedBy,
        },
        [
        {
          title: 'Executive Financial Summary (Net Earnings & Net Expenses)',
          data: reportData.summaryRows.map((r) => ({
            'SL': r.sl,
            'Financial Category': r.metric,
            'Description': r.details,
            'Amount / Value': typeof r.amount === 'number' ? `BDT ${r.amount}` : r.amount,
            'Impact': r.impact,
          })),
          headers: ['SL', 'Financial Category', 'Description', 'Amount / Value', 'Impact'],
          summaryRow: {
            'SL': 'NET P&L',
            'Financial Category': '🌟 নিট ক্যাশ উদ্বৃত্ত / লাভ (NET PROFIT)',
            'Description': `Net Earnings: BDT ${reportData.kpis.totalStudentIncome} | Net Expenses: BDT ${reportData.kpis.totalCombinedOutflow}`,
            'Amount / Value': `BDT ${reportData.kpis.netCashFlow}`,
            'Impact': reportData.kpis.netCashFlow >= 0 ? 'Surplus (+)' : 'Deficit (-)',
          },
        },
        {
          title: 'Master Student Directory & Dues Ledger',
          data: reportData.allStudents.map((s) => ({
            'SL': s.sl,
            'Student ID': s.studentId,
            'Student Name': s.name,
            'Mobile': s.mobileNumber,
            'Course': s.programme,
            'Batch': s.batchTime,
            'Total Fee (BDT)': s.totalFee,
            'Total Paid (BDT)': s.paidAmount,
            'Outstanding Due (BDT)': s.dueAmount,
            'Status': s.status,
            'Last Payment': s.lastPaymentDate,
          })),
          headers: ['SL', 'Student ID', 'Student Name', 'Mobile', 'Course', 'Batch', 'Total Fee (BDT)', 'Total Paid (BDT)', 'Outstanding Due (BDT)', 'Status', 'Last Payment'],
          summaryRow: {
            'SL': 'TOTAL',
            'Student Name': `${reportData.allStudents.length} Students`,
            'Total Fee (BDT)': reportData.allStudents.reduce((a, b) => a + b.totalFee, 0),
            'Total Paid (BDT)': reportData.allStudents.reduce((a, b) => a + b.paidAmount, 0),
            'Outstanding Due (BDT)': reportData.allStudents.reduce((a, b) => a + b.dueAmount, 0),
          },
        },
        {
          title: 'Student Fee Collections Register (Income)',
          data: reportData.students.map((s) => ({
            'SL': s.sl,
            'Receipt No': s.receiptNo,
            'Student ID': s.studentId,
            'Student Name': s.studentName,
            'Course': s.programme,
            'Mobile': s.mobileNumber,
            'Date': s.paymentDate,
            'Time': s.paymentTime,
            'Method': s.method,
            'Amount (BDT)': s.amount,
            'Received By': s.receivedBy,
            'Remarks': s.note || '',
          })),
          headers: ['SL', 'Receipt No', 'Student ID', 'Student Name', 'Course', 'Mobile', 'Date', 'Time', 'Method', 'Amount (BDT)', 'Received By', 'Remarks'],
          summaryRow: {
            'SL': 'TOTAL',
            'Receipt No': `${reportData.students.length} Receipts`,
            'Amount (BDT)': reportData.kpis.totalStudentIncome,
          },
        },
        {
          title: 'Teacher Honorarium Disbursements (Outflow)',
          data: reportData.teacherPayouts.map((p) => ({
            'SL': p.sl,
            'Voucher No': p.receiptNo,
            'Teacher Name': p.teacherName,
            'Subject': p.subject,
            'Date': p.paymentDate,
            'Time': p.paymentTime,
            'Method': p.method,
            'Amount Paid (BDT)': p.amount,
            'Disbursed By': p.disbursedBy,
            'Remarks': p.note || '',
          })),
          headers: ['SL', 'Voucher No', 'Teacher Name', 'Subject', 'Date', 'Time', 'Method', 'Amount Paid (BDT)', 'Disbursed By', 'Remarks'],
          summaryRow: {
            'SL': 'TOTAL',
            'Teacher Name': `${reportData.teacherPayouts.length} Payouts`,
            'Amount Paid (BDT)': reportData.kpis.totalTeacherPaid,
          },
        },
        {
          title: 'Staff Salary Disbursements (Payroll Outflow)',
          data: reportData.staffSalaryVouchers.map((sv) => ({
            'SL': sv.sl,
            'Voucher No': sv.voucherNo,
            'Staff ID': sv.staffId,
            'Staff Name': sv.staffName,
            'Designation': sv.designation,
            'Salary Month': sv.month,
            'Date': sv.date,
            'Basic (BDT)': sv.basicSalary,
            'Bonus (BDT)': sv.bonus,
            'Deduction (BDT)': sv.deduction,
            'Net Paid (BDT)': sv.netAmount,
            'Method': sv.method,
            'Disbursed By': sv.disbursedBy,
          })),
          headers: ['SL', 'Voucher No', 'Staff ID', 'Staff Name', 'Designation', 'Salary Month', 'Date', 'Basic (BDT)', 'Bonus (BDT)', 'Deduction (BDT)', 'Net Paid (BDT)', 'Method', 'Disbursed By'],
          summaryRow: {
            'SL': 'TOTAL',
            'Staff Name': `${reportData.staffSalaryVouchers.length} Vouchers`,
            'Net Paid (BDT)': reportData.kpis.totalStaffPaid,
          },
        },
        {
          title: 'Institutional Overhead Expenses Ledger',
          data: reportData.expenses.map((e) => ({
            'SL': e.sl,
            'Voucher No': e.voucherNo,
            'Category': e.category,
            'Description': e.title,
            'Date': e.date,
            'Payment Method': e.paymentMethod,
            'Amount (BDT)': e.amount,
            'Approved By': e.recordedBy,
            'Notes': e.notes || '',
          })),
          headers: ['SL', 'Voucher No', 'Category', 'Description', 'Date', 'Payment Method', 'Amount (BDT)', 'Approved By', 'Notes'],
          summaryRow: {
            'SL': 'TOTAL',
            'Description': `${reportData.expenses.length} Records`,
            'Amount (BDT)': reportData.kpis.totalOverheadExpenses,
          },
        },
      ]
    );
    showToast('success', 'সিএসভি ফাইল প্রস্তুত', 'মাল্টি-সেকশন সিএসভি ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে।');
  } catch (err) {
    console.error('CSV export error:', err);
    showToast('error', 'সিএসভি এক্সপোর্ট ব্যর্থ', 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
  } finally {
    setIsExporting(null);
  }
};

  // Quick single-section CSV handlers
  const handleExportStudentsOnly = () => {
    const data = monthlyStudentPayments.map((p, idx) => ({
      'SL': idx + 1,
      'Receipt No': p.receiptNo,
      'Student ID': p.studentId || '-',
      'Student Name': p.studentName,
      'Course': p.programme,
      'Mobile Contact': p.mobileNumber,
      'Payment Date': p.paymentDate,
      'Amount (BDT)': p.amount,
      'Method': p.method === 'cash' ? 'Cash' : p.method,
      'Received By': p.receivedBy,
    }));
    exportToCSV(`Monthly_Students_Collections_${monthPrefix}_${selectedBranch}`, data);
  };

  const handleExportClassesOnly = () => {
    const data = monthlyClassLogs.map((c, idx) => ({
      'SL': idx + 1,
      'Date': c.date,
      'Teacher Name': c.teacherName,
      'Subject': c.subject,
      'Batch': c.batchName,
      'Duration (Hours)': c.durationHours,
      'Rate (BDT)': c.rateApplied,
      'Topic Covered': c.topic,
      'Student Attendance': c.studentAttendanceCount,
    }));
    exportToCSV(`Monthly_Classes_Log_${monthPrefix}_${selectedBranch}`, data);
  };

  const handleExportStaffSalaryOnly = () => {
    const data = monthlyStaffPayments.map((s, idx) => ({
      'SL': idx + 1,
      'Voucher No': s.voucherNo,
      'Staff ID': s.staffId,
      'Staff Name': s.staffName,
      'Designation': s.designation,
      'Month': s.month,
      'Payment Date': s.date,
      'Basic Salary': s.basicSalary,
      'Bonus': s.bonus,
      'Deductions': s.deduction,
      'Net Paid (BDT)': s.netAmount,
      'Method': s.method,
      'Disbursed By': s.disbursedBy,
    }));
    exportToCSV(`Monthly_Staff_Salary_${monthPrefix}_${selectedBranch}`, data);
  };

  const handleExportExpensesOnly = () => {
    const data = monthlyExpenses.map((e, idx) => ({
      'SL': idx + 1,
      'Voucher No': e.voucherNo,
      'Category': categoryLabelMap[e.category] || e.category,
      'Expense Title': e.title,
      'Date': e.date,
      'Amount (BDT)': e.amount,
      'Payment Method': e.paymentMethod === 'cash' ? 'Cash' : e.paymentMethod,
      'Recorded By': e.recordedBy,
    }));
    exportToCSV(`Monthly_Expenses_${monthPrefix}_${selectedBranch}`, data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#fdfbf7] rounded-3xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#501117] via-[#6d1a22] to-[#8d242e] text-[#fcf7ee] p-4 sm:p-5 flex items-center justify-between border-b border-[#430b10]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#faf4ea] text-[#6d1a22] flex items-center justify-center shadow-md shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-serif text-white tracking-tight">
                  মাস্টার অডিট ও সার্বিক এক্সেল রিপোর্ট সিস্টেম
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#fde4cb] text-[#6d1a22] font-black uppercase tracking-wider">
                  ERP A-Z Master Workbooks
                </span>
              </div>
              <p className="text-xs text-[#f9d5bb] font-bangla mt-0.5">
                Atomic Inside Coaching Care • নারায়ণগঞ্জ ক্যাম্পাস • ছাত্র ফি, শিক্ষক সম্মানী, ক্লাস কাউন্টিং, স্টাফ বেতন ও ভাউচার, কেন্দ্রীয় রসিদ খতিয়ান
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Month Selector Bar & Action Downloads */}
        <div className="bg-[#f7efe3] border-b border-[#e2d0ba] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#6d1a22]" />
            <span className="text-xs sm:text-sm font-bold text-[#501117]">হিসাবকাল ও অডিট মাস:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white border border-[#d9c7b4] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-[#450e13] focus:outline-hidden focus:ring-2 focus:ring-[#6d1a22] cursor-pointer shadow-2xs"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx}>
                  {name} ({BENGALI_MONTHS[idx]})
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-[#d9c7b4] rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-[#450e13] focus:outline-hidden focus:ring-2 focus:ring-[#6d1a22] cursor-pointer shadow-2xs"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} সাল
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSelectedYear(currentDate.getFullYear());
                setSelectedMonth(currentDate.getMonth());
              }}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-[#faf4ea] text-[#6d1a22] border border-[#d9c7b4] cursor-pointer transition-colors hidden md:inline-block"
            >
              চলতি মাস
            </button>
          </div>

          {/* Master Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Selected Month Master Excel */}
            <button
              onClick={handleExportSelectedMonthExcel}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#107c41] hover:bg-[#0b5c30] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="১১টি পূর্ণাঙ্গ শিটসহ নির্বাচিত মাসের মাস্টার এক্সেল (.xlsx) ডাউনলোড করুন"
            >
              <FileSpreadsheet size={16} />
              <span>{isExporting === 'monthly' ? 'প্রস্তুত হচ্ছে...' : 'মাসের এক্সেল (.xlsx)'}</span>
            </button>

            {/* All-Time Complete ERP Master Excel */}
            <button
              onClick={handleExportAllTimeExcel}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="সম্পূর্ণ ইআরপির সর্বকালীন ১১টি শিটের এ-টু-জেড মাস্টার ব্যাকআপ ডাউনলোড করুন"
            >
              <Layers size={16} />
              <span>{isExporting === 'all-time' ? 'প্রস্তুত হচ্ছে...' : 'অল-টাইম মাস্টার (.xlsx)'}</span>
            </button>

            {/* CSV Backup */}
            <button
              onClick={handleExportMasterCSV}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6d1a22] hover:bg-[#501117] text-[#fcf7ee] font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="সার্বজনীন মাল্টি-সেকশন সিএসভি ডাটা ফাইল ডাউনলোড (.csv)"
            >
              <Download size={14} />
              <span>{isExporting === 'csv' ? 'প্রস্তুত হচ্ছে...' : 'সিএসভি (.csv)'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Period & Quick Export Bar */}
          <div className="bg-[#fcf7ee] border border-[#d9c7b4] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[11px] font-bold text-[#6d1a22] uppercase tracking-wider block">
                নির্বাচিত হিসাবকাল ও প্রাতিষ্ঠানিক অডিট বিবরণী (Accounting Audit)
              </span>
              <h3 className="text-lg font-black text-[#501117] font-serif">
                {monthLabel}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                ক্যাম্পাস: <strong>{selectedBranch} শাখা</strong> • পরিচালনা পরিষদ: ১. প্রতিষ্ঠাতা- অনির্বাণ ঘোষ • ২. আইসিটি প্রধান- শ্রাবণ নন্দী • ৩. ব্যবস্থাপক- অঙ্কন সাহা
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportStudentsOnly}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-[#faf4ea] border border-[#d9c7b4] text-[#6d1a22] flex items-center gap-1 cursor-pointer transition-colors"
                title="ছাত্র ফি আদায়ের শিট ডাউনলোড"
              >
                <Download size={12} />
                <span>ছাত্র ফি (.csv)</span>
              </button>
              <button
                onClick={handleExportClassesOnly}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-[#faf4ea] border border-[#d9c7b4] text-[#6d1a22] flex items-center gap-1 cursor-pointer transition-colors"
                title="ক্লাস কাউন্টিং শিট ডাউনলোড"
              >
                <Download size={12} />
                <span>ক্লাস লগ (.csv)</span>
              </button>
              <button
                onClick={handleExportStaffSalaryOnly}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-[#faf4ea] border border-[#d9c7b4] text-[#6d1a22] flex items-center gap-1 cursor-pointer transition-colors"
                title="স্টাফ বেতন ভাউচার শিট ডাউনলোড"
              >
                <Download size={12} />
                <span>স্টাফ বেতন (.csv)</span>
              </button>
              <button
                onClick={handleExportExpensesOnly}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white hover:bg-[#faf4ea] border border-[#d9c7b4] text-[#6d1a22] flex items-center gap-1 cursor-pointer transition-colors"
                title="প্রাতিষ্ঠানিক অফিস খরচ শিট ডাউনলোড"
              >
                <Download size={12} />
                <span>খরচ শিট (.csv)</span>
              </button>
            </div>
          </div>

          {/* 5 Primary Executive Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Monthly Total Student Collections (Net Earnings) */}
            <div className="p-4 rounded-2xl bg-[#f0fdf4] border-2 border-[#15803d] shadow-xs">
              <div className="flex items-center justify-between text-[#15803d] mb-1">
                <span className="text-[10.5px] font-black uppercase tracking-wider">💰 সর্বমোট নেট আয়</span>
                <TrendingUp size={16} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#15803d] font-mono tabular-nums">
                ৳{totalMonthlyStudentIncome.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-[#166534] mt-1">
                Net Earnings ({monthlyStudentPayments.length} টি রসিদ)
              </div>
            </div>

            {/* 2. Monthly Outflow (Net Expenses) */}
            <div className="p-4 rounded-2xl bg-[#fff1f2] border-2 border-[#be123c] shadow-xs">
              <div className="flex items-center justify-between text-[#be123c] mb-1">
                <span className="text-[10.5px] font-black uppercase tracking-wider">💸 সর্বমোট নেট ব্যয়</span>
                <TrendingDown size={16} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#be123c] font-mono tabular-nums">
                ৳{totalMonthlyOutflow.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-[#9f1239] mt-1">
                Net Expenses (সম্মানী + বেতন + অফিস)
              </div>
            </div>

            {/* 3. Net Available Cash / Profit */}
            <div className={`p-4 rounded-2xl border-2 ${monthlyNetCashFlow >= 0 ? 'bg-[#ecfdf5] border-[#059669]' : 'bg-[#fef2f2] border-rose-500'} shadow-xs`}>
              <div className="flex items-center justify-between text-[#501117] mb-1">
                <span className="text-[10.5px] font-black uppercase tracking-wider">⚖️ নিট ক্যাশ উদ্বৃত্ত</span>
                <Wallet size={16} className={monthlyNetCashFlow >= 0 ? 'text-[#059669]' : 'text-rose-600'} />
              </div>
              <div className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${monthlyNetCashFlow >= 0 ? 'text-[#059669]' : 'text-rose-600'}`}>
                ৳{monthlyNetCashFlow.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-gray-700 mt-1">
                {monthlyNetCashFlow >= 0 ? '✓ Net Profit (উদ্বৃত্ত ফান্ড)' : '⚠️ Net Deficit (ঘাটতি)'}
              </div>
            </div>

            {/* 4. Student Dues */}
            <div className="p-4 rounded-2xl bg-[#eff6ff] border-2 border-[#3b82f6] shadow-xs">
              <div className="flex items-center justify-between text-[#1d4ed8] mb-1">
                <span className="text-[10.5px] font-black uppercase tracking-wider">🎓 বকেয়া শিক্ষার্থী ফি</span>
                <AlertCircle size={16} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#1d4ed8] font-mono tabular-nums">
                ৳{branchStudents.reduce((a, b) => a + b.dueAmount, 0).toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-[#1e40af] mt-1">
                Student Dues Receivable
              </div>
            </div>

            {/* 5. Teacher Dues */}
            <div className="p-4 rounded-2xl bg-[#fffbeb] border-2 border-[#f59e0b] shadow-xs">
              <div className="flex items-center justify-between text-[#b45309] mb-1">
                <span className="text-[10.5px] font-black uppercase tracking-wider">👨‍🏫 বকেয়া শিক্ষক সম্মানী</span>
                <Clock size={16} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#b45309] font-mono tabular-nums">
                ৳{branchTeachers.reduce((a, b) => a + b.pendingPayable, 0).toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-[#92400e] mt-1">
                Faculty Dues Payable
              </div>
            </div>
          </div>

          {/* Detailed Preview Section Tabs */}
          <div className="bg-white rounded-2xl border border-[#d9c7b4] p-4 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[#ede0d2] pb-3 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActivePreviewTab('summary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activePreviewTab === 'summary'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-xs'
                    : 'bg-[#faf4ea] text-gray-700 hover:bg-[#f3e7d5]'
                }`}
              >
                সারসংক্ষেপ (Executive Summary)
              </button>
              <button
                onClick={() => setActivePreviewTab('student-roster')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activePreviewTab === 'student-roster'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-xs'
                    : 'bg-[#faf4ea] text-gray-700 hover:bg-[#f3e7d5]'
                }`}
              >
                শিক্ষার্থী খতিয়ান ও বকেয়া ({branchStudents.length})
              </button>
              <button
                onClick={() => setActivePreviewTab('students')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activePreviewTab === 'students'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-xs'
                    : 'bg-[#faf4ea] text-gray-700 hover:bg-[#f3e7d5]'
                }`}
              >
                মাসিক ফি আদায় ({monthlyStudentPayments.length})
              </button>
              <button
                onClick={() => setActivePreviewTab('classes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activePreviewTab === 'classes'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-xs'
                    : 'bg-[#faf4ea] text-gray-700 hover:bg-[#f3e7d5]'
                }`}
              >
                ক্লাস কাউন্টিং ({monthlyClassLogs.length})
              </button>
              <button
                onClick={() => setActivePreviewTab('teachers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activePreviewTab === 'teachers'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-xs'
                    : 'bg-[#faf4ea] text-gray-700 hover:bg-[#f3e7d5]'
                }`}
              >
                শিক্ষক সম্মানী ({monthlyTeacherPayouts.length})
              </button>
              <button
                onClick={() => setActivePreviewTab('staff')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activePreviewTab === 'staff'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-xs'
                    : 'bg-[#faf4ea] text-gray-700 hover:bg-[#f3e7d5]'
                }`}
              >
                স্টাফ বেতন ({monthlyStaffPayments.length})
              </button>
              <button
                onClick={() => setActivePreviewTab('expenses')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activePreviewTab === 'expenses'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-xs'
                    : 'bg-[#faf4ea] text-gray-700 hover:bg-[#f3e7d5]'
                }`}
              >
                অফিস খরচ ({monthlyNonSalaryExpenses.length})
              </button>
              <button
                onClick={() => setActivePreviewTab('receipts')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activePreviewTab === 'receipts'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-xs'
                    : 'bg-[#faf4ea] text-gray-700 hover:bg-[#f3e7d5]'
                }`}
              >
                রসিদ খতিয়ান ({monthlyReceipts.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-3">
              {/* Tab 1: Summary Table */}
              {activePreviewTab === 'summary' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#faf4ea] text-[#6d1a22] font-black uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 rounded-l-lg">আর্থিক খাত ও বিবরণ (Metric Category)</th>
                        <th className="py-2.5 px-3">খতিয়ান বিবরণ / ব্যাখ্যা</th>
                        <th className="py-2.5 px-3 text-right rounded-r-lg">হিসাব পরিমাণ (BDT ৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ede0d2]">
                      {/* Section 1: Inflow */}
                      <tr className="bg-[#f0fdf4] font-black text-[#15803d]">
                        <td colSpan={3} className="py-2 px-3 text-[11px] uppercase tracking-wider">
                          📥 আয়ের খাত ও নেট আয় (Revenue & Net Earnings)
                        </td>
                      </tr>
                      <tr className="hover:bg-[#faf4ea]/50">
                        <td className="py-2 px-3 font-semibold text-gray-900">শিক্ষার্থী কোর্স ফি আদায় (Student Fees Inflow)</td>
                        <td className="py-2 px-3 text-gray-600">{monthlyStudentPayments.length} টি মানি রসিদ কিস্তি আদায়</td>
                        <td className="py-2 px-3 text-right font-black text-[#15803d]">৳{totalMonthlyStudentIncome.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-[#dcfce7] font-black text-[#065F46] border-y border-[#86efac]">
                        <td className="py-2 px-3">💰 সর্বমোট নেট আয় (TOTAL NET EARNINGS)</td>
                        <td className="py-2 px-3 text-xs">কোর্স ও ভর্তি ফি বাবদ মোট সংগৃহীত অর্থ (+)</td>
                        <td className="py-2 px-3 text-right text-sm text-[#047857]">৳{totalMonthlyStudentIncome.toLocaleString()}</td>
                      </tr>

                      {/* Section 2: Outflow */}
                      <tr className="bg-[#fff1f2] font-black text-[#be123c]">
                        <td colSpan={3} className="py-2 px-3 text-[11px] uppercase tracking-wider">
                          📤 ব্যয়ের খাত ও নেট ব্যয় (Expenditure & Net Expenses)
                        </td>
                      </tr>
                      <tr className="hover:bg-[#faf4ea]/50">
                        <td className="py-2 px-3 font-semibold text-gray-900">শিক্ষক সম্মানী প্রদান (Teacher Honorarium)</td>
                        <td className="py-2 px-3 text-gray-600">{monthlyTeacherPayouts.length} টি পেমেন্ট ভাউচার প্রদান</td>
                        <td className="py-2 px-3 text-right font-black text-[#be123c]">৳{totalMonthlyTeacherPaid.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-[#faf4ea]/50">
                        <td className="py-2 px-3 font-semibold text-gray-900">কর্মকর্তা/স্টাফ বেতন (Staff Salaries Paid)</td>
                        <td className="py-2 px-3 text-gray-600">{monthlyStaffPayments.length} টি বেতন ভাউচার পরিশোধ</td>
                        <td className="py-2 px-3 text-right font-black text-[#7c3aed]">৳{totalMonthlyStaffPaid.toLocaleString()}</td>
                      </tr>
                      <tr className="hover:bg-[#faf4ea]/50">
                        <td className="py-2 px-3 font-semibold text-gray-900">অফিস ও পরিচালন ব্যয় (Overhead Expenses)</td>
                        <td className="py-2 px-3 text-gray-600">{monthlyNonSalaryExpenses.length} টি ব্যয় রেকর্ড (ভাড়া, বিদ্যুৎ, শিট ইত্যাদি)</td>
                        <td className="py-2 px-3 text-right font-black text-[#ea580c]">৳{totalMonthlyNonSalaryExpenses.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-[#ffe4e6] font-black text-[#881337] border-y border-[#fda4af]">
                        <td className="py-2 px-3">💸 সর্বমোট নেট ব্যয় (TOTAL NET EXPENSES)</td>
                        <td className="py-2 px-3 text-xs">সম্মানী + বেতন + অফিস পরিচালন ব্যয় (-)</td>
                        <td className="py-2 px-3 text-right text-sm text-[#be123c]">৳{totalMonthlyOutflow.toLocaleString()}</td>
                      </tr>

                      {/* Section 3: Net Profit */}
                      <tr className={`font-black ${monthlyNetCashFlow >= 0 ? 'bg-[#fef3c7] text-[#521218]' : 'bg-[#fee2e2] text-rose-800'}`}>
                        <td className="py-2.5 px-3 text-sm">🌟 নিট ক্যাশ উদ্বৃত্ত / লাভ (NET PROFIT)</td>
                        <td className="py-2.5 px-3 text-xs">
                          {monthlyNetCashFlow >= 0 ? 'উদ্বৃত্ত ফান্ড স্থিতি (Net Surplus Cash)' : 'ঘাটতি স্থিতি (Net Cash Deficit)'}
                        </td>
                        <td className={`py-2.5 px-3 text-right text-base ${monthlyNetCashFlow >= 0 ? 'text-[#047857]' : 'text-rose-600'}`}>
                          ৳{monthlyNetCashFlow.toLocaleString()}
                        </td>
                      </tr>

                      {/* Section 4: Accruals */}
                      <tr className="hover:bg-[#faf4ea]/50">
                        <td className="py-2 px-3 font-bold text-[#501117]">মোট শিক্ষার্থী বকেয়া পাওনা (Student Dues)</td>
                        <td className="py-2 px-3 text-gray-600">ক্যাম্পাসে শিক্ষার্থীদের সর্বমোট বাকি ফি</td>
                        <td className="py-2 px-3 text-right font-black text-[#be123c]">
                          ৳{branchStudents.reduce((a, b) => a + b.dueAmount, 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="hover:bg-[#faf4ea]/50">
                        <td className="py-2 px-3 font-bold text-[#501117]">মোট শিক্ষক বকেয়া সম্মানী (Faculty Dues)</td>
                        <td className="py-2 px-3 text-gray-600">শিক্ষকদের বকেয়া সম্মানী প্রদেয় দায়</td>
                        <td className="py-2 px-3 text-right font-black text-[#b45309]">
                          ৳{branchTeachers.reduce((a, b) => a + b.pendingPayable, 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="hover:bg-[#faf4ea]/50">
                        <td className="py-2 px-3 font-bold text-[#501117]">সম্পন্ন ক্লাসের সংখ্যা ও সময়</td>
                        <td className="py-2 px-3 text-gray-600">শিক্ষকদের পরিচালিত মোট ক্লাস ও সময়</td>
                        <td className="py-2 px-3 text-right font-black text-[#501117]">{totalMonthlyClasses} টি ({totalMonthlyClassHours} ঘণ্টা)</td>
                      </tr>
                      <tr className="hover:bg-[#faf4ea]/50">
                        <td className="py-2 px-3 font-bold text-[#501117]">ক্লাস প্রতি অর্জিত মোট সম্মানী ভ্যালু</td>
                        <td className="py-2 px-3 text-gray-600">ক্লাস সংখ্যা অনুযায়ী অর্জিত মোট পাওনা</td>
                        <td className="py-2 px-3 text-right font-black text-[#501117]">৳{totalMonthlyHonorariumGenerated.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Master Student Directory & Dues */}
              {activePreviewTab === 'student-roster' && (
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#faf4ea] text-[#6d1a22] font-black uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="py-2 px-2.5">শিক্ষার্থী আইডি</th>
                        <th className="py-2 px-2.5">নাম (Name)</th>
                        <th className="py-2 px-2.5">কোর্স (Course)</th>
                        <th className="py-2 px-2.5">মোবাইল নং</th>
                        <th className="py-2 px-2.5 text-right">মোট ফি</th>
                        <th className="py-2 px-2.5 text-right">জমা ফি</th>
                        <th className="py-2 px-2.5 text-right">বকেয়া ফি</th>
                        <th className="py-2 px-2.5 text-center">অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ede0d2]">
                      {branchStudents.map((s, idx) => (
                        <tr key={idx} className="hover:bg-[#faf4ea]/50">
                          <td className="py-1.5 px-2.5 font-mono font-bold text-[#6d1a22]">{s.studentId}</td>
                          <td className="py-1.5 px-2.5 font-bold text-gray-900">{s.name}</td>
                          <td className="py-1.5 px-2.5 text-gray-700">{s.programme}</td>
                          <td className="py-1.5 px-2.5 text-gray-600">{s.mobileNumber}</td>
                          <td className="py-1.5 px-2.5 text-right font-medium">৳{s.totalFee.toLocaleString()}</td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-[#15803d]">৳{s.paidAmount.toLocaleString()}</td>
                          <td className={`py-1.5 px-2.5 text-right font-black ${s.dueAmount > 0 ? 'text-[#be123c]' : 'text-gray-400'}`}>
                            ৳{s.dueAmount.toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2.5 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                s.dueAmount === 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.paidAmount > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.dueAmount === 0 ? 'পরিশোধিত' : 'বকেয়া'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Monthly Student Fee Payments */}
              {activePreviewTab === 'students' && (
                <div>
                  {monthlyStudentPayments.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 font-medium">এই হিসাবকালে কোনো শিক্ষার্থীর ফি জমা দেওয়ার এন্ট্রি নেই।</p>
                  ) : (
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#faf4ea] text-[#6d1a22] font-black uppercase text-[10px] sticky top-0">
                          <tr>
                            <th className="py-2 px-2.5">রসিদ নং</th>
                            <th className="py-2 px-2.5">শিক্ষার্থীর নাম</th>
                            <th className="py-2 px-2.5">কোর্স</th>
                            <th className="py-2 px-2.5">তারিখ</th>
                            <th className="py-2 px-2.5">পদ্ধতি</th>
                            <th className="py-2 px-2.5 text-right">আদায়ের পরিমাণ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ede0d2]">
                          {monthlyStudentPayments.map((p, idx) => (
                            <tr key={idx} className="hover:bg-[#faf4ea]/50">
                              <td className="py-1.5 px-2.5 font-mono font-bold text-[#6d1a22]">{p.receiptNo}</td>
                              <td className="py-1.5 px-2.5 font-bold text-gray-900">{p.studentName}</td>
                              <td className="py-1.5 px-2.5 text-gray-700 font-medium">{p.programme}</td>
                              <td className="py-1.5 px-2.5 text-gray-500">{p.paymentDate}</td>
                              <td className="py-1.5 px-2.5 uppercase text-[10px] font-bold text-gray-700">
                                {p.method === 'cash' ? 'নগদ' : p.method}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-black text-[#15803d]">৳{p.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Class Logs */}
              {activePreviewTab === 'classes' && (
                <div>
                  {monthlyClassLogs.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 font-medium">এই হিসাবকালে শিক্ষকদের কোনো সম্পন্ন ক্লাস লগ রেকর্ড নেই।</p>
                  ) : (
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#faf4ea] text-[#6d1a22] font-black uppercase text-[10px] sticky top-0">
                          <tr>
                            <th className="py-2 px-2.5">তারিখ</th>
                            <th className="py-2 px-2.5">শিক্ষকের নাম</th>
                            <th className="py-2 px-2.5">বিষয়</th>
                            <th className="py-2 px-2.5">টপিক / অধ্যায়</th>
                            <th className="py-2 px-2.5">সময়কাল</th>
                            <th className="py-2 px-2.5 text-right">সম্মানী রেট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ede0d2]">
                          {monthlyClassLogs.map((c, idx) => (
                            <tr key={idx} className="hover:bg-[#faf4ea]/50">
                              <td className="py-1.5 px-2.5 text-gray-600">{c.date}</td>
                              <td className="py-1.5 px-2.5 font-bold text-gray-900">{c.teacherName}</td>
                              <td className="py-1.5 px-2.5 text-gray-700 font-medium">{c.subject}</td>
                              <td className="py-1.5 px-2.5 text-gray-500">{c.topic}</td>
                              <td className="py-1.5 px-2.5 text-gray-700">{c.durationHours} ঘণ্টা</td>
                              <td className="py-1.5 px-2.5 text-right font-bold text-[#501117]">৳{c.rateApplied.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Teacher Payouts */}
              {activePreviewTab === 'teachers' && (
                <div>
                  {monthlyTeacherPayouts.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 font-medium">এই হিসাবকালে শিক্ষকদের কোনো সম্মানী পরিশোধের রেকর্ড নেই।</p>
                  ) : (
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#faf4ea] text-[#6d1a22] font-black uppercase text-[10px] sticky top-0">
                          <tr>
                            <th className="py-2 px-2.5">ভাউচার নং</th>
                            <th className="py-2 px-2.5">শিক্ষকের নাম</th>
                            <th className="py-2 px-2.5">বিষয়</th>
                            <th className="py-2 px-2.5">তারিখ</th>
                            <th className="py-2 px-2.5">মাধ্যম</th>
                            <th className="py-2 px-2.5 text-right">প্রদত্ত সম্মানী</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ede0d2]">
                          {monthlyTeacherPayouts.map((p, idx) => (
                            <tr key={idx} className="hover:bg-[#faf4ea]/50">
                              <td className="py-1.5 px-2.5 font-mono font-bold text-[#6d1a22]">{p.receiptNo}</td>
                              <td className="py-1.5 px-2.5 font-bold text-gray-900">{p.teacherName}</td>
                              <td className="py-1.5 px-2.5 text-gray-700 font-medium">{p.subject}</td>
                              <td className="py-1.5 px-2.5 text-gray-500">{p.paymentDate}</td>
                              <td className="py-1.5 px-2.5 uppercase text-[10px] font-bold text-gray-700">
                                {p.method === 'cash' ? 'নগদ' : p.method}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-black text-[#be123c]">৳{p.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 6: Staff Salary */}
              {activePreviewTab === 'staff' && (
                <div>
                  {monthlyStaffPayments.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 font-medium">এই হিসাবকালে কর্মকর্তাদের কোনো বেতন ভাউচার পরিশোধের রেকর্ড নেই।</p>
                  ) : (
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#faf4ea] text-[#6d1a22] font-black uppercase text-[10px] sticky top-0">
                          <tr>
                            <th className="py-2 px-2.5">ভাউচার নং</th>
                            <th className="py-2 px-2.5">কর্মকর্তা</th>
                            <th className="py-2 px-2.5">পদবী</th>
                            <th className="py-2 px-2.5">মাস</th>
                            <th className="py-2 px-2.5">তারিখ</th>
                            <th className="py-2 px-2.5 text-right">মূল বেতন</th>
                            <th className="py-2 px-2.5 text-right">নিট পরিশোধ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ede0d2]">
                          {monthlyStaffPayments.map((st, idx) => (
                            <tr key={idx} className="hover:bg-[#faf4ea]/50">
                              <td className="py-1.5 px-2.5 font-mono font-bold text-[#6d1a22]">{st.voucherNo}</td>
                              <td className="py-1.5 px-2.5 font-bold text-gray-900">{st.staffName}</td>
                              <td className="py-1.5 px-2.5 text-gray-700">{st.designation}</td>
                              <td className="py-1.5 px-2.5 text-gray-600">{st.month}</td>
                              <td className="py-1.5 px-2.5 text-gray-500">{st.date}</td>
                              <td className="py-1.5 px-2.5 text-right font-medium">৳{st.basicSalary.toLocaleString()}</td>
                              <td className="py-1.5 px-2.5 text-right font-black text-[#7c3aed]">৳{st.netAmount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 7: Expenses */}
              {activePreviewTab === 'expenses' && (
                <div>
                  {monthlyNonSalaryExpenses.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 font-medium">এই হিসাবকালে কোনো প্রাতিষ্ঠানিক অফিস খরচের রেকর্ড নেই।</p>
                  ) : (
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#faf4ea] text-[#6d1a22] font-black uppercase text-[10px] sticky top-0">
                          <tr>
                            <th className="py-2 px-2.5">ভাউচার নং</th>
                            <th className="py-2 px-2.5">খাত (Category)</th>
                            <th className="py-2 px-2.5">বিবরণ</th>
                            <th className="py-2 px-2.5">তারিখ</th>
                            <th className="py-2 px-2.5 text-right">খরচ (Amount ৳)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ede0d2]">
                          {monthlyNonSalaryExpenses.map((e, idx) => (
                            <tr key={idx} className="hover:bg-[#faf4ea]/50">
                              <td className="py-1.5 px-2.5 font-mono font-bold text-[#6d1a22]">{e.voucherNo}</td>
                              <td className="py-1.5 px-2.5 font-bold text-[#6d1a22]">{categoryLabelMap[e.category] || e.category}</td>
                              <td className="py-1.5 px-2.5 text-gray-900 font-medium">{e.title}</td>
                              <td className="py-1.5 px-2.5 text-gray-500">{e.date}</td>
                              <td className="py-1.5 px-2.5 text-right font-black text-[#ea580c]">৳{e.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 8: Central Receipts */}
              {activePreviewTab === 'receipts' && (
                <div>
                  {monthlyReceipts.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 font-medium">এই হিসাবকালে কেন্দ্রীয় রসিদ খতিয়ানে কোনো লেনদেন নেই।</p>
                  ) : (
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#faf4ea] text-[#6d1a22] font-black uppercase text-[10px] sticky top-0">
                          <tr>
                            <th className="py-2 px-2.5">রসিদ / ভাউচার নং</th>
                            <th className="py-2 px-2.5">ধরণ</th>
                            <th className="py-2 px-2.5">গ্রাহক / প্রাপক</th>
                            <th className="py-2 px-2.5">তারিখ</th>
                            <th className="py-2 px-2.5 text-right">টাকা (৳)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ede0d2]">
                          {monthlyReceipts.map((r, idx) => (
                            <tr key={idx} className="hover:bg-[#faf4ea]/50">
                              <td className="py-1.5 px-2.5 font-mono font-bold text-[#6d1a22]">{r.receiptNo}</td>
                              <td className="py-1.5 px-2.5 font-bold text-gray-700">
                                {r.type === 'student' ? 'ছাত্র ফি আদায় (+)' : r.type === 'teacher' ? 'শিক্ষক সম্মানী (-)' : 'স্টাফ বেতন (-)'}
                              </td>
                              <td className="py-1.5 px-2.5 text-gray-900 font-medium">{r.targetName}</td>
                              <td className="py-1.5 px-2.5 text-gray-500">{r.date}</td>
                              <td className={`py-1.5 px-2.5 text-right font-black ${r.type === 'student' ? 'text-[#15803d]' : 'text-[#be123c]'}`}>
                                {r.type === 'student' ? `+ ৳${r.amountPaid.toLocaleString()}` : `- ৳${r.amountPaid.toLocaleString()}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-[#f7efe3] border-t border-[#e2d0ba] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <Info size={15} className="text-[#6d1a22] shrink-0" />
            <span>
              এক্সেল ফাইলে ১১টি পূর্ণাঙ্গ শিট, স্বয়ংক্রিয় ফর্মুলা, অটো-ফিট কলাম ও বাংলা ইউনিকোড সাপোর্ট অন্তর্ভুক্ত রয়েছে।
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-[#d9c7b4] text-gray-700 hover:bg-[#faf4ea] cursor-pointer transition-colors"
            >
              বন্ধ করুন (Close)
            </button>
            <button
              onClick={handleExportMasterCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#6d1a22] hover:bg-[#501117] text-[#fcf7ee] shadow-xs transition-all active:scale-95 cursor-pointer"
              title="সিএসভি ফরম্যাট ডাউনলোড (.csv)"
            >
              <Download size={14} />
              <span>সিএসভি ফাইল (.csv)</span>
            </button>
            <button
              onClick={handleExportSelectedMonthExcel}
              className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-black rounded-xl bg-[#107c41] hover:bg-[#0b5c30] text-white shadow-md transition-all active:scale-95 cursor-pointer"
              title="১১টি রঙিন শিটসহ নির্বাচিত মাসের মাস্টার এক্সেল ফাইল (.xlsx) ডাউনলোড"
            >
              <FileSpreadsheet size={16} />
              <span>মাসের এক্সেল ডাউনলোড (.xlsx)</span>
            </button>
            <button
              onClick={handleExportAllTimeExcel}
              className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-black rounded-xl bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-md transition-all active:scale-95 cursor-pointer"
              title="সম্পূর্ণ ইআরপির সর্বকালীন ১১টি শিটের এ-টু-জেড মাস্টার ব্যাকআপ (.xlsx) ডাউনলোড"
            >
              <Layers size={16} />
              <span>অল-টাইম সম্পূর্ণ ERP এক্সেল (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
