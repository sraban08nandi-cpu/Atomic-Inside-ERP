import React, { useState, useEffect } from 'react';
import { StaffMember, StaffPaymentRecord, Branch, User, ReceiptData, Expense } from '../types';
import { StaffSalaryVoucherData } from './StaffSalaryVoucher';
import { StaffSalaryVoucherModal } from './StaffSalaryVoucherModal';
import { ConfirmModal } from './ConfirmModal';
import { exportToCSV } from '../utils/exportCsv';
import { useToast } from './ToastContext';
import {
  Briefcase,
  PlusCircle,
  Receipt,
  Search,
  Phone,
  Calendar,
  X,
  Download,
  Trash2,
  History,
  CheckCircle2,
  DollarSign,
  FileText,
  Building2,
  UserCheck,
  Printer,
  Eye,
  AlertCircle,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface StaffSalaryManagementProps {
  staffList: StaffMember[];
  onAddStaff: (newStaff: StaffMember) => void;
  onPaySalary: (
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
  ) => void;
  onDeleteStaff?: (staffId: string) => void;
  onDeleteVoucher?: (staffId: string, paymentId: string, voucherNo: string) => void;
  onViewReceipt?: (receipt: ReceiptData) => void;
  selectedBranch: Branch;
  currentUser: User | null;
  expenses: Expense[];
  onAddExpense?: (expense: Expense) => void;
}

export const StaffSalaryManagement: React.FC<StaffSalaryManagementProps> = ({
  staffList,
  onAddStaff,
  onPaySalary,
  onDeleteStaff,
  onDeleteVoucher,
  onViewReceipt,
  selectedBranch,
  currentUser,
}) => {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'staff-list' | 'vouchers-log'>('staff-list');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Month options
  const monthOptions = [
    'September 2026',
    'October 2026',
    'November 2026',
    'December 2026',
    'August 2026',
    'July 2026',
  ];
  const [selectedMonth, setSelectedMonth] = useState('September 2026');

  // Modals
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isPaySalaryOpen, setIsPaySalaryOpen] = useState(false);
  const [selectedStaffForPay, setSelectedStaffForPay] = useState<StaffMember | null>(null);
  const [historyStaff, setHistoryStaff] = useState<StaffMember | null>(null);
  const [activeVoucherModal, setActiveVoucherModal] = useState<StaffSalaryVoucherData | null>(null);
  const [confirmStaffToDelete, setConfirmStaffToDelete] = useState<StaffMember | null>(null);
  const [confirmVoucherToDelete, setConfirmVoucherToDelete] = useState<{
    staffId: string;
    paymentId: string;
    voucherNo: string;
  } | null>(null);

  // New Staff Form States
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffId, setNewStaffId] = useState(`AI-STF-0${staffList.length + 1}`);
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDepartment, setNewDepartment] = useState('Campus Administration');
  const [newMonthlySalary, setNewMonthlySalary] = useState<number | string>(20000);
  const [newJoiningDate, setNewJoiningDate] = useState(new Date().toISOString().split('T')[0]);

  // Pay Salary Form States
  const [payStaffId, setPayStaffId] = useState('');
  const [payMonth, setPayMonth] = useState('September 2026');
  const [payBasicSalary, setPayBasicSalary] = useState<number>(0);
  const [payBonus, setPayBonus] = useState<number>(0);
  const [payDeduction, setPayDeduction] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('bank');
  const [payTrxId, setPayTrxId] = useState('');
  const [payDisbursedBy, setPayDisbursedBy] = useState(
    currentUser ? currentUser.name : 'Anirban Ghosh (Founder)'
  );
  const [payNote, setPayNote] = useState('মাসিক প্রাতিষ্ঠানিক বেতন ও দায়িত্ব ভাতা নির্বাহ');
  const [autoLogExpense, setAutoLogExpense] = useState(true);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmVoucherToDelete) {
          setConfirmVoucherToDelete(null);
        } else if (confirmStaffToDelete) {
          setConfirmStaffToDelete(null);
        } else if (historyStaff) {
          setHistoryStaff(null);
        } else if (isPaySalaryOpen) {
          setIsPaySalaryOpen(false);
        } else if (isAddStaffOpen) {
          setIsAddStaffOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmVoucherToDelete, confirmStaffToDelete, historyStaff, isPaySalaryOpen, isAddStaffOpen]);

  // Calculated Net Salary for modal
  const calculatedNetAmount = Math.max(0, payBasicSalary + payBonus - payDeduction);

  // Filter staff list
  const filteredStaff = staffList
    .filter((s) => !s.branch || s.branch === 'Narayanganj')
    .filter((s) => (departmentFilter === 'all' ? true : s.department === departmentFilter))
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.mobileNumber.includes(searchTerm)
    );

  // Flatten all vouchers for the Vouchers Log view
  const allVouchers: (StaffPaymentRecord & { staff: StaffMember })[] = [];
  staffList.forEach((s) => {
    (s.paymentHistory || []).forEach((p) => {
      allVouchers.push({ ...p, staff: s });
    });
  });
  allVouchers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredVouchers = allVouchers.filter((v) => {
    const matchesSearch =
      v.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.staff.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.disbursedBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Payroll Metrics for Selected Month
  const totalStaffCount = staffList.length;
  const totalMonthlyPayrollBudget = staffList.reduce((acc, s) => acc + s.monthlySalary, 0);

  // Paid this selected month
  const paidThisMonth = staffList.reduce((acc, s) => {
    const payment = s.paymentHistory?.find((p) => p.month === selectedMonth);
    return acc + (payment ? payment.netAmount : 0);
  }, 0);

  const pendingPayableThisMonth = Math.max(0, totalMonthlyPayrollBudget - paidThisMonth);

  // Open Pay Modal for a specific staff
  const handleOpenPayModal = (staff: StaffMember) => {
    setSelectedStaffForPay(staff);
    setPayStaffId(staff.id);
    setPayMonth(selectedMonth);
    setPayBasicSalary(staff.monthlySalary);
    setPayBonus(0);
    setPayDeduction(0);
    setPayNote(`মাসিক প্রাতিষ্ঠানিক বেতন (${selectedMonth})`);
    setIsPaySalaryOpen(true);
  };

  // Handle Pay Salary Submission
  const handleSubmitPaySalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStaffId) {
      showToast('error', 'স্টাফ নির্বাচন করুন', 'বেতন প্রদানের জন্য অনুগ্রহ করে একজন কর্মকর্তা নির্বাচন করুন।');
      return;
    }

    const staff = staffList.find((s) => s.id === payStaffId);
    if (!staff) return;

    const voucherNo = `VCH-SAL-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];

    onPaySalary(staff.id, {
      voucherNo,
      month: payMonth,
      basicSalary: Number(payBasicSalary) || 0,
      bonus: Number(payBonus) || 0,
      deduction: Number(payDeduction) || 0,
      netAmount: calculatedNetAmount,
      paymentMethod: payMethod,
      transactionId: payTrxId,
      disbursedBy: payDisbursedBy,
      note: payNote,
      autoLogExpense,
    });

    // Immediately open newly generated voucher in modal
    const newVoucherData: StaffSalaryVoucherData = {
      voucherNo,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      month: payMonth,
      staffName: staff.name,
      staffId: staff.staffId,
      designation: staff.designation,
      department: staff.department,
      contactNumber: staff.mobileNumber,
      basicSalary: Number(payBasicSalary) || 0,
      bonus: Number(payBonus) || 0,
      deduction: Number(payDeduction) || 0,
      netAmount: calculatedNetAmount,
      paymentMethod: payMethod,
      transactionId: payTrxId,
      disbursedBy: payDisbursedBy,
      note: payNote,
      copyType: 'staff',
    };

    setIsPaySalaryOpen(false);
    setActiveVoucherModal(newVoucherData);

    showToast(
      'success',
      'বেতন ও ভাউচার সম্পন্ন হয়েছে',
      `${staff.name}-এর ${payMonth} মাসের বেতন ভাউচার #${voucherNo} প্রস্তুত হয়েছে।`
    );
  };

  // Handle Add Staff Submission
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      showToast('error', 'নাম প্রদান করুন', 'কর্মকর্তা বা কর্মচারীর নাম আবশ্যক।');
      return;
    }

    const newStaff: StaffMember = {
      id: `stf_${Date.now()}`,
      staffId: newStaffId || `AI-STF-${Date.now().toString().slice(-4)}`,
      name: newStaffName.trim(),
      mobileNumber: newMobileNumber.trim(),
      designation: newDesignation.trim() || 'অফিস সহকারী (Staff)',
      department: newDepartment,
      monthlySalary: Number(newMonthlySalary) || 0,
      branch: 'Narayanganj',
      joiningDate: newJoiningDate,
      status: 'active',
      paymentHistory: [],
    };

    onAddStaff(newStaff);
    setIsAddStaffOpen(false);
    showToast('success', 'নতুন কর্মকর্তা যুক্ত হয়েছে', `${newStaff.name} সফলভাবে স্টাফ তালিকায় অন্তর্ভুক্ত হয়েছে।`);

    // Reset Form
    setNewStaffName('');
    setNewStaffId(`AI-STF-0${staffList.length + 2}`);
    setNewMobileNumber('');
    setNewDesignation('');
    setNewMonthlySalary(20000);
  };

  // Export Payroll to CSV
  const handleExportCSV = () => {
    const data = filteredStaff.map((s, idx) => {
      const payment = s.paymentHistory?.find((p) => p.month === selectedMonth);
      return {
        SL: idx + 1,
        'Staff ID': s.staffId,
        'Staff Name': s.name,
        Designation: s.designation,
        Department: s.department,
        'Mobile Number': s.mobileNumber,
        'Campus Branch': s.branch,
        'Monthly Basic Salary (BDT)': s.monthlySalary,
        'Salary Month': selectedMonth,
        'Payment Status': payment ? 'Paid' : 'Pending',
        'Net Paid (BDT)': payment ? payment.netAmount : 0,
        'Payment Date': payment ? payment.date : 'N/A',
        'Voucher #': payment ? payment.voucherNo : 'N/A',
        'Disbursed By': payment ? payment.disbursedBy : 'N/A',
      };
    });

    exportToCSV(`Atomic_Staff_Payroll_${selectedMonth.replace(/\s+/g, '_')}_Narayanganj`, data);
    showToast('success', 'বেতন শিট এক্সপোর্ট হয়েছে', 'CSV ফাইল সফলভাবে ডাউনলোড করা হয়েছে।');
  };

  // Convert a record to VoucherData for viewing
  const openVoucherPreview = (record: StaffPaymentRecord, staff: StaffMember) => {
    const vData: StaffSalaryVoucherData = {
      voucherNo: record.voucherNo,
      date: record.date,
      time: record.time,
      month: record.month,
      staffName: staff.name,
      staffId: staff.staffId,
      designation: staff.designation,
      department: staff.department,
      contactNumber: staff.mobileNumber,
      basicSalary: record.basicSalary,
      bonus: record.bonus,
      deduction: record.deduction,
      netAmount: record.netAmount,
      paymentMethod: record.method,
      transactionId: record.transactionId,
      disbursedBy: record.disbursedBy,
      note: record.note,
      copyType: 'staff',
    };
    setActiveVoucherModal(vData);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fdfbf7] p-5 sm:p-6 rounded-2xl border border-[#d9c7b4] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#58141b] text-white">
              <Briefcase size={22} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#58141b] font-serif">
                স্টাফ বেতন ও ভাউচার ব্যবস্থাপনা
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                Staff Salary & Payment Voucher Management • Narayanganj Campus
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            কর্মকর্তা ও কর্মচারীদের মাসিক বেতন হিসাব, বেতন বিতরণ এবং সরকারি মানদণ্ডের প্রাতিষ্ঠানিক বেতন ভাউচার (Salary Voucher) প্রস্তুত ও প্রিন্ট করুন।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setPayStaffId(staffList[0]?.id || '');
              setPayBasicSalary(staffList[0]?.monthlySalary || 0);
              setPayMonth(selectedMonth);
              setIsPaySalaryOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#58141b] hover:bg-[#430f14] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Receipt size={16} />
            <span>বেতন প্রদান ও ভাউচার তৈরি</span>
          </button>

          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#faf4ea] hover:bg-white text-[#58141b] border border-[#d9c7b4] text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>নতুন স্টাফ যুক্ত করুন</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#faf4ea] hover:bg-white text-gray-700 border border-[#d9c7b4] text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
            title="মাসিক বেতন শিট এক্সেলে এক্সপোর্ট করুন"
          >
            <Download size={15} />
            <span className="hidden sm:inline">CSV রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Staff */}
        <div className="bg-[#fdfbf7] border border-[#d9c7b4] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">মোট স্টাফ সংখ্যা</span>
            <div className="text-xl sm:text-2xl font-black text-[#58141b] mt-1 font-mono">
              {totalStaffCount} জন
            </div>
            <span className="text-[10px] text-gray-500 font-medium">নারায়ণগঞ্জ ক্যাম্পাস</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f5e9da] text-[#58141b] flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        {/* Total Monthly Payroll Budget */}
        <div className="bg-[#fdfbf7] border border-[#d9c7b4] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">মাসিক বেতন বাজেট</span>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1 font-mono">
              ৳ {totalMonthlyPayrollBudget.toLocaleString()}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">নির্ধারিত মূল বেতন</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Paid This Month */}
        <div className="bg-[#fdfbf7] border border-[#d9c7b4] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">প্রদত্ত বেতন</span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                {selectedMonth.split(' ')[0]}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
              ৳ {paidThisMonth.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">ভাউচার ইস্যু সম্পন্ন</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Pending This Month */}
        <div className="bg-[#fdfbf7] border border-[#d9c7b4] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">অবশিষ্ট প্রদেয়</span>
            <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1 font-mono">
              ৳ {pendingPayableThisMonth.toLocaleString()}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">চলতি মাসে বকেয়া</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingDown size={20} />
          </div>
        </div>
      </div>

      {/* FILTER & TAB CONTROLS */}
      <div className="bg-[#fdfbf7] border border-[#d9c7b4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main SubTab Toggle */}
          <div className="flex items-center bg-[#faf4ea] p-1 rounded-xl border border-[#d9c7b4] self-start">
            <button
              onClick={() => setActiveSubTab('staff-list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'staff-list'
                  ? 'bg-[#58141b] text-white shadow-xs'
                  : 'text-gray-700 hover:text-[#58141b]'
              }`}
            >
              <Briefcase size={14} />
              <span>কর্মকর্তা তালিকা ও বেতন</span>
            </button>

            <button
              onClick={() => setActiveSubTab('vouchers-log')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'vouchers-log'
                  ? 'bg-[#58141b] text-white shadow-xs'
                  : 'text-gray-700 hover:text-[#58141b]'
              }`}
            >
              <Receipt size={14} />
              <span>সকল বেতন ভাউচার খতিয়ান ({allVouchers.length})</span>
            </button>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">হিসাব মাস:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#d9c7b4] rounded-xl text-xs font-bold text-[#58141b] focus:outline-none focus:ring-2 focus:ring-[#58141b]"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Department Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1 border-t border-[#ede0d2]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeSubTab === 'staff-list'
                  ? 'স্টাফের নাম, আইডি, পদবি বা মোবাইল নম্বর দিয়ে খুঁজুন...'
                  : 'ভাউচার নং (যেমন: VCH-SAL-..), নাম, মাস বা মাধ্যম দিয়ে খুঁজুন...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#58141b] text-gray-800"
            />
          </div>

          {activeSubTab === 'staff-list' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {['all', 'Executive Administration', 'IT & Software Operations', 'Campus Administration', 'Accounts & Student Care'].map(
                (dep) => (
                  <button
                    key={dep}
                    onClick={() => setDepartmentFilter(dep)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      departmentFilter === dep
                        ? 'bg-[#58141b] text-white'
                        : 'bg-white border border-[#d9c7b4] text-gray-600 hover:bg-[#faf4ea]'
                    }`}
                  >
                    {dep === 'all'
                      ? 'সকল বিভাগ'
                      : dep === 'Executive Administration'
                      ? 'প্রশাসন'
                      : dep === 'IT & Software Operations'
                      ? 'আইটি'
                      : dep === 'Campus Administration'
                      ? 'ক্যাম্পাস'
                      : 'একাউন্টস'}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: STAFF LIST & SALARY DISBURSEMENT */}
      {activeSubTab === 'staff-list' && (
        <div className="bg-[#fdfbf7] border border-[#d9c7b4] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f6eee2] text-[#58141b] font-black uppercase text-[11px] border-b border-[#d9c7b4]">
                <tr>
                  <th className="py-3 px-3.5">কর্মকর্তা / কর্মচারী</th>
                  <th className="py-3 px-3">পদবি ও বিভাগ</th>
                  <th className="py-3 px-3">মোবাইল</th>
                  <th className="py-3 px-3 text-right">মাসিক মূল বেতন</th>
                  <th className="py-3 px-3 text-center">{selectedMonth.split(' ')[0]} মাসের অবস্থা</th>
                  <th className="py-3 px-3 text-right">ভাউচার ও অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdccf] font-medium text-gray-800">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      কোনো কর্মকর্তা বা কর্মচারীর রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const currentMonthPayment = staff.paymentHistory?.find(
                      (p) => p.month === selectedMonth
                    );
                    const isPaid = !!currentMonthPayment;

                    return (
                      <tr key={staff.id} className="hover:bg-[#faf5ec] transition-colors">
                        {/* Name & ID */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#58141b] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-extrabold text-sm text-[#430f14] block">
                                {staff.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] font-bold text-gray-600 bg-white px-1.5 py-0.2 rounded border border-[#d9c7b4]">
                                  {staff.staffId}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  যোগদান: {staff.joiningDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Designation & Department */}
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#58141b] block text-xs">
                            {staff.designation}
                          </span>
                          <span className="text-[10.5px] text-gray-500 font-medium">
                            {staff.department}
                          </span>
                        </td>

                        {/* Mobile */}
                        <td className="py-3 px-3 font-mono text-gray-700">
                          {staff.mobileNumber || '—'}
                        </td>

                        {/* Monthly Salary */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 text-sm tabular-nums">
                          ৳{staff.monthlySalary.toLocaleString()}
                        </td>

                        {/* Payment Status for selected month */}
                        <td className="py-3 px-3 text-center">
                          {isPaid ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold">
                                <CheckCircle2 size={12} />
                                <span>পরিশোধিত</span>
                              </span>
                              <span className="font-mono text-[10px] text-emerald-700 font-semibold mt-0.5 tabular-nums">
                                ৳{currentMonthPayment.netAmount.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-bold">
                              <span>অপেক্ষমান</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPaid ? (
                              <button
                                onClick={() => openVoucherPreview(currentMonthPayment, staff)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#58141b] hover:bg-[#430f14] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                title="ভাউচার দেখুন ও প্রিন্ট করুন"
                              >
                                <Receipt size={13} />
                                <span>ভাউচার</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenPayModal(staff)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                                title="বেতন পরিশোধ করে ভাউচার ইস্যু করুন"
                              >
                                <DollarSign size={13} />
                                <span>বেতন প্রদান</span>
                              </button>
                            )}

                            {/* View History */}
                            <button
                              onClick={() => setHistoryStaff(staff)}
                              className="p-1.5 rounded-lg bg-white hover:bg-[#f6eee2] text-gray-700 border border-[#d9c7b4] transition-colors cursor-pointer"
                              title="পূর্ববর্তী সকল বেতন ভাউচারের ইতিহাস"
                            >
                              <History size={14} />
                            </button>

                            {/* Delete Staff */}
                            {onDeleteStaff && (
                              <button
                                onClick={() => setConfirmStaffToDelete(staff)}
                                className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-[#d9c7b4] transition-colors cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL SALARY VOUCHERS LOG */}
      {activeSubTab === 'vouchers-log' && (
        <div className="bg-[#fdfbf7] border border-[#d9c7b4] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-[#f8f1e7] border-b border-[#d9c7b4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-[#58141b]" />
              <span className="font-serif font-black text-sm text-[#58141b]">
                ইস্যুকৃত কর্মকর্তা ও কর্মচারী বেতন ভাউচার খতিয়ান
              </span>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-white px-2.5 py-0.5 rounded-full border border-[#d9c7b4]">
              সর্বমোট {filteredVouchers.length} টি ভাউচার
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f6eee2] text-[#58141b] font-black uppercase text-[11px] border-b border-[#d9c7b4]">
                <tr>
                  <th className="py-3 px-3.5">ভাউচার নং</th>
                  <th className="py-3 px-3">তারিখ ও সময়</th>
                  <th className="py-3 px-3">কর্মকর্তার নাম ও পদবি</th>
                  <th className="py-3 px-3 text-center">বেতন মাস</th>
                  <th className="py-3 px-3 text-right">নিট পরিশোধ</th>
                  <th className="py-3 px-3">মাধ্যম</th>
                  <th className="py-3 px-3">প্রদানকারী</th>
                  <th className="py-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdccf] font-medium text-gray-800">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      কোনো বেতন ভাউচার রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-[#faf5ec] transition-colors">
                      {/* Voucher No */}
                      <td className="py-3 px-3.5 font-mono font-black text-[#58141b]">
                        {voucher.voucherNo}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-gray-900 block">{voucher.date}</span>
                        {voucher.time && (
                          <span className="text-[10px] text-gray-500 font-mono">{voucher.time}</span>
                        )}
                      </td>

                      {/* Staff Name & Role */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900 block">{voucher.staff.name}</span>
                        <span className="text-[10.5px] text-[#58141b] font-medium">
                          {voucher.staff.designation}
                        </span>
                      </td>

                      {/* Salary Month */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-[11px] px-2 py-0.5 rounded-md bg-[#faf4ea] text-[#58141b] border border-[#d9c7b4]">
                          {voucher.month}
                        </span>
                      </td>

                      {/* Net Amount */}
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                        ৳ {voucher.netAmount.toLocaleString()}
                      </td>

                      {/* Method */}
                      <td className="py-3 px-3">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                          {voucher.method}
                        </span>
                      </td>

                      {/* Disbursed By */}
                      <td className="py-3 px-3 text-gray-700 text-[11px]">
                        {voucher.disbursedBy || 'Anirban Ghosh'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openVoucherPreview(voucher, voucher.staff)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#58141b] hover:bg-[#430f14] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                            title="ভাউচার ভিউ ও প্রিন্ট"
                          >
                            <Eye size={12} />
                            <span>দেখুন</span>
                          </button>

                          {onDeleteVoucher && (
                            <button
                              onClick={() => {
                                setConfirmVoucherToDelete({
                                  staffId: voucher.staff.id,
                                  paymentId: voucher.id,
                                  voucherNo: voucher.voucherNo,
                                });
                              }}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-[#d9c7b4] transition-colors cursor-pointer"
                              title="ভাউচার মুছুন"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: PAY SALARY & ISSUE VOUCHER */}
      {isPaySalaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#58141b] overflow-hidden my-6">
            {/* Header */}
            <div className="bg-[#58141b] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={20} className="text-[#f5c388]" />
                <h3 className="font-serif font-black text-base sm:text-lg">
                  বেতন প্রদান ও ভাউচার প্রস্তুতকরণ
                </h3>
              </div>
              <button
                onClick={() => setIsPaySalaryOpen(false)}
                className="p-1 rounded-lg text-white hover:bg-[#430f14] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPaySalary} className="p-5 sm:p-6 space-y-4">
              {/* Select Staff */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  কর্মকর্তা / কর্মচারী নির্বাচন করুন *
                </label>
                <select
                  value={payStaffId}
                  onChange={(e) => {
                    const stfId = e.target.value;
                    setPayStaffId(stfId);
                    const found = staffList.find((s) => s.id === stfId);
                    if (found) {
                      setPayBasicSalary(found.monthlySalary);
                    }
                  }}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                >
                  <option value="">-- স্টাফ নির্বাচন করুন --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation}) — মূল বেতন: ৳{s.monthlySalary.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary Month */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    বেতন মাস (Salary Month) *
                  </label>
                  <select
                    value={payMonth}
                    onChange={(e) => setPayMonth(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    পরিশোধ মাধ্যম (Payment Method) *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  >
                    <option value="bank">ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                    <option value="cash">নগদ ক্যাশ (Cash)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                  </select>
                </div>
              </div>

              {/* Financial Calculation Fields */}
              <div className="bg-[#faf4ea] p-4 rounded-xl border border-[#d9c7b4] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Basic Salary */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      মূল বেতন (BDT)
                    </label>
                    <input
                      type="number"
                      value={payBasicSalary}
                      onChange={(e) => setPayBasicSalary(Number(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                    />
                  </div>

                  {/* Bonus */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">
                      বোনাস / ভাতা (+)
                    </label>
                    <input
                      type="number"
                      value={payBonus}
                      onChange={(e) => setPayBonus(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Deduction */}
                  <div>
                    <label className="block text-xs font-bold text-rose-800 mb-1">
                      কর্তন / অগ্রিম (-)
                    </label>
                    <input
                      type="number"
                      value={payDeduction}
                      onChange={(e) => setPayDeduction(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600"
                    />
                  </div>
                </div>

                {/* Net Disbursed Display */}
                <div className="flex items-center justify-between pt-2 border-t border-[#ebdccf]">
                  <span className="text-xs font-black text-[#58141b] uppercase">
                    সর্বমোট নিট প্রদেয় বেতন:
                  </span>
                  <span className="font-mono text-lg font-black text-emerald-800">
                    ৳ {calculatedNetAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Transaction ID & Disbursed By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ট্রানজেকশন আইডি / চেক নং (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: DBBL-9921 বা TRX882"
                    value={payTrxId}
                    onChange={(e) => setPayTrxId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    বেতন প্রদানকারী কর্মকর্তা *
                  </label>
                  <input
                    type="text"
                    value={payDisbursedBy}
                    onChange={(e) => setPayDisbursedBy(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  />
                </div>
              </div>

              {/* Note / Remarks */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  মন্তব্য / বিবরণ
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                />
              </div>

              {/* Auto log to expenses */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoExpense"
                  checked={autoLogExpense}
                  onChange={(e) => setAutoLogExpense(e.target.checked)}
                  className="w-4 h-4 text-[#58141b] rounded focus:ring-[#58141b] cursor-pointer"
                />
                <label htmlFor="autoExpense" className="text-xs text-gray-700 cursor-pointer select-none">
                  স্বয়ংক্রিয়ভাবে খরচ ট্র্যাকারে (Staff Salary Expense) এন্ট্রি সংরক্ষণ করুন
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d9c7b4]">
                <button
                  type="button"
                  onClick={() => setIsPaySalaryOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[#d9c7b4] text-gray-700 hover:bg-[#faf4ea] cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-[#58141b] hover:bg-[#430f14] text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Receipt size={15} />
                  <span>বেতন পরিশোধ ও ভাউচার ইস্যু করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW STAFF */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#58141b] overflow-hidden my-6">
            <div className="bg-[#58141b] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-[#f5c388]" />
                <h3 className="font-serif font-black text-base sm:text-lg">
                  নতুন কর্মকর্তা / কর্মচারী নিবন্ধন
                </h3>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded-lg text-white hover:bg-[#430f14] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 sm:p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  কর্মকর্তা / কর্মচারীর পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: অনির্বাণ ঘোষ বা মোছাঃ খাদিজা"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    স্টাফ আইডি (Staff ID) *
                  </label>
                  <input
                    type="text"
                    value={newStaffId}
                    onChange={(e) => setNewStaffId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    value={newMobileNumber}
                    onChange={(e) => setNewMobileNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    পদবি (Designation) *
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: ক্যাম্পাস ম্যানেজার বা হিসাব কর্মকর্তা"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    বিভাগ (Department)
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  >
                    <option value="Campus Administration">Campus Administration</option>
                    <option value="Executive Administration">Executive Administration</option>
                    <option value="IT & Software Operations">IT & Software Operations</option>
                    <option value="Accounts & Student Care">Accounts & Student Care</option>
                    <option value="Science & Computer Lab">Science & Computer Lab</option>
                    <option value="Facility & Maintenance">Facility & Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    মাসিক মূল বেতন (Monthly Salary) *
                  </label>
                  <input
                    type="number"
                    value={newMonthlySalary}
                    onChange={(e) => setNewMonthlySalary(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    যোগদানের তারিখ
                  </label>
                  <input
                    type="date"
                    value={newJoiningDate}
                    onChange={(e) => setNewJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d9c7b4] rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58141b]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#d9c7b4]">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[#d9c7b4] text-gray-700 hover:bg-[#faf4ea] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-[#58141b] hover:bg-[#430f14] text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  স্টাফ সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: STAFF PAYMENT HISTORY MODAL */}
      {historyStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#58141b] overflow-hidden my-6">
            <div className="bg-[#58141b] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-black text-base">
                  {historyStaff.name} — বেতন ও ভাউচার ইতিহাস
                </h3>
                <span className="text-[11px] text-[#f5c388]">
                  {historyStaff.designation} • আইডি: {historyStaff.staffId}
                </span>
              </div>
              <button
                onClick={() => setHistoryStaff(null)}
                className="p-1 rounded-lg text-white hover:bg-[#430f14] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
              {(!historyStaff.paymentHistory || historyStaff.paymentHistory.length === 0) ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  এই কর্মকর্তার পূর্বের কোনো বেতন প্রদানের রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyStaff.paymentHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white p-3.5 rounded-xl border border-[#d9c7b4] flex flex-wrap items-center justify-between gap-3 shadow-2xs hover:border-[#58141b] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#58141b]">
                            {rec.voucherNo}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#faf4ea] text-[#58141b] text-[10px] font-bold">
                            {rec.month}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          তারিখ: <span className="font-mono font-semibold">{rec.date}</span>
                          <span className="mx-1">•</span>
                          মাধ্যম: <span className="uppercase font-mono text-[10px]">{rec.method}</span>
                          {rec.transactionId && <span> (Trx: {rec.transactionId})</span>}
                        </div>
                        {rec.note && (
                          <p className="text-[11px] text-gray-500 italic mt-0.5">{rec.note}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-500 uppercase font-bold block">
                            নিট বেতন
                          </span>
                          <span className="font-mono font-black text-emerald-800 text-sm">
                            ৳ {rec.netAmount.toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setHistoryStaff(null);
                            openVoucherPreview(rec, historyStaff);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#58141b] text-white hover:bg-[#430f14] text-xs font-bold transition-all cursor-pointer"
                        >
                          <Receipt size={13} />
                          <span>ভাউচার</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: STAFF SALARY VOUCHER MODAL */}
      <StaffSalaryVoucherModal
        voucher={activeVoucherModal}
        isOpen={!!activeVoucherModal}
        onClose={() => setActiveVoucherModal(null)}
      />

      {/* Delete Staff Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmStaffToDelete}
        onClose={() => setConfirmStaffToDelete(null)}
        onConfirm={() => {
          if (confirmStaffToDelete && onDeleteStaff) {
            onDeleteStaff(confirmStaffToDelete.id);
            showToast('info', 'স্টাফ অপসারিত', `${confirmStaffToDelete.name}-কে তালিকা থেকে সরানো হয়েছে।`);
          }
        }}
        title="স্টাফ সদস্য মুছে ফেলতে চান?"
        message={`আপনি কি নিশ্চিতভাবে "${confirmStaffToDelete?.name}" (${confirmStaffToDelete?.designation})-এর সকল তথ্য মুছে ফেলতে চান?`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
      />

      {/* Delete Voucher Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmVoucherToDelete}
        onClose={() => setConfirmVoucherToDelete(null)}
        onConfirm={() => {
          if (confirmVoucherToDelete && onDeleteVoucher) {
            onDeleteVoucher(
              confirmVoucherToDelete.staffId,
              confirmVoucherToDelete.paymentId,
              confirmVoucherToDelete.voucherNo
            );
            showToast(
              'info',
              'ভাউচার অপসারিত',
              `বেতন ভাউচার #${confirmVoucherToDelete.voucherNo} সফলভাবে মুছে ফেলা হয়েছে।`
            );
          }
        }}
        title="বেতন ভাউচার মুছে ফেলতে চান?"
        message={`আপনি কি নিশ্চিতভাবে বেতন ভাউচার #${confirmVoucherToDelete?.voucherNo} খতিয়ান থেকে মুছে ফেলতে চান?`}
        confirmText="হ্যাঁ, ভাউচার মুছুন"
      />
    </div>
  );
};
