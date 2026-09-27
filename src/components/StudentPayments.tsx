import React, { useState, useEffect } from 'react';
import { Student, ReceiptData, Branch, User } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { useToast } from './ToastContext';
import { ConfirmModal } from './ConfirmModal';
import {
  Users,
  Search,
  PlusCircle,
  Receipt,
  Phone,
  X,
  Download,
  Trash2,
  History,
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
}

export const StudentPayments: React.FC<StudentPaymentsProps> = ({
  students,
  onAddStudent,
  onRecordPayment,
  onDeleteStudent,
  onViewReceipt,
  selectedBranch,
  currentUser,
  isAddModalOpen: externalModalOpen,
  setIsAddModalOpen: setExternalModalOpen,
}) => {
  const { showToast } = useToast();
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setIsModalOpen = setExternalModalOpen || setInternalModalOpen;

  const [paymentModalStudent, setPaymentModalStudent] = useState<Student | null>(null);
  const [historyModalStudent, setHistoryModalStudent] = useState<Student | null>(null);
  const [confirmStudentToDelete, setConfirmStudentToDelete] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDue, setFilterDue] = useState<'all' | 'due' | 'cleared'>('all');

  // New Student Form State
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [programme, setProgramme] = useState('HSC Medical & Dental Physics+Chem');
  const [batchTime, setBatchTime] = useState('');
  const [branch, setBranch] = useState<Branch>('Narayanganj');
  const [totalFee, setTotalFee] = useState<string | number>('');
  const [initialPayment, setInitialPayment] = useState<string | number>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');

  // Quick Pay Modal State
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('cash');
  const [payNote, setPayNote] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmStudentToDelete) {
          setConfirmStudentToDelete(null);
        } else if (historyModalStudent) {
          setHistoryModalStudent(null);
        } else if (paymentModalStudent) {
          setPaymentModalStudent(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmStudentToDelete, historyModalStudent, paymentModalStudent, isModalOpen, setIsModalOpen]);

  // Filter students
  const filteredStudents = students
    .filter((s) => !s.branch || s.branch === 'Narayanganj')
    .filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.mobileNumber.includes(searchTerm) ||
        s.programme.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (filterDue === 'due') return s.dueAmount > 0;
      if (filterDue === 'cleared') return s.dueAmount === 0;
      return true;
    });

  const handleExportCSV = () => {
    const dataToExport = filteredStudents.map((s, idx) => ({
      'SL': idx + 1,
      'Student ID': s.studentId,
      'Student Name': s.name,
      'Mobile Number': s.mobileNumber,
      'Programme': s.programme,
      'Campus / Branch': s.branch,
      'Total Fee (BDT)': s.totalFee,
      'Paid (BDT)': s.paidAmount,
      'Due Balance (BDT)': s.dueAmount,
      'Admission Date': s.admissionDate,
      'Status': s.dueAmount > 0 ? 'Pending Due' : 'Cleared',
    }));
    exportToCSV(`Atomic_Students_Ledger_${selectedBranch.replace(/\s+/g, '_')}`, dataToExport);
    showToast('success', 'Student Ledger Exported', 'CSV file generated successfully');
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = `AI-ST-${Math.floor(1000 + Math.random() * 9000)}`;
    const paid = Number(initialPayment) || 0;
    const total = Number(totalFee) || 0;
    const due = Math.max(0, total - paid);

    const newStudent: Student = {
      id: `std_${Date.now()}`,
      studentId,
      name,
      mobileNumber,
      programme,
      batchTime,
      totalFee: total,
      paidAmount: paid,
      dueAmount: due,
      branch,
      admissionDate: new Date().toISOString().split('T')[0],
      lastPaymentDate: new Date().toISOString().split('T')[0],
      paymentHistory: paid > 0 ? [
        {
          id: `pay_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          amount: paid,
          method: paymentMethod,
          transactionId,
          receivedBy: currentUser ? currentUser.name : 'Anirban Ghosh (Founder)',
          receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
          note: notes || 'Admission & 1st Installment',
        },
      ] : [],
    };

    onAddStudent(newStudent);
    setIsModalOpen(false);
    showToast('success', 'Student Enrolled Successfully', `${name} enrolled. Money receipt issued!`);

    // Reset Form
    setName('');
    setMobileNumber('');
    setBatchTime('');
    setTotalFee('');
    setInitialPayment('');
    setTransactionId('');
    setNotes('');
  };

  const handleOpenQuickPay = (student: Student) => {
    setPaymentModalStudent(student);
    setPayAmount(student.dueAmount);
    setPayNote('Subsequent Fee Installment');
  };

  const handleRecordQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalStudent) return;
    const numericPay = Number(payAmount) || 0;
    onRecordPayment(paymentModalStudent.id, numericPay, payMethod, payNote);
    showToast('success', 'Due Payment Recorded', `৳${numericPay.toLocaleString()} received from ${paymentModalStudent.name}`);
    setPaymentModalStudent(null);
  };

  const handleDelete = (student: Student) => {
    setConfirmStudentToDelete(student);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fdfbf7] p-5 rounded-2xl border border-[#d9c7b4] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#521218] font-serif">
              শিক্ষার্থী ফি ও ভর্তি খতিয়ান (Student Fee Management)
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f6eee2] text-[#6d1a22] border border-[#d9c7b4]">
              {filteredStudents.length} জন শিক্ষার্থী
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            নতুন শিক্ষার্থী ভর্তি, কোর্স ফি আদায়, বকেয়া ট্র্যাকিং ও তাৎক্ষণিক স্বয়ংক্রিয় মানি রসিদ ইস্যু
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4] font-bold text-xs transition-colors cursor-pointer"
            title="শিক্ষার্থী তালিকা এক্সেল/সিএসভি ডাউনলোড করুন"
          >
            <Download size={14} />
            <span>এক্সেল এক্সপোর্ট (.csv)</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>+ নতুন শিক্ষার্থী ভর্তি ও ফি</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="শিক্ষার্থীর নাম, আইডি (যেমন: AI-ST-...), মোবাইল নম্বর বা কোর্স লিখে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#fdfbf7] border border-[#d9c7b4] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6d1a22] focus:border-transparent text-gray-800 transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#fdfbf7] border border-[#d9c7b4] p-1 rounded-xl">
          <button
            onClick={() => setFilterDue('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterDue === 'all'
                ? 'bg-[#6d1a22] text-[#fcf7ee]'
                : 'text-gray-600 hover:text-[#6d1a22] hover:bg-[#f8f1e7]'
            }`}
          >
            সকল শিক্ষার্থী ({students.length})
          </button>
          <button
            onClick={() => setFilterDue('due')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterDue === 'due'
                ? 'bg-[#be123c] text-white'
                : 'text-gray-600 hover:text-[#be123c] hover:bg-rose-50'
            }`}
          >
            বকেয়া রয়েছে ({students.filter((s) => s.dueAmount > 0).length})
          </button>
          <button
            onClick={() => setFilterDue('cleared')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterDue === 'cleared'
                ? 'bg-[#15803d] text-white'
                : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            পরিশোধ সম্পন্ন ({students.filter((s) => s.dueAmount === 0).length})
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-[#fdfbf7] rounded-2xl border border-[#d9c7b4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#6d1a22] text-[#fcf7ee] font-semibold">
              <tr>
                <th className="py-3 px-4">শিক্ষার্থীর তথ্য ও আইডি</th>
                <th className="py-3 px-4">ভর্তিকৃত কোর্স / প্রোগ্রাম</th>
                <th className="py-3 px-4">ক্যাম্পাস শাখা</th>
                <th className="py-3 px-4 text-right">নির্ধারিত মোট ফি</th>
                <th className="py-3 px-4 text-right">পরিশোধিত অর্থ</th>
                <th className="py-3 px-4 text-right">বকেয়া ফি</th>
                <th className="py-3 px-4 text-center">রসিদ ও একশন</th>
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
                        <div className="font-extrabold text-gray-900 text-sm">{s.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span className="font-mono font-bold text-[#6d1a22] bg-[#f6eee2] px-1.5 py-0.5 rounded">
                            {s.studentId}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone size={10} /> {s.mobileNumber}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-[#6d1a22]">{s.programme}</div>
                        <div className="text-[11px] text-gray-500">{s.batchTime}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-gray-700">{s.branch}</span>
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

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {hasDue && (
                            <button
                              onClick={() => handleOpenQuickPay(s)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] transition-colors shadow-xs cursor-pointer active:scale-95"
                              title="বকেয়া কিস্তি আদায়"
                            >
                              বকেয়া আদায়
                            </button>
                          )}

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

                          {s.paymentHistory.length > 1 && (
                            <button
                              onClick={() => setHistoryModalStudent(s)}
                              className="px-2 py-1 text-xs font-bold rounded-lg bg-white hover:bg-[#faf4ea] text-gray-700 border border-[#d9c7b4] transition-colors flex items-center gap-1 cursor-pointer"
                              title="সকল কিস্তি ও পেমেন্ট হিস্ট্রি দেখুন"
                            >
                              <History size={13} />
                              <span>হিস্ট্রি</span>
                            </button>
                          )}

                          {onDeleteStudent && (
                            <button
                              onClick={() => handleDelete(s)}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="শিক্ষার্থী রেকর্ড মুছে ফেলুন"
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
                {historyModalStudent.paymentHistory.map((pay, i) => (
                  <div
                    key={pay.id}
                    className="p-3 bg-white rounded-xl border border-[#d9c7b4] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>কিস্তি #{i + 1}</span>
                        <span className="font-mono text-[#6d1a22]">#{pay.receiptNo}</span>
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        {pay.date} • {pay.time} • মাধ্যম: {pay.method}
                      </div>
                      {pay.note && <div className="text-gray-500 text-[10.5px] italic">{pay.note}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#15803d] text-sm">
                        ৳{pay.amount.toLocaleString()}
                      </span>
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
                        className="px-2 py-1 text-xs font-bold rounded-lg bg-[#6d1a22] text-white hover:bg-[#521218] transition-colors cursor-pointer"
                        title="এই কিস্তির রসিদ দেখুন"
                      >
                        রসিদ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Student Payment & Admission */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} />
                <h3 className="font-black text-sm sm:text-base">
                  নতুন শিক্ষার্থী ভর্তি ও মানি রসিদ তৈরি (Student Admission & Fee)
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#fcf7ee] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    ভর্তিকৃত কোর্স / প্রোগ্রাম (Academic Course) *
                  </label>
                  <select
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-medium"
                  >
                    <option value="HSC Medical & Dental Physics+Chem">HSC Medical & Dental Physics+Chem</option>
                    <option value="Engineering BUET Advance Mathematics">Engineering BUET Advance Mathematics</option>
                    <option value="HSC Biology & Molecular Genetics">HSC Biology & Molecular Genetics</option>
                    <option value="Physics Special Mechanics & Optics">Physics Special Mechanics & Optics</option>
                    <option value="SSC Science Foundation All-in-One">SSC Science Foundation All-in-One</option>
                  </select>
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
                    <option value="Narayanganj">Narayanganj Campus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    ব্যাচ ও সময়সূচি (Batch Schedule / Time)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: রবি-মঙ্গল-বৃহস্পতি (সকাল ৯:০০)"
                    value={batchTime}
                    onChange={(e) => setBatchTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    পরিশোধের মাধ্যম (Payment Method)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-medium capitalize"
                  >
                    <option value="cash">নগদ গ্রহণ (Cash Counter)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                    <option value="bank">ব্যাংক ডিপোজিট / চেক (Bank Wire)</option>
                  </select>
                </div>
              </div>

              {/* Fee Breakdown Calculation */}
              <div className="p-4 bg-[#f8f1e7] rounded-xl border border-[#d9c7b4] space-y-3">
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 text-sm font-bold bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#15803d] mb-1">
                      প্রাথমিক জমা / কিস্তি (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="যেমন: ৫০০০"
                      value={initialPayment}
                      onChange={(e) => setInitialPayment(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-black text-[#15803d] bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#e2d2c1] text-xs">
                  <span className="font-semibold text-gray-700">হিসাবকৃত অবশিষ্ট বকেয়া:</span>
                  <span className={`font-black text-sm ${(Number(totalFee) || 0) - (Number(initialPayment) || 0) > 0 ? 'text-[#be123c]' : 'text-emerald-700'}`}>
                    ৳{Math.max(0, (Number(totalFee) || 0) - (Number(initialPayment) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {paymentMethod !== 'cash' && (
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    ট্রানজেকশন আইডি / রেফারেন্স (Trx ID / Ref No)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: 9J8B7G6F5"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-mono"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Receipt size={17} />
                  <span>ভর্তি নিশ্চিত ও অফিশিয়াল মানি রসিদ তৈরি করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Pay Due Installment */}
      {paymentModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden">
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <Receipt size={18} />
                <h3 className="font-bold text-sm">
                  বকেয়া ফি আদায়: {paymentModalStudent.name}
                </h3>
              </div>
              <button onClick={() => setPaymentModalStudent(null)} className="text-[#fcf7ee] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordQuickPay} className="p-5 space-y-4">
              <div className="bg-[#f8f1e7] p-3 rounded-xl border border-[#d9c7b4] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">শিক্ষার্থী আইডি:</span>
                  <span className="font-mono font-bold">{paymentModalStudent.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">কোর্স / প্রোগ্রাম:</span>
                  <span className="font-bold text-[#6d1a22]">{paymentModalStudent.programme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">মোট বকেয়া পরিমাণ:</span>
                  <span className="font-black text-[#be123c]">৳{paymentModalStudent.dueAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  আদায়কৃত অর্থ (৳) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={paymentModalStudent.dueAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black text-[#15803d] bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  পরিশোধের মাধ্যম (Payment Method)
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none capitalize"
                >
                  <option value="cash">নগদ গ্রহণ (Cash)</option>
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="rocket">রকেট (Rocket)</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  বিশেষ নোট বা মন্তব্য (Remarks)
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <Receipt size={16} />
                  <span>৳{Number(payAmount || 0).toLocaleString()} গ্রহণ ও রসিদ তৈরি করুন</span>
                </button>
              </div>
            </form>
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
