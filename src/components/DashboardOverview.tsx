import React from 'react';
import { Student, Teacher, Expense, TeacherClassLog, ReceiptData, Branch, StaffMember } from '../types';
import { AtomicLogo } from './AtomicLogo';
import { exportToCSV } from '../utils/exportCsv';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  GraduationCap,
  Users,
  CalendarCheck,
  Receipt,
  ArrowUpRight,
  PlusCircle,
  Building2,
  ChevronRight,
  Download,
  RotateCcw,
  Sparkles,
  FileSpreadsheet,
  DollarSign,
  Briefcase,
} from 'lucide-react';

interface DashboardOverviewProps {
  students: Student[];
  teachers: Teacher[];
  staffList?: StaffMember[];
  expenses: Expense[];
  classLogs: TeacherClassLog[];
  receipts: ReceiptData[];
  selectedBranch: Branch;
  onNavigate: (tab: any) => void;
  onViewReceipt: (receipt: ReceiptData) => void;
  onNewStudentPayment: () => void;
  onNewTeacherPayment: () => void;
  onNewExpense: () => void;
  onNewClassLog: () => void;
  onResetAllData?: () => void;
  onOpenMonthlyReport?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  teachers,
  staffList = [],
  expenses,
  classLogs,
  receipts,
  selectedBranch,
  onNavigate,
  onViewReceipt,
  onNewStudentPayment,
  onNewTeacherPayment,
  onNewExpense,
  onNewClassLog,
  onResetAllData,
  onOpenMonthlyReport,
}) => {
  // Filter by branch (Narayanganj Campus)
  const filterByBranch = <T extends { branch: string }>(items: T[]): T[] => {
    return items.filter((item) => !item.branch || item.branch === 'Narayanganj');
  };

  const filteredStudents = filterByBranch(students);
  const filteredTeachers = filterByBranch(teachers);
  const filteredStaff = filterByBranch(staffList);
  const filteredExpenses = filterByBranch(expenses);
  const filteredClassLogs = filterByBranch(classLogs);
  const filteredReceipts = filterByBranch(receipts);

  // 1. Total Student Fee Collected
  const totalStudentCollection = filteredStudents.reduce((acc, s) => acc + s.paidAmount, 0);

  // 2. Total Student Dues Outstanding
  const totalStudentDue = filteredStudents.reduce((acc, s) => acc + s.dueAmount, 0);

  // 3. Total Teacher Honorarium Paid
  const totalTeacherPaid = filteredTeachers.reduce((acc, t) => acc + t.totalPaid, 0);

  // 4. Total Staff Salary Paid
  const totalStaffPaid = filteredStaff.reduce(
    (acc, st) => acc + (st.paymentHistory || []).reduce((sum, p) => sum + p.netAmount, 0),
    0
  );

  // 5. Total Overhead Expenses (excluding salary_staff if already logged to avoid double counting)
  const nonSalaryExpenses = filteredExpenses.filter((e) => e.category !== 'salary_staff');
  const totalOverheadExpenses = nonSalaryExpenses.reduce((acc, e) => acc + e.amount, 0);

  // 6. Total Inflow
  const totalMoneyIn = totalStudentCollection;

  // 7. Total Outflow (Expenses + Teacher Pay + Staff Pay)
  const totalMoneyOut = totalOverheadExpenses + totalTeacherPaid + totalStaffPaid;

  // 8. Net Cash In Hand
  const netCashInHand = totalMoneyIn - totalMoneyOut;

  // 9. Total Classes Conducted
  const totalClassesCount = filteredClassLogs.length;

  // Profit Margin & Outflow percentage
  const outflowRatio = totalMoneyIn > 0 ? Math.min(100, (totalMoneyOut / totalMoneyIn) * 100) : 0;
  const reserveRatio = totalMoneyIn > 0 ? Math.max(0, 100 - outflowRatio) : 100;

  const handleExportSummaryCSV = () => {
    const summaryData = [
      { Metric: 'Active Campus View', Value: selectedBranch },
      { Metric: 'Total Money In (Student Fee Collections)', Value: totalMoneyIn },
      { Metric: 'Total Overhead Expenses', Value: totalOverheadExpenses },
      { Metric: 'Total Teacher Honorarium Paid', Value: totalTeacherPaid },
      { Metric: 'Total Staff Salary Paid', Value: totalStaffPaid },
      { Metric: 'Total Combined Outflow', Value: totalMoneyOut },
      { Metric: 'Net Available Cash in Hand', Value: netCashInHand },
      { Metric: 'Student Dues Outstanding', Value: totalStudentDue },
      { Metric: 'Total Classes Conducted', Value: totalClassesCount },
      { Metric: 'Active Faculty Members', Value: filteredTeachers.length },
      { Metric: 'Total Students Registered', Value: filteredStudents.length },
      { Metric: 'Export Date', Value: new Date().toLocaleString() },
    ];
    exportToCSV(`Atomic_Inside_Executive_Summary_${selectedBranch.replace(/\s+/g, '_')}`, summaryData);
  };

  return (
    <div className="space-y-6">
      {/* Brand Hero Welcome Banner with Logo and Bengali identity */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#400a0f] via-[#5c131a] to-[#480d13] text-[#fcf7ee] p-5 sm:p-7 shadow-xl border border-[#7a1c25]/80">
        {/* Soft elegant ambient lighting glow (clean, non-intrusive, no muddy watermarks) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#f5c388]/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left: Institutional Brand Zone */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white shadow-lg border border-[#f5c388]/40 shrink-0">
              <AtomicLogo size={58} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif tracking-tight text-white leading-none">
                  Atomic Inside
                </h1>
                <span className="text-xs sm:text-sm font-semibold text-[#fde4cb] font-bangla">
                  • অ্যাটমিক শিক্ষা পরিবার
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#fbe1cc]/90 font-bangla mt-1">
                কেন্দ্রীয় প্রাতিষ্ঠানিক ও আর্থিক ব্যবস্থাপনা ইআরপি (Institutional ERP)
              </p>

              {/* Clean Unboxed Metadata Strip (Anti-slop compliant: no pill tags, clean separators) */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#f9d5bb]/85 mt-2.5 pt-2 border-t border-white/10 font-medium">
                <span className="flex items-center gap-1.5 text-white font-bold">
                  <Building2 size={13} className="text-[#f5c388]" />
                  <span>ক্যাম্পাস: {selectedBranch}</span>
                </span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1">
                  <Users size={13} className="text-[#fde4cb]" />
                  <span><strong>{filteredStudents.length}</strong> জন শিক্ষার্থী</span>
                </span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1">
                  <GraduationCap size={13} className="text-[#fde4cb]" />
                  <span><strong>{filteredTeachers.length}</strong> জন শিক্ষক</span>
                </span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1">
                  <Briefcase size={13} className="text-[#fde4cb]" />
                  <span><strong>{filteredStaff.length}</strong> জন স্টাফ</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Structured Two-Tier Command Center */}
          <div className="flex flex-col gap-2.5 shrink-0">
            {/* Tier 1: Primary Action Buttons (Cohesive Quick Action Toolbar) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onNewStudentPayment}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#faf4ea] hover:bg-white text-[#521218] font-black text-xs sm:text-sm shadow-md border border-[#f5c388] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="নতুন শিক্ষার্থী ভর্তি বা ফি আদায় রসিদ তৈরি করুন"
              >
                <PlusCircle size={16} className="text-[#6d1a22]" />
                <span>+ শিক্ষার্থী ফি</span>
              </button>

              <button
                onClick={onNewTeacherPayment}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 text-[#fcf7ee] font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="শিক্ষক ক্লাসের সম্মানী প্রদান ও ভাউচার ইস্যু"
              >
                <GraduationCap size={16} className="text-[#fde4cb]" />
                <span>+ শিক্ষক সম্মানী</span>
              </button>

              <button
                onClick={onNewClassLog}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 text-[#fcf7ee] font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="সম্পন্ন ক্লাসের তথ্য এন্ট্রি করুন"
              >
                <CalendarCheck size={16} className="text-[#fde4cb]" />
                <span>+ ক্লাস লগ</span>
              </button>

              <button
                onClick={onNewExpense}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/12 hover:bg-white/20 text-[#fcf7ee] font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="দৈনন্দিন প্রাতিষ্ঠানিক অফিস ব্যয় যুক্ত করুন"
              >
                <DollarSign size={16} className="text-[#fde4cb]" />
                <span>+ অফিস খরচ</span>
              </button>
            </div>

            {/* Tier 2: Audit Reports & Management Utilities */}
            <div className="flex flex-wrap items-center gap-2 justify-start xl:justify-end">
              {onOpenMonthlyReport && (
                <button
                  onClick={onOpenMonthlyReport}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700/90 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs border border-emerald-500/40 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  title="১১টি পূর্ণাঙ্গ শিটসহ সার্বিক প্রাতিষ্ঠানিক অডিট এক্সেল (.xlsx) রিপোর্ট"
                >
                  <FileSpreadsheet size={14} />
                  <span>মাসিক এক্সেল রিপোর্ট (.xlsx)</span>
                </button>
              )}

              <button
                onClick={handleExportSummaryCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#fde4cb] font-semibold text-xs border border-white/15 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                title="এক্সেল সামারি ডেটা (.csv) ডাউনলোড করুন"
              >
                <Download size={13} />
                <span>সামারি (.csv)</span>
              </button>

              {onResetAllData && (
                <button
                  onClick={onResetAllData}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 font-medium text-xs border border-rose-800/40 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  title="সকল রেকর্ড ও কাউন্টিং শূন্য (০) করুন"
                >
                  <RotateCcw size={12} />
                  <span>হিসাব রিসেট (০)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Narayanganj Campus Administration Section with Executive Polish */}
      <div className="bg-[#fcfaf7] p-4 sm:p-5 rounded-2xl border border-[#d9c7b4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ebdccf]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6d1a22] text-[#fcf7ee] flex items-center justify-center shadow-xs shrink-0">
              <Building2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-[#521218] tracking-tight">
                  ক্যাম্পাস পরিচালনা পরিষদ (Campus Governance)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3e7d7] text-[#6d1a22] border border-[#d9c7b4]">
                  Narayanganj
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                অ্যাটমিক শিক্ষা পরিবার • কেন্দ্রীয় পরিচালনা ও নির্বাহী প্রশাসন
              </p>
            </div>
          </div>
          <div className="text-[11px] font-mono font-bold text-[#6d1a22] bg-[#fbf5ed] px-3 py-1.5 rounded-xl border border-[#e2d2c1] self-start sm:self-auto">
            1. Founder: Anirban Ghosh · 2. ICT Head: Srabon Nondi · 3. Manager: Ankon Saha
          </div>
        </div>

        {/* Executive Officer Cards with Refined Avatars & Typography */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-[#e2d5c3] hover:border-[#6d1a22]/50 transition-all flex items-center gap-3 shadow-2xs hover:shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6d1a22] to-[#501117] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-serif">
              AG
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[#8c222b] uppercase tracking-wider">1. Founder</div>
              <div className="text-sm font-extrabold text-gray-900 truncate">Anirban Ghosh</div>
              <div className="text-[10.5px] text-gray-500 truncate font-bangla">প্রতিষ্ঠাতা ও মুখ্য পরিচালক</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#e2d5c3] hover:border-[#6d1a22]/50 transition-all flex items-center gap-3 shadow-2xs hover:shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-serif">
              SN
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">2. ICT Head</div>
              <div className="text-sm font-extrabold text-gray-900 truncate">Srabon Nondi</div>
              <div className="text-[10.5px] text-gray-500 truncate font-bangla">আইসিটি ও সিস্টেম প্রধান</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#e2d5c3] hover:border-[#6d1a22]/50 transition-all flex items-center gap-3 shadow-2xs hover:shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#047857] to-[#065f46] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 font-serif">
              AS
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">3. Manager</div>
              <div className="text-sm font-extrabold text-gray-900 truncate">Ankon Saha</div>
              <div className="text-[10.5px] text-gray-500 truncate font-bangla">ক্যাম্পাস ব্যবস্থাপক</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Monthly Financial Audit & All Calculations Excel Export Feature Card */}
      <div className="bg-gradient-to-r from-[#fdfbf7] via-[#faf4ea] to-[#f7eedf] p-4 sm:p-5 rounded-2xl border border-[#d9c7b4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#6d1a22] text-[#fcf7ee] flex items-center justify-center shadow-sm shrink-0">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#501117] font-serif">
                মাসিক হিসাব ও অল ক্যালকুলেশন এক্সেল এক্সপোর্ট
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6d1a22] text-[#fcf7ee] font-bold uppercase tracking-wider">
                11-Sheet Excel
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 font-bangla">
              প্রতি মাসের ছাত্র ফি আদায়, শিক্ষক ক্লাস কাউন্টিং, সম্মানী প্রদান ও প্রাতিষ্ঠানিক খরচের সমন্বিত হিসাব ও এক্সেল (.xlsx / .csv) ডাউনলোড।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          {onOpenMonthlyReport && (
            <button
              onClick={onOpenMonthlyReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1a22] hover:bg-[#501117] text-[#fcf7ee] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>মাসিক এক্সেল রিপোর্ট ওপেন করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Inflow */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6d1a22]">
              সর্বমোট জমা (Total Inflow)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#6d1a22]/10 text-[#6d1a22] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#501117] tracking-tight font-mono tabular-nums">
            ৳{totalMoneyIn.toLocaleString()}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[#f0e4d7]">
            <span>{filteredStudents.length} জন শিক্ষার্থীর ফি আদায়</span>
            <span className="font-bold text-[#15803d] flex items-center gap-0.5">
              <ArrowUpRight size={13} /> 100% Inflow
            </span>
          </div>
        </div>

        {/* 2. Total Outflow */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#be123c]">
              সর্বমোট ব্যয় (Total Outflow)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#be123c] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#be123c] tracking-tight font-mono tabular-nums">
            ৳{totalMoneyOut.toLocaleString()}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-[#f0e4d7]">
            <span>অফিস: ৳{totalOverheadExpenses.toLocaleString()}</span>
            <span>সম্মানী: ৳{totalTeacherPaid.toLocaleString()}</span>
          </div>
        </div>

        {/* 3. Net Cash Balance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
              নীট ব্যালেন্স (Net Available Cash)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Wallet size={18} />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight font-mono tabular-nums ${netCashInHand >= 0 ? 'text-[#15803d]' : 'text-red-600'}`}>
            ৳{netCashInHand.toLocaleString()}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[#f0e4d7]">
            <span>হাতে নগদ পরিচালন তহবিল</span>
            <span className="font-semibold text-emerald-800">
              {netCashInHand >= 0 ? 'উদ্বৃত্ত (Surplus)' : 'ঘাটতি (Deficit)'}
            </span>
          </div>
        </div>

        {/* 4. Total Student Due Outstanding */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9f1239]">
              মোট বকেয়া ফি (Student Dues)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#9f1239] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Receipt size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#9f1239] tracking-tight font-mono tabular-nums">
            ৳{totalStudentDue.toLocaleString()}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[#f0e4d7]">
            <span>বকেয়া আদায়যোগ্য ফি</span>
            <button
              onClick={() => onNavigate('students')}
              className="text-[#6d1a22] font-bold hover:underline cursor-pointer"
            >
              বকেয়া তালিকা &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Zero State Notice Banner */}
      {filteredStudents.length === 0 && filteredTeachers.length === 0 && filteredExpenses.length === 0 && (
        <div className="bg-[#fcf7ee] border-2 border-dashed border-[#d9c7b4] rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#6d1a22]/10 text-[#6d1a22] flex items-center justify-center mx-auto mb-3">
            <Sparkles size={24} />
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#521218] font-serif">
            সিস্টেম বর্তমানে ফ্রেশ ও শূন্য (০) অবস্থায় রয়েছে
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mt-1 font-bangla">
            সকল পূর্ববর্তী সংখ্যা মুছে ফেলা হয়েছে। আপনি নতুন শিক্ষার্থী ভর্তি, কোর্স ফি আদায়, শিক্ষক রেজিস্টার বা খরচ এন্ট্রি করলেই তাৎক্ষণিক স্বয়ংক্রিয় মানি রসিদ ও ব্যালেন্স তৈরি হবে।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <button
              onClick={onNewStudentPayment}
              className="px-4 py-2 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              + শিক্ষার্থী পেমেন্ট যুক্ত করুন
            </button>
            <button
              onClick={onNewTeacherPayment}
              className="px-4 py-2 bg-[#faf4ea] hover:bg-white text-[#6d1a22] border border-[#d9c7b4] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              + শিক্ষক রেজিস্টার ও পেমেন্ট
            </button>
          </div>
        </div>
      )}

      {/* Cash Flow Distribution Progress Bar */}
      <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#d9c7b4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2 gap-1">
          <span className="font-bold text-[#450e13]">
            ক্যাশ ফ্লো স্বাস্থ্য ও বিতরণ অনুপাত (Cash Flow Distribution)
          </span>
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> নীট উদ্বৃত্ত: {reserveRatio.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1 font-semibold text-[#be123c]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#be123c] inline-block" /> মোট ব্যয়: {outflowRatio.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="w-full bg-[#e8dbca] h-3 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${reserveRatio}%` }}
            className="bg-emerald-600 transition-all duration-500"
            title={`নীট উদ্বৃত্ত: ${reserveRatio.toFixed(1)}%`}
          />
          <div
            style={{ width: `${outflowRatio}%` }}
            className="bg-[#be123c] transition-all duration-500"
            title={`মোট পরিচালন ব্যয়: ${outflowRatio.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Secondary Metrics: Classes Taken & Faculty Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Teacher Class Counting Summary */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#6d1a22]/10 text-[#6d1a22] flex items-center justify-center shadow-2xs">
              <CalendarCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">পরিচালিত মোট ক্লাস</p>
              <h3 className="text-2xl font-black text-[#521218] font-mono tabular-nums">
                {totalClassesCount} <span className="text-sm font-semibold text-gray-500 font-sans">টি ক্লাস</span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate('class-counting')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#6d1a22] text-[#fcf7ee] hover:bg-[#521218] transition-colors cursor-pointer active:scale-95"
          >
            ক্লাস লগ
          </button>
        </div>

        {/* Active Faculty Members */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shadow-2xs">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">নিবন্ধিত শিক্ষক</p>
              <h3 className="text-2xl font-black text-[#521218] font-mono tabular-nums">
                {filteredTeachers.length} <span className="text-sm font-semibold text-gray-500 font-sans">জন</span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate('teachers')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#6d1a22] text-[#fcf7ee] hover:bg-[#521218] transition-colors cursor-pointer active:scale-95"
          >
            সম্মানী তালিকা
          </button>
        </div>

        {/* Total Receipts Generated */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2d5c3] flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shadow-2xs">
              <Receipt size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 font-bangla">রসিদ ও ভাউচার</p>
              <h3 className="text-2xl font-black text-[#521218] font-mono tabular-nums">
                {filteredReceipts.length} <span className="text-sm font-semibold text-gray-500 font-sans">টি রেকর্ড</span>
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate('receipts')}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#6d1a22] text-[#fcf7ee] hover:bg-[#521218] transition-colors cursor-pointer active:scale-95"
          >
            সব দেখুন
          </button>
        </div>
      </div>

      {/* Recent Receipts & Transactions Section */}
      <div className="bg-white rounded-2xl border border-[#e2d5c3] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#ede0d2] gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#521218] font-serif">
              সাম্প্রতিক মানি রসিদ ও পেমেন্ট ভাউচার (Recent Transaction Records)
            </h2>
            <p className="text-xs text-gray-500">
              শিক্ষার্থী ও শিক্ষকদের প্রতিটি লেনদেনে স্বয়ংক্রিয়ভাবে তৈরি ডিজিটাল রসিদ খতিয়ান
            </p>
          </div>
          <button
            onClick={() => onNavigate('receipts')}
            className="text-xs font-bold text-[#6d1a22] hover:text-[#521218] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>সম্পূর্ণ খতিয়ান দেখুন</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {filteredReceipts.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <Receipt size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">এই ক্যাম্পাসে এখনও কোনো রসিদ বা ভাউচার ইস্যু করা হয়নি।</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f2e7dc] mt-1">
            {filteredReceipts.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf4ea]/60 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 shadow-2xs ${
                      r.type === 'student'
                        ? 'bg-[#6d1a22] text-[#fcf7ee]'
                        : r.type === 'teacher'
                        ? 'bg-[#854d0e] text-[#fef3c7]'
                        : 'bg-[#6b21a8] text-[#f3e8ff]'
                    }`}
                    title={r.type === 'student' ? 'Student Money Receipt' : r.type === 'teacher' ? 'Teacher Honorarium Voucher' : 'Staff Salary Voucher'}
                  >
                    {r.type === 'student' ? 'ST' : r.type === 'teacher' ? 'TC' : 'SF'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#450e13]">{r.targetName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#eee2d3] text-[#521218]">
                        #{r.receiptNo}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#faf0e1] text-[#6d1a22] border border-[#e2d0bd]">
                        {r.programme}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{r.date} • {r.time}</span>
                      <span>•</span>
                      <span>{r.branch}</span>
                      <span>•</span>
                      <span>গ্রহণকারী: {r.receiverName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right font-mono tabular-nums">
                    <span className={`text-sm font-black block ${r.type === 'student' ? 'text-[#15803d]' : 'text-[#be123c]'}`}>
                      {r.type === 'student' ? '+' : '-'}৳{r.amountPaid.toLocaleString()}
                    </span>
                    {r.dueAmount > 0 ? (
                      <span className="text-[10px] text-[#be123c] font-black">
                        বকেয়া: ৳{r.dueAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-bold font-sans">পরিশোধিত</span>
                    )}
                  </div>
                  <button
                    onClick={() => onViewReceipt(r)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Receipt size={13} />
                    <span>রসিদ দেখুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
