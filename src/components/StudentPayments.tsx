import React, { useState, useEffect } from 'react';
import { Student, ReceiptData, Branch, User } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { useToast } from './ToastContext';
import { ConfirmModal } from './ConfirmModal';
import {
  Users,
  UserPlus,
  Search,
  PlusCircle,
  Receipt,
  Phone,
  X,
  Download,
  Trash2,
  History,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  Clock,
  BookOpen,
  Filter,
  Layers,
  GraduationCap,
} from 'lucide-react';

interface StudentPaymentsProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onRecordPayment: (studentId: string, amount: number, paymentMethod: any, note?: string) => void;
  onDeleteStudent?: (studentId: string) => void;
  onViewReceipt: (receipt: ReceiptData) => void;
  selectedBranch: Branch;
  currentUser: User | null;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
  isFeeModalOpen?: boolean;
  setIsFeeModalOpen?: (open: boolean) => void;
}

export const StudentPayments: React.FC<StudentPaymentsProps> = ({
  students,
  onAddStudent,
  onRecordPayment,
  onDeleteStudent,
  onViewReceipt,
  selectedBranch,
  currentUser,
  isAddModalOpen: externalAddModalOpen,
  setIsAddModalOpen: setExternalAddModalOpen,
  isFeeModalOpen: externalFeeModalOpen,
  setIsFeeModalOpen: setExternalFeeModalOpen,
}) => {
  const { showToast } = useToast();

  // Two primary sections: 1. নতুন শিক্ষার্থী ভর্তি (admission) | 2. শিক্ষার্থীর ফি পরিশোধ (fee_payment)
  const [activeSection, setActiveSection] = useState<'admission' | 'fee_payment'>('admission');

  // Modal states
  const [internalAddModalOpen, setInternalAddModalOpen] = useState(false);
  const isAddModalOpen = externalAddModalOpen !== undefined ? externalAddModalOpen : internalAddModalOpen;
  const setIsAddModalOpen = setExternalAddModalOpen || setInternalAddModalOpen;

  const [internalFeeModalOpen, setInternalFeeModalOpen] = useState(false);
  const isFeeModalOpen = externalFeeModalOpen !== undefined ? externalFeeModalOpen : internalFeeModalOpen;
  const setIsFeeModalOpen = setExternalFeeModalOpen || setInternalFeeModalOpen;

  // Selected student for fee payment or history
  const [feeSelectedStudentId, setFeeSelectedStudentId] = useState<string>('');
  const [historyModalStudent, setHistoryModalStudent] = useState<Student | null>(null);
  const [confirmStudentToDelete, setConfirmStudentToDelete] = useState<Student | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDue, setFilterDue] = useState<'all' | 'due' | 'cleared'>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  const STANDARD_CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  // ==========================================
  // Section 1: New Student Admission Form State
  // ==========================================
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [programme, setProgramme] = useState('');
  const [batchTime, setBatchTime] = useState('');
  const [branch, setBranch] = useState<Branch>('Narayanganj');
  const [totalFee, setTotalFee] = useState<string | number>('');
  const [initialPayment, setInitialPayment] = useState<string | number>('0');
  const [admissionPayMethod, setAdmissionPayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('cash');
  const [admissionTrxId, setAdmissionTrxId] = useState('');
  const [admissionNotes, setAdmissionNotes] = useState('');

  // ==========================================
  // Section 2: Student Fee Payment Form State
  // ==========================================
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('cash');
  const [payTrxId, setPayTrxId] = useState('');
  const [payNote, setPayNote] = useState('নিয়মিত কোর্স ফি কিস্তি');

  // Branch-filtered students
  const branchStudents = students.filter((s) => !s.branch || s.branch === 'Narayanganj');

  // Selected student object for fee modal
  const selectedStudentForFee = branchStudents.find((s) => s.id === feeSelectedStudentId) || null;

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmStudentToDelete) {
          setConfirmStudentToDelete(null);
        } else if (historyModalStudent) {
          setHistoryModalStudent(null);
        } else if (isFeeModalOpen) {
          setIsFeeModalOpen(false);
        } else if (isAddModalOpen) {
          setIsAddModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmStudentToDelete, historyModalStudent, isFeeModalOpen, isAddModalOpen, setIsFeeModalOpen, setIsAddModalOpen]);

  // When feeSelectedStudentId changes in fee modal, auto-suggest the due amount
  useEffect(() => {
    if (selectedStudentForFee) {
      if (selectedStudentForFee.dueAmount > 0) {
        setPayAmount(selectedStudentForFee.dueAmount);
      } else {
        setPayAmount('');
      }
    }
  }, [feeSelectedStudentId]);

  // Filter students based on search, due filter, and class filter
  const filteredStudents = branchStudents.filter((s) => {
    const sClass = s.studentClass || 'Class 10';
    if (activeSection === 'admission' && selectedClassFilter !== 'all' && sClass !== selectedClassFilter) {
      return false;
    }
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.mobileNumber.includes(searchTerm) ||
      s.programme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentClass && s.studentClass.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.batchTime && s.batchTime.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchSearch) return false;
    if (filterDue === 'due') return s.dueAmount > 0;
    if (filterDue === 'cleared') return s.dueAmount === 0;
    return true;
  });

  // Calculate summary metrics
  const totalStudentsCount = branchStudents.length;
  const totalAgreedFee = branchStudents.reduce((acc, s) => acc + (s.totalFee || 0), 0);
  const totalCollectedFee = branchStudents.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const totalOutstandingDue = branchStudents.reduce((acc, s) => acc + (s.dueAmount || 0), 0);
  const dueStudentsCount = branchStudents.filter((s) => s.dueAmount > 0).length;

  // Export CSV (Class-wise sorted with payment verification)
  const handleExportCSV = () => {
    const sorted = [...filteredStudents].sort((a, b) => {
      const clsA = a.studentClass || 'Class 10';
      const clsB = b.studentClass || 'Class 10';
      const orderA = STANDARD_CLASSES.indexOf(clsA);
      const orderB = STANDARD_CLASSES.indexOf(clsB);
      if (orderA !== -1 && orderB !== -1) return orderA - orderB;
      if (orderA !== -1) return -1;
      if (orderB !== -1) return 1;
      return clsA.localeCompare(clsB);
    });

    const dataToExport = sorted.map((s, idx) => ({
      'ক্রমি নং (SL)': idx + 1,
      'শ্রেণি (Class)': s.studentClass || 'Class 10',
      'শিক্ষার্থীর আইডি (Student ID)': s.studentId,
      'শিক্ষার্থীর নাম (Student Name)': s.name,
      'মোবাইল নম্বর (Contact Mobile)': s.mobileNumber,
      'কোর্স / প্রোগ্রাম (Course)': s.programme,
      'ব্যাচ ও সময়সূচি (Batch Schedule)': s.batchTime || 'N/A',
      'নির্ধারিত মোট কোর্স ফি (Total Fee BDT)': s.totalFee,
      'পরিশোধিত ফি (Paid Amount BDT)': s.paidAmount,
      'বকেয়া ফি (Due Balance BDT)': s.dueAmount,
      'পেমেন্ট প্রদান করা হয়েছে কি না (Payment Made?)':
        s.paidAmount > 0
          ? s.dueAmount === 0
            ? 'হ্যাঁ (সম্পূর্ণ পরিশোধিত)'
            : 'হ্যাঁ (আংশিক পরিশোধিত)'
          : 'না (কোনো ফি দেওয়া হয়নি)',
      'ফি পরিশোধ স্ট্যাটাস (Payment Status)':
        s.dueAmount === 0
          ? 'পরিশোধ সম্পন্ন (Fully Paid)'
          : s.paidAmount > 0
          ? 'আংশিক পরিশোধ (Partial)'
          : 'পরিশোধ বাকি (Unpaid / Full Due)',
      'সর্বশেষ পেমেন্ট তারিখ (Last Payment Date)': s.lastPaymentDate || 'পরিশোধ রেকর্ড নেই',
      'ভর্তির তারিখ (Admission Date)': s.admissionDate,
      'ক্যাম্পাস শাখা (Campus Branch)': s.branch,
    }));
    exportToCSV(`Atomic_Students_Classwise_Payment_Ledger_${selectedBranch}`, dataToExport);
    showToast('success', 'Student Ledger Exported', 'শ্রেণিভিত্তিক ও পেমেন্ট বিবরণীসহ এক্সেল/CSV ফাইল তৈরি হয়েছে');
  };

  // ==========================================
  // Handler 1: ১. নতুন শিক্ষার্থী ভর্তি সাবমিশন
  // ==========================================
  const handleCreateStudentAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'নাম প্রদান করুন', 'শিক্ষার্থীর নাম আবশ্যক।');
      return;
    }
    if (!mobileNumber.trim()) {
      showToast('error', 'মোবাইল নম্বর প্রদান করুন', 'যোগাযোগের মোবাইল নম্বর আবশ্যক।');
      return;
    }
    if (!programme.trim()) {
      showToast('error', 'কোর্স নাম টাইপ করুন', 'ভর্তিকৃত কোর্স বা প্রোগ্রামের নাম আবশ্যক।');
      return;
    }

    const studentId = `AI-ST-${Math.floor(1000 + Math.random() * 9000)}`;
    const total = Math.max(0, Number(totalFee) || 0);
    const paid = Math.max(0, Number(initialPayment) || 0);
    const due = Math.max(0, total - paid);
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const officerName = currentUser ? currentUser.name : 'Anirban Ghosh (Founder)';

    const newStudent: Student = {
      id: `std_${Date.now()}`,
      studentId,
      name: name.trim(),
      mobileNumber: mobileNumber.trim(),
      studentClass: studentClass.trim() || 'Class 10',
      programme: programme.trim(),
      batchTime: batchTime.trim() || undefined,
      totalFee: total,
      paidAmount: paid,
      dueAmount: due,
      branch,
      admissionDate: today,
      lastPaymentDate: paid > 0 ? today : undefined,
      paymentHistory:
        paid > 0
          ? [
              {
                id: `pay_${Date.now()}`,
                date: today,
                time: currentTime,
                amount: paid,
                method: admissionPayMethod,
                transactionId: admissionTrxId.trim() || undefined,
                receivedBy: officerName,
                receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
                note: admissionNotes.trim() || 'ভর্তিকালীন ফি ও প্রাথমিক জমা',
              },
            ]
          : [],
    };

    onAddStudent(newStudent);
    setIsAddModalOpen(false);

    if (paid > 0) {
      showToast(
        'success',
        'নতুন শিক্ষার্থী ভর্তি ও ফি জমা সম্পন্ন!',
        `${name} (${studentId}) সফলভাবে ${studentClass || 'Class 10'}-এ ভর্তি হয়েছে এবং ৳${paid.toLocaleString()} জমা হয়েছে।`
      );
    } else {
      showToast(
        'success',
        'নতুন শিক্ষার্থী ভর্তি সম্পন্ন!',
        `${name} (${studentId}) সফলভাবে ${studentClass || 'Class 10'}-এ ভর্তি হয়েছে। মোট নির্ধারিত ফি: ৳${total.toLocaleString()}`
      );
    }

    // Reset admission form fields
    setName('');
    setMobileNumber('');
    setGuardianContact('');
    setStudentClass('Class 10');
    setProgramme('');
    setBatchTime('');
    setTotalFee('');
    setInitialPayment('0');
    setAdmissionTrxId('');
    setAdmissionNotes('');
  };

  // ==========================================
  // Handler 2: ২. শিক্ষার্থীর ফি পরিশোধ সাবমিশন
  // ==========================================
  const handleOpenFeePaymentModal = (student?: Student) => {
    if (student) {
      setFeeSelectedStudentId(student.id);
      setPayAmount(student.dueAmount > 0 ? student.dueAmount : '');
    } else {
      // Pick first student with due or first student
      const dueStudent = branchStudents.find((s) => s.dueAmount > 0) || branchStudents[0];
      if (dueStudent) {
        setFeeSelectedStudentId(dueStudent.id);
        setPayAmount(dueStudent.dueAmount > 0 ? dueStudent.dueAmount : '');
      } else {
        setFeeSelectedStudentId('');
        setPayAmount('');
      }
    }
    setPayTrxId('');
    setPayNote('নিয়মিত কোর্স ফি কিস্তি');
    setIsFeeModalOpen(true);
  };

  const handleRecordFeePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForFee) {
      showToast('error', 'শিক্ষার্থী নির্বাচন করুন', 'অনুগ্রহ করে ফি পরিশোধের জন্য শিক্ষার্থী সিলেক্ট করুন।');
      return;
    }

    const numericAmount = Number(payAmount) || 0;
    if (numericAmount <= 0) {
      showToast('error', 'সঠিক পরিমাণ লিখুন', 'ফি জমার পরিমাণ ১ টাকার বেশি হতে হবে।');
      return;
    }

    const noteText = payTrxId.trim()
      ? `${payNote.trim()} (TrxID: ${payTrxId.trim()})`
      : payNote.trim() || 'কোর্স ফি পরিশোধ';

    onRecordPayment(selectedStudentForFee.id, numericAmount, payMethod, noteText);

    showToast(
      'success',
      'শিক্ষার্থীর ফি আদায় সম্পন্ন!',
      `${selectedStudentForFee.name}-এর কাছ থেকে ৳${numericAmount.toLocaleString()} গ্রহণ করা হয়েছে এবং মানি রসিদ তৈরি হয়েছে।`
    );

    setIsFeeModalOpen(false);
    setPayAmount('');
    setPayTrxId('');
  };

  const handleDelete = (student: Student) => {
    setConfirmStudentToDelete(student);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#fdfbf7] p-5 sm:p-6 rounded-2xl border border-[#d9c7b4] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#521218] font-serif">
                শিক্ষার্থী ভর্তি ও ফি ব্যবস্থাপনা (Student Admission & Fee Management)
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f6eee2] text-[#6d1a22] border border-[#d9c7b4]">
                Narayanganj Campus
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              ১. নতুন শিক্ষার্থী ভর্তি ও ২. শিক্ষার্থীর নিয়মিত ফি পরিশোধ — দুটি স্বতন্ত্র ব্যবস্থাপনা মডিউল
            </p>
          </div>

          {/* Action Buttons: Clearly Separated Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4] font-bold text-xs transition-colors cursor-pointer"
              title="শিক্ষার্থী ভর্তি ও ফি তালিকা এক্সেল ডাউনলোড"
            >
              <Download size={14} />
              <span>এক্সেল (.csv)</span>
            </button>

            {/* Button 1: নতুন শিক্ষার্থী ভর্তি */}
            <button
              onClick={() => {
                setActiveSection('admission');
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              title="নতুন শিক্ষার্থী ভর্তি করুন"
            >
              <UserPlus size={16} />
              <span>+ নতুন শিক্ষার্থী ভর্তি</span>
            </button>

            {/* Button 2: শিক্ষার্থীর ফি পরিশোধ */}
            <button
              onClick={() => {
                setActiveSection('fee_payment');
                handleOpenFeePaymentModal();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              title="ভর্তিকৃত শিক্ষার্থীর বকেয়া বা নতুন কিস্তি ফি গ্রহণ করুন"
            >
              <CreditCard size={16} />
              <span>+ শিক্ষার্থীর ফি পরিশোধ</span>
            </button>
          </div>
        </div>

        {/* Section Sub-Navigation Tabs: 1. নতুন শিক্ষার্থী ভর্তি vs 2. শিক্ষার্থীর ফি পরিশোধ */}
        <div className="mt-5 pt-4 border-t border-[#ebdccf] flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('admission')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSection === 'admission'
                ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-sm ring-2 ring-[#6d1a22]'
                : 'bg-white text-gray-700 hover:bg-[#faf4ea] border border-[#d9c7b4]'
            }`}
          >
            <UserPlus size={16} className={activeSection === 'admission' ? 'text-[#fde4cb]' : 'text-[#6d1a22]'} />
            <span>১. নতুন শিক্ষার্থী ভর্তি ও তালিকা</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                activeSection === 'admission' ? 'bg-[#501117] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {totalStudentsCount} জন
            </span>
          </button>

          <button
            onClick={() => setActiveSection('fee_payment')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSection === 'fee_payment'
                ? 'bg-[#166534] text-white shadow-sm ring-2 ring-[#166534]'
                : 'bg-white text-gray-700 hover:bg-[#faf4ea] border border-[#d9c7b4]'
            }`}
          >
            <CreditCard size={16} className={activeSection === 'fee_payment' ? 'text-emerald-200' : 'text-emerald-700'} />
            <span>২. শিক্ষার্থীর ফি পরিশোধ ও খতিয়ান</span>
            {dueStudentsCount > 0 && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                  activeSection === 'fee_payment' ? 'bg-emerald-950 text-white' : 'bg-rose-100 text-rose-700 font-bold'
                }`}
              >
                {dueStudentsCount} জনের বকেয়া
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: নতুন শিক্ষার্থী ভর্তি (Student Admission Section) */}
      {/* ========================================================================= */}
      {activeSection === 'admission' && (
        <div className="space-y-5">
          {/* Quick Admission Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-[#d9c7b4] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">মোট ভর্তিকৃত শিক্ষার্থী</p>
                <h3 className="text-2xl font-black text-[#521218] font-mono mt-1">
                  {totalStudentsCount} <span className="text-xs font-sans text-gray-500 font-semibold">জন</span>
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#6d1a22]/10 text-[#6d1a22] flex items-center justify-center">
                <Users size={22} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9c7b4] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">মোট ধার্যকৃত কোর্স ফি</p>
                <h3 className="text-2xl font-black text-[#521218] font-mono mt-1">
                  ৳{totalAgreedFee.toLocaleString()}
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9c7b4] shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">নতুন ভর্তি নিবন্ধন করুন</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6d1a22] text-[#fcf7ee] hover:bg-[#521218] text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <UserPlus size={13} />
                  <span>ভর্তি ফর্ম পূরণ করুন</span>
                </button>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#f8efe3] text-[#6d1a22] flex items-center justify-center">
                <PlusCircle size={22} />
              </div>
            </div>
          </div>

          {/* Search, Class Filter Tabs & Actions */}
          <div className="space-y-3">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="শিক্ষার্থীর নাম, শ্রেণি (Class 6, 7...), আইডি (AI-ST-...), মোবাইল বা কোর্স লিখে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#fdfbf7] border border-[#d9c7b4] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6d1a22] focus:border-transparent text-gray-800 transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Actions: Excel Download & Add Student */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="শ্রেণিভিত্তিক পেমেন্ট স্ট্যাটাসসহ এক্সেল ডাউনলোড"
                >
                  <Download size={14} />
                  <span>এক্সেল ডাউনলোড (শ্রেণিভিত্তিক খতিয়ান)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-2.5 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <UserPlus size={14} />
                  <span>+ নতুন শিক্ষার্থী ভর্তি</span>
                </button>
              </div>
            </div>

            {/* Class Group Filter Tabs (Class 6, 7, 8, 9, 10) */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#f8efe3] rounded-2xl border border-[#e5d5c4]">
              <span className="text-xs font-bold text-[#6d1a22] px-2 flex items-center gap-1">
                <Layers size={14} />
                <span>শ্রেণি গ্রুপ ফিল্টার:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedClassFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedClassFilter === 'all'
                    ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-[#faeedf] border border-[#e2d0bd]'
                }`}
              >
                <span>সকল শ্রেণি (All)</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    selectedClassFilter === 'all' ? 'bg-[#501117] text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {branchStudents.length}
                </span>
              </button>

              {STANDARD_CLASSES.map((cls) => {
                const count = branchStudents.filter((s) => (s.studentClass || 'Class 10') === cls).length;
                const isSelected = selectedClassFilter === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClassFilter(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#6d1a22] text-[#fcf7ee] shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-[#faeedf] border border-[#e2d0bd]'
                    }`}
                  >
                    <span>{cls}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isSelected ? 'bg-[#501117] text-white' : 'bg-[#f0e3d3] text-[#6d1a22]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admitted Students Grouped by Class */}
          <div className="space-y-5">
            {(() => {
              // Determine which classes to display based on selected filter
              const classesToRender =
                selectedClassFilter === 'all'
                  ? Array.from(
                      new Set([
                        'Class 6',
                        'Class 7',
                        'Class 8',
                        'Class 9',
                        'Class 10',
                        ...branchStudents.map((s) => s.studentClass || 'Class 10'),
                      ])
                    )
                  : [selectedClassFilter];

              return classesToRender.map((clsName) => {
                const classStudents = branchStudents.filter(
                  (s) => (s.studentClass || 'Class 10') === clsName
                );

                // Filter within this class based on search and due status
                const classFilteredStudents = classStudents.filter((s) => {
                  const matchSearch =
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.mobileNumber.includes(searchTerm) ||
                    s.programme.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (s.studentClass && s.studentClass.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (s.batchTime && s.batchTime.toLowerCase().includes(searchTerm.toLowerCase()));
                  if (!matchSearch) return false;
                  if (filterDue === 'due') return s.dueAmount > 0;
                  if (filterDue === 'cleared') return s.dueAmount === 0;
                  return true;
                });

                const groupTotalFee = classStudents.reduce((acc, s) => acc + (s.totalFee || 0), 0);
                const groupPaidFee = classStudents.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
                const groupDueFee = classStudents.reduce((acc, s) => acc + (s.dueAmount || 0), 0);
                const groupClearedCount = classStudents.filter((s) => s.dueAmount === 0).length;
                const groupDueCount = classStudents.filter((s) => s.dueAmount > 0).length;

                return (
                  <div
                    key={clsName}
                    className="bg-[#fdfbf7] rounded-2xl border border-[#d9c7b4] overflow-hidden shadow-xs"
                  >
                    {/* Class Group Header */}
                    <div className="p-4 bg-gradient-to-r from-[#f8f1e7] to-[#f4e7d7] border-b border-[#ebdccf] flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6d1a22] text-[#fcf7ee] flex items-center justify-center font-black shadow-xs">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-[#450e13] font-serif">
                              {clsName} এর শিক্ষার্থী গ্রুপ (Admission Group)
                            </h3>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#6d1a22] text-white">
                              {classStudents.length} জন
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">
                            পরিশোধ সম্পন্ন: <strong>{groupClearedCount}</strong> জন • বকেয়া রয়েছে:{' '}
                            <strong className="text-rose-700">{groupDueCount}</strong> জন
                          </p>
                        </div>
                      </div>

                      {/* Class Financial Metrics & Quick Add */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-xl border border-[#d9c7b4] font-mono">
                          <span className="text-gray-500">মোট ফি:</span>
                          <span className="font-bold text-gray-900">৳{groupTotalFee.toLocaleString()}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-emerald-700 font-bold">জমা: ৳{groupPaidFee.toLocaleString()}</span>
                          <span className="text-gray-300">|</span>
                          <span className={`font-bold ${groupDueFee > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            বকেয়া: ৳{groupDueFee.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setStudentClass(clsName);
                            setIsAddModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#6d1a22] hover:bg-[#521218] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <UserPlus size={13} />
                          <span>+ {clsName}-এ ভর্তি</span>
                        </button>
                      </div>
                    </div>

                    {/* Class Students Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-[#6d1a22] text-[#fcf7ee] font-semibold text-[11px] sm:text-xs">
                          <tr>
                            <th className="py-2.5 px-4">আইডি ও নাম</th>
                            <th className="py-2.5 px-3 text-center">শ্রেণি</th>
                            <th className="py-2.5 px-3">যোগাযোগ</th>
                            <th className="py-2.5 px-3">কোর্স / প্রোগ্রাম</th>
                            <th className="py-2.5 px-3">ব্যাচ ও সময়</th>
                            <th className="py-2.5 px-3 text-right">মোট ফি</th>
                            <th className="py-2.5 px-3 text-right">পরিশোধিত</th>
                            <th className="py-2.5 px-3 text-right">বকেয়া</th>
                            <th className="py-2.5 px-3 text-center">পেমেন্ট অবস্থা</th>
                            <th className="py-2.5 px-3 text-center">ভর্তির তারিখ</th>
                            <th className="py-2.5 px-4 text-center">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee0d3] bg-white">
                          {classFilteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="py-8 text-center text-gray-400">
                                <Users size={28} className="mx-auto mb-1 text-gray-300" />
                                <p className="text-xs font-medium text-gray-500">
                                  {clsName}-এ এখনও কোনো শিক্ষার্থী ভর্তি হয়নি বা সার্চে পাওয়া যায়নি।
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStudentClass(clsName);
                                    setIsAddModalOpen(true);
                                  }}
                                  className="mt-2.5 px-3.5 py-1.5 rounded-lg bg-[#6d1a22] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 hover:bg-[#521218] transition-all"
                                >
                                  <UserPlus size={13} />
                                  <span>{clsName}-এ প্রথম শিক্ষার্থী ভর্তি করুন</span>
                                </button>
                              </td>
                            </tr>
                          ) : (
                            classFilteredStudents.map((s) => {
                              const isFullyPaid = s.dueAmount === 0;
                              const isPartial = s.paidAmount > 0 && s.dueAmount > 0;
                              const isUnpaid = s.paidAmount === 0;

                              return (
                                <tr key={s.id} className="hover:bg-[#faf4ea]/60 transition-colors">
                                  <td className="py-2.5 px-4">
                                    <div className="font-extrabold text-gray-900 text-xs sm:text-sm">{s.name}</div>
                                    <span className="inline-block font-mono font-bold text-[#6d1a22] bg-[#f6eee2] px-1.5 py-0.5 rounded text-[10px] mt-0.5">
                                      {s.studentId}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-3 text-center">
                                    <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[11px] bg-[#6d1a22]/10 text-[#6d1a22] border border-[#6d1a22]/20 font-mono">
                                      {s.studentClass || clsName}
                                    </span>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-1 text-gray-800 font-mono text-xs font-semibold">
                                      <Phone size={11} className="text-gray-400" />
                                      <span>{s.mobileNumber}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">{s.branch} Campus</span>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-[#6d1a22] text-xs">{s.programme}</div>
                                  </td>

                                  <td className="py-2.5 px-3">
                                    <div className="text-gray-700 text-xs font-medium">{s.batchTime || 'সাধারণ ব্যাচ'}</div>
                                  </td>

                                  <td className="py-2.5 px-3 text-right font-bold text-gray-900 font-mono tabular-nums text-xs">
                                    ৳{s.totalFee.toLocaleString()}
                                  </td>

                                  <td className="py-2.5 px-3 text-right font-bold text-[#15803d] font-mono tabular-nums text-xs">
                                    ৳{s.paidAmount.toLocaleString()}
                                  </td>

                                  <td className="py-2.5 px-3 text-right font-black text-[#be123c] font-mono tabular-nums text-xs">
                                    ৳{s.dueAmount.toLocaleString()}
                                  </td>

                                  {/* Payment Status Column */}
                                  <td className="py-2.5 px-3 text-center">
                                    {isFullyPaid && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        <CheckCircle2 size={11} />
                                        <span>পরিশোধ সম্পন্ন</span>
                                      </span>
                                    )}
                                    {isPartial && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                        <Clock size={11} />
                                        <span>আংশিক পরিশোধ</span>
                                      </span>
                                    )}
                                    {isUnpaid && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                        <AlertCircle size={11} />
                                        <span>পরিশোধ বাকি</span>
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-2.5 px-3 text-center font-mono text-[11px] text-gray-600">
                                    {s.admissionDate}
                                  </td>

                                  <td className="py-2.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => handleOpenFeePaymentModal(s)}
                                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#166534] hover:bg-[#14532d] text-white transition-colors shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1"
                                        title={`${s.name}-এর ফি জমা নিন`}
                                      >
                                        <CreditCard size={12} />
                                        <span>ফি দিন</span>
                                      </button>

                                      {onDeleteStudent && (
                                        <button
                                          onClick={() => handleDelete(s)}
                                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                          title="শিক্ষার্থী রেকর্ড মুছে ফেলুন"
                                        >
                                          <Trash2 size={13} />
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
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: শিক্ষার্থীর ফি পরিশোধ (Student Fee Payment Section) */}
      {/* ========================================================================= */}
      {activeSection === 'fee_payment' && (
        <div className="space-y-5">
          {/* Quick Fee Collection Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white rounded-2xl border border-[#d9c7b4] shadow-xs">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">মোট ধার্যকৃত কোর্স ফি</p>
              <h3 className="text-xl sm:text-2xl font-black text-[#521218] font-mono mt-1">
                ৳{totalAgreedFee.toLocaleString()}
              </h3>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9c7b4] shadow-xs">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">সর্বমোট সংগৃহীত ফি</p>
              <h3 className="text-xl sm:text-2xl font-black text-[#15803d] font-mono mt-1">
                ৳{totalCollectedFee.toLocaleString()}
              </h3>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9c7b4] shadow-xs">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">সর্বমোট প্রদেয় বকেয়া</p>
              <h3 className="text-xl sm:text-2xl font-black text-[#be123c] font-mono mt-1">
                ৳{totalOutstandingDue.toLocaleString()}
              </h3>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9c7b4] shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">বকেয়া রয়েছে এমন ছাত্র</p>
                <div className="text-lg font-black text-rose-700 font-mono mt-0.5">
                  {dueStudentsCount} জন শিক্ষার্থী
                </div>
              </div>
              <button
                onClick={() => handleOpenFeePaymentModal()}
                className="mt-2 w-full py-1.5 px-3 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CreditCard size={13} />
                <span>+ ফি জমা নিন</span>
              </button>
            </div>
          </div>

          {/* Search & Due Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="শিক্ষার্থীর নাম, আইডি (AI-ST-...), মোবাইল বা কোর্স লিখে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#fdfbf7] border border-[#d9c7b4] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-transparent text-gray-800 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#fdfbf7] border border-[#d9c7b4] p-1 rounded-xl">
              <button
                onClick={() => setFilterDue('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterDue === 'all'
                    ? 'bg-[#166534] text-white'
                    : 'text-gray-600 hover:text-emerald-800 hover:bg-[#f8f1e7]'
                }`}
              >
                সকল ({branchStudents.length})
              </button>
              <button
                onClick={() => setFilterDue('due')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterDue === 'due'
                    ? 'bg-[#be123c] text-white'
                    : 'text-gray-600 hover:text-[#be123c] hover:bg-rose-50'
                }`}
              >
                বকেয়া রয়েছে ({dueStudentsCount})
              </button>
              <button
                onClick={() => setFilterDue('cleared')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterDue === 'cleared'
                    ? 'bg-[#15803d] text-white'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                পরিশোধ সম্পন্ন ({branchStudents.length - dueStudentsCount})
              </button>
            </div>
          </div>

          {/* Student Fee Payment Ledger Table */}
          <div className="bg-[#fdfbf7] rounded-2xl border border-[#d9c7b4] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#f8f1e7] border-b border-[#ebdccf] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-[#166534]" />
                <h3 className="font-black text-sm text-[#14532d]">
                  শিক্ষার্থী ফি পরিশোধ ও বকেয়া খতিয়ান (Fee Payment Ledger)
                </h3>
              </div>
              <span className="text-xs font-semibold text-gray-600">
                প্রদর্শিত: <strong>{filteredStudents.length}</strong> জন
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#166534] text-white font-semibold">
                  <tr>
                    <th className="py-3 px-4">শিক্ষার্থীর নাম ও আইডি</th>
                    <th className="py-3 px-4">কোর্স / প্রোগ্রাম</th>
                    <th className="py-3 px-4 text-right">মোট কোর্স ফি</th>
                    <th className="py-3 px-4 text-right">পরিশোধিত অর্থ</th>
                    <th className="py-3 px-4 text-right">অবশিষ্ট বকেয়া</th>
                    <th className="py-3 px-4 text-center">সর্বশেষ পেমেন্ট</th>
                    <th className="py-3 px-4 text-center">ফি আদায় ও রসিদ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee0d3] bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Users size={36} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">কোনো শিক্ষার্থীর রেকর্ড পাওয়া যায়নি।</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const hasDue = s.dueAmount > 0;
                      const latestPay = s.paymentHistory[s.paymentHistory.length - 1];

                      return (
                        <tr key={s.id} className="hover:bg-[#faf4ea]/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-gray-900 text-sm">{s.name}</span>
                              <span className="font-mono font-bold text-[#6d1a22] bg-[#f8efe3] px-1.5 py-0.2 rounded text-[10px] border border-[#e5d5c4]">
                                {s.studentClass || 'Class 10'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                              <span className="font-mono font-bold text-[#166534] bg-[#eef7ee] px-1.5 py-0.5 rounded">
                                {s.studentId}
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Phone size={10} /> {s.mobileNumber}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-[#6d1a22]">{s.programme}</div>
                            <div className="text-[11px] text-gray-500">{s.batchTime || 'সাধারণ ব্যাচ'}</div>
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-gray-800 font-mono tabular-nums">
                            ৳{s.totalFee.toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-right font-black text-[#15803d] font-mono tabular-nums">
                            ৳{s.paidAmount.toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-right font-mono tabular-nums">
                            {hasDue ? (
                              <span className="inline-block px-2 py-0.5 rounded font-black text-[#be123c] bg-rose-50 border border-rose-200">
                                ৳{s.dueAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-sans">
                                পরিশোধিত
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center font-mono text-xs text-gray-600">
                            {s.lastPaymentDate || s.admissionDate}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Direct Fee Collection Button */}
                              <button
                                onClick={() => handleOpenFeePaymentModal(s)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1 ${
                                  hasDue
                                    ? 'bg-[#166534] hover:bg-[#14532d] text-white'
                                    : 'bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4]'
                                }`}
                                title={hasDue ? 'বকেয়া কিস্তি আদায়' : 'ফি পরিশোধ / নতুন কিস্তি'}
                              >
                                <CreditCard size={12} />
                                <span>{hasDue ? 'ফি আদায়' : 'ফি জমা'}</span>
                              </button>

                              {latestPay && (
                                <button
                                  onClick={() =>
                                    onViewReceipt({
                                      id: `rcp_view_${s.id}`,
                                      receiptNo: latestPay.receiptNo,
                                      type: 'student',
                                      targetId: s.id,
                                      targetName: s.name,
                                      studentId: s.studentId,
                                      contactNumber: s.mobileNumber,
                                      programme: s.programme,
                                      branch: s.branch,
                                      amountPaid: latestPay.amount,
                                      totalFee: s.totalFee,
                                      dueAmount: s.dueAmount,
                                      date: latestPay.date,
                                      time: latestPay.time,
                                      receiverName: latestPay.receivedBy,
                                      paymentMethod: latestPay.method,
                                      transactionId: latestPay.transactionId,
                                    })
                                  }
                                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4] transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                                  title="সর্বশেষ মানি রসিদ দেখুন ও প্রিন্ট করুন"
                                >
                                  <Receipt size={13} />
                                  <span>রসিদ</span>
                                </button>
                              )}

                              {s.paymentHistory.length > 0 && (
                                <button
                                  onClick={() => setHistoryModalStudent(s)}
                                  className="px-2 py-1 text-xs font-bold rounded-lg bg-white hover:bg-[#faf4ea] text-gray-700 border border-[#d9c7b4] transition-colors flex items-center gap-1 cursor-pointer"
                                  title="সকল কিস্তি ও পেমেন্ট হিস্ট্রি দেখুন"
                                >
                                  <History size={13} />
                                  <span>হিস্ট্রি</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: নতুন শিক্ষার্থী ভর্তি ফরম (New Student Admission Form Modal) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <UserPlus size={19} />
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    ১. নতুন শিক্ষার্থী ভর্তি ফরম (New Student Admission Registration)
                  </h3>
                  <p className="text-[10px] text-[#fde4cb]">
                    শিক্ষার্থীর তথ্য, নির্ধারিত কোর্স ফি ও ব্যাচ নির্ধারণ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#fcf7ee] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStudentAdmission} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    শিক্ষার্থীর পূর্ণ নাম (Student Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: তানভীর আহমেদ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#450e13]">
                      শ্রেণি / ক্লাস (Class / Grade) *
                    </label>
                    <span className="text-[10px] text-gray-500 font-medium">টাইপ বা বাটন চাপুন</span>
                  </div>
                  <input
                    type="text"
                    required
                    list="academic-classes-list"
                    placeholder="যেমন: Class 6, Class 7, Class 8, Class 9, Class 10"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-bold text-gray-800"
                  />
                  <datalist id="academic-classes-list">
                    <option value="Class 6" />
                    <option value="Class 7" />
                    <option value="Class 8" />
                    <option value="Class 9" />
                    <option value="Class 10" />
                    <option value="Class 11 (HSC 1st)" />
                    <option value="Class 12 (HSC 2nd)" />
                  </datalist>

                  {/* Fast 1-click class pills */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setStudentClass(cls)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-md border font-bold transition-all cursor-pointer ${
                          studentClass === cls
                            ? 'bg-[#6d1a22] text-white border-[#6d1a22] shadow-2xs scale-102'
                            : 'bg-[#faf4ea] text-gray-700 border-[#e5d5c4] hover:bg-[#f3e6d5]'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    মোবাইল নম্বর (Contact Mobile) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01712-345678"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#450e13]">
                      ভর্তিকৃত কোর্স / প্রোগ্রাম (Academic Course) *
                    </label>
                    <span className="text-[10px] text-gray-500 font-medium">টাইপ করুন</span>
                  </div>
                  <input
                    type="text"
                    required
                    list="academic-course-list"
                    placeholder="যেমন: HSC Medical & Dental Physics+Chem বা নতুন কোর্স"
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-medium text-gray-800"
                  />
                  <datalist id="academic-course-list">
                    <option value="HSC Medical & Dental Physics+Chem" />
                    <option value="Engineering BUET Advance Mathematics" />
                    <option value="HSC Biology & Molecular Genetics" />
                    <option value="Physics Special Mechanics & Optics" />
                    <option value="SSC Science Foundation All-in-One" />
                    <option value="HSC Higher Mathematics 1st & 2nd Paper" />
                    <option value="HSC Medical Chemistry Special" />
                  </datalist>

                  {/* Fast 1-click suggestion chips */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {[
                      'HSC Medical & Dental',
                      'BUET Mathematics',
                      'Physics Special',
                      'SSC Foundation',
                    ].map((courseName) => (
                      <button
                        key={courseName}
                        type="button"
                        onClick={() => setProgramme(courseName)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          programme === courseName
                            ? 'bg-[#6d1a22] text-white border-[#6d1a22] font-bold shadow-2xs'
                            : 'bg-[#faf4ea] text-gray-700 border-[#e5d5c4] hover:bg-[#f3e6d5]'
                        }`}
                      >
                        + {courseName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    ব্যাচ ও সময়সূচি (Batch Schedule / Time)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: রবি-মঙ্গল-বৃহস্পতি (সকাল ১০:০০)"
                    value={batchTime}
                    onChange={(e) => setBatchTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    ক্যাম্পাস শাখা (Campus Branch) *
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as Branch)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-medium"
                  >
                    <option value="Narayanganj">Narayanganj Campus (নারায়ণগঞ্জ শাখা)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  অভিভাবকের মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 01812-345678"
                  value={guardianContact}
                  onChange={(e) => setGuardianContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-mono"
                />
              </div>

              {/* Course Fee & Initial Payment Calculation */}
              <div className="p-4 bg-[#f8f1e7] rounded-xl border border-[#d9c7b4] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#450e13] mb-1">
                      মোট নির্ধারিত কোর্স ফি (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="যেমন: ১২০০০"
                      value={totalFee}
                      onChange={(e) => setTotalFee(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-bold bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#15803d] mb-1">
                      ভর্তিকালীন প্রাথমিক জমা (৳) <span className="text-[10px] text-gray-500 font-normal">(ঐচ্ছিক, ০ হলে পরে পরিশোধ করবে)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="০ (বা জমার পরিমাণ)"
                      value={initialPayment}
                      onChange={(e) => setInitialPayment(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-black text-[#15803d] bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Live balance computation */}
                <div className="flex items-center justify-between pt-2 border-t border-[#e2d2c1] text-xs">
                  <span className="font-semibold text-gray-700">হিসাবকৃত অবশিষ্ট বকেয়া:</span>
                  <span
                    className={`font-black text-sm ${
                      (Number(totalFee) || 0) - (Number(initialPayment) || 0) > 0
                        ? 'text-[#be123c]'
                        : 'text-emerald-700'
                    }`}
                  >
                    ৳{Math.max(0, (Number(totalFee) || 0) - (Number(initialPayment) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* If initial payment > 0, show payment method fields */}
              {Number(initialPayment) > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      জমার মাধ্যম (Payment Method) *
                    </label>
                    <select
                      value={admissionPayMethod}
                      onChange={(e) => setAdmissionPayMethod(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none capitalize font-medium"
                    >
                      <option value="cash">নগদ গ্রহণ (Cash Counter)</option>
                      <option value="bkash">বিকাশ (bKash)</option>
                      <option value="nagad">নগদ (Nagad)</option>
                      <option value="rocket">রকেট (Rocket)</option>
                      <option value="bank">ব্যাংক ডিপোজিট / চেক (Bank Wire)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      ট্রানজেকশন আইডি (Trx ID - ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: 9J8B7G6F5"
                      value={admissionTrxId}
                      onChange={(e) => setAdmissionTrxId(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  ভর্তি সংক্রান্ত বিশেষ মন্তব্য (Admission Notes)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ১ মাসের ফি মওকুফ বা বিশেষ স্পেশাল ব্যাচ নোট"
                  value={admissionNotes}
                  onChange={(e) => setAdmissionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-98"
                >
                  <UserPlus size={18} />
                  <span>নতুন শিক্ষার্থী ভর্তি নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: শিক্ষার্থীর ফি পরিশোধ ফরম (Student Fee Payment Modal) */}
      {/* ========================================================================= */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#166534] overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#166534] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#14532d]">
              <div className="flex items-center gap-2">
                <CreditCard size={19} />
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    ২. শিক্ষার্থীর ফি পরিশোধ ও মানি রসিদ (Student Fee Payment)
                  </h3>
                  <p className="text-[10px] text-emerald-200">
                    কোর্স ফি কিস্তি গ্রহণ, বকেয়া সমন্বয় ও স্বয়ংক্রিয় মানি রসিদ ইস্যু
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordFeePayment} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Step 1: Select Student */}
              <div>
                <label className="block text-xs font-bold text-[#14532d] mb-1">
                  শিক্ষার্থী নির্বাচন করুন (Select Student) *
                </label>
                <select
                  required
                  value={feeSelectedStudentId}
                  onChange={(e) => setFeeSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-xl focus:ring-2 focus:ring-[#166534] focus:outline-none font-medium"
                >
                  <option value="">-- শিক্ষার্থী বাছাই করুন --</option>
                  {branchStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentId}) — [{s.studentClass || 'Class 10'}] — বকেয়া: ৳{s.dueAmount.toLocaleString()} [{s.programme}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Summary Card */}
              {selectedStudentForFee && (
                <div className="p-3.5 bg-[#f5fbf7] rounded-xl border border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">{selectedStudentForFee.name}</div>
                      <div className="text-xs text-gray-600 font-mono">
                        আইডি: <strong>{selectedStudentForFee.studentId}</strong> • ফোন: {selectedStudentForFee.mobileNumber}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {selectedStudentForFee.studentClass || 'Class 10'} • {selectedStudentForFee.programme}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <span className="block text-[10px] text-gray-500 font-bold uppercase">মোট কোর্স ফি</span>
                      <span className="font-mono font-extrabold text-xs text-gray-800">
                        ৳{selectedStudentForFee.totalFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-emerald-200">
                      <span className="block text-[10px] text-gray-500 font-bold uppercase">ইতিমধ্যে পরিশোধিত</span>
                      <span className="font-mono font-extrabold text-xs text-[#15803d]">
                        ৳{selectedStudentForFee.paidAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <span className="block text-[10px] text-rose-600 font-bold uppercase">বর্তমান বকেয়া</span>
                      <span className="font-mono font-black text-xs text-[#be123c]">
                        ৳{selectedStudentForFee.dueAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount to Pay */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#14532d]">
                    আদায়কৃত ফি এর পরিমাণ (৳) *
                  </label>
                  {selectedStudentForFee && selectedStudentForFee.dueAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => setPayAmount(selectedStudentForFee.dueAmount)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      সম্পূর্ণ বকেয়া (৳{selectedStudentForFee.dueAmount.toLocaleString()}) বসান
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="যেমন: ৩০০০"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm font-black text-[#15803d] bg-white border border-[#d9c7b4] rounded-xl focus:ring-2 focus:ring-[#166534] focus:outline-none font-mono"
                />
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#14532d] mb-1">
                    পরিশোধের মাধ্যম *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#166534] focus:outline-none capitalize font-medium"
                  >
                    <option value="cash">নগদ গ্রহণ (Cash Counter)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                    <option value="bank">ব্যাংক ট্রান্সফার / চেক (Bank)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14532d] mb-1">
                    ট্রানজেকশন আইডি (বিকাশ/নগদ হলে)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: TRX9281B7"
                    value={payTrxId}
                    onChange={(e) => setPayTrxId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#166534] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Installment note / remarks */}
              <div>
                <label className="block text-xs font-bold text-[#14532d] mb-1">
                  কিস্তি বা জমার বিবরণ (Installment Description)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ২য় কিস্তি, চলতি মাসের ফি ইত্যাদি"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#166534] focus:outline-none"
                />
              </div>

              {/* Logged in officer info */}
              <div className="p-3 bg-[#fdf8f0] rounded-xl border border-[#ebdccf] text-xs flex items-center justify-between">
                <span className="text-gray-600 font-medium">আদায়কারী কর্মকর্তা:</span>
                <span className="font-bold text-[#6d1a22]">
                  {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Anirban Ghosh (Founder)'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!selectedStudentForFee || !payAmount}
                  className="w-full py-3.5 px-4 bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-98"
                >
                  <Receipt size={18} />
                  <span>
                    {payAmount ? `৳${Number(payAmount).toLocaleString()} ফি জমা ও রসিদ তৈরি করুন` : 'ফি জমা ও রসিদ তৈরি করুন'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Payment History */}
      {historyModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden">
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <History size={18} />
                <h3 className="font-bold text-sm">
                  পেমেন্ট হিস্ট্রি: {historyModalStudent.name}
                </h3>
              </div>
              <button
                onClick={() => setHistoryModalStudent(null)}
                className="text-[#fcf7ee] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="text-xs text-gray-600 pb-2 border-b border-[#d9c7b4] flex justify-between items-center">
                <span>আইডি: <strong>{historyModalStudent.studentId}</strong></span>
                <span>কোর্স: <strong>{historyModalStudent.programme}</strong></span>
              </div>

              <div className="space-y-2">
                {historyModalStudent.paymentHistory.length === 0 ? (
                  <p className="text-center py-4 text-xs text-gray-500">কোনো পেমেন্ট হিস্ট্রি পাওয়া যায়নি।</p>
                ) : (
                  historyModalStudent.paymentHistory.map((pay, i) => (
                    <div
                      key={pay.id}
                      className="p-3 bg-white rounded-xl border border-[#d9c7b4] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-gray-900">
                          কিস্তি #{i + 1} — {pay.note || 'ফি পরিশোধ'}
                        </div>
                        <div className="text-gray-500 text-[11px] mt-0.5">
                          {pay.date} • {pay.time} • মাধ্যম: <span className="capitalize">{pay.method}</span>
                          {pay.transactionId && ` (Trx: ${pay.transactionId})`}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          রসিদ নং: {pay.receiptNo} • আদায়কারী: {pay.receivedBy}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-[#15803d]">
                          ৳{pay.amount.toLocaleString()}
                        </div>
                        <button
                          onClick={() => {
                            setHistoryModalStudent(null);
                            onViewReceipt({
                              id: `rcp_hist_${pay.id}`,
                              receiptNo: pay.receiptNo,
                              type: 'student',
                              targetId: historyModalStudent.id,
                              targetName: historyModalStudent.name,
                              studentId: historyModalStudent.studentId,
                              contactNumber: historyModalStudent.mobileNumber,
                              programme: historyModalStudent.programme,
                              branch: historyModalStudent.branch,
                              amountPaid: pay.amount,
                              totalFee: historyModalStudent.totalFee,
                              dueAmount: historyModalStudent.dueAmount,
                              date: pay.date,
                              time: pay.time,
                              receiverName: pay.receivedBy,
                              paymentMethod: pay.method,
                              transactionId: pay.transactionId,
                            });
                          }}
                          className="mt-1 text-[10px] text-[#6d1a22] font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Receipt size={10} /> রসিদ দেখুন
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmStudentToDelete}
        onClose={() => setConfirmStudentToDelete(null)}
        onConfirm={() => {
          if (confirmStudentToDelete && onDeleteStudent) {
            onDeleteStudent(confirmStudentToDelete.id);
            showToast('info', 'শিক্ষার্থী মুছে ফেলা হয়েছে', `${confirmStudentToDelete.name}-এর রেকর্ড সফলভাবে অপসারিত হয়েছে।`);
          }
        }}
        title="শিক্ষার্থী রেকর্ড মুছে ফেলতে চান?"
        message={`আপনি কি সত্যিই শিক্ষার্থী "${confirmStudentToDelete?.name}" (${confirmStudentToDelete?.studentId})-এর সকল ভর্তি ও ফি রেকর্ড মুছে ফেলতে চান?`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
      />
    </div>
  );
};
