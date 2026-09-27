import React, { useState, useEffect } from 'react';
import { Teacher, ReceiptData, Branch, User } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { useToast } from './ToastContext';
import { ConfirmModal } from './ConfirmModal';
import {
  GraduationCap,
  PlusCircle,
  Receipt,
  Search,
  Phone,
  CalendarCheck,
  X,
  Download,
  Trash2,
  History,
} from 'lucide-react';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onPayTeacher: (teacherId: string, amount: number, paymentMethod: any, note?: string) => void;
  onDeleteTeacher?: (teacherId: string) => void;
  onViewReceipt: (receipt: ReceiptData) => void;
  selectedBranch: Branch;
  currentUser: User | null;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onAddTeacher,
  onPayTeacher,
  onDeleteTeacher,
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

  const [payModalTeacher, setPayModalTeacher] = useState<Teacher | null>(null);
  const [historyModalTeacher, setHistoryModalTeacher] = useState<Teacher | null>(null);
  const [confirmTeacherToDelete, setConfirmTeacherToDelete] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New Teacher Form
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [subject, setSubject] = useState('Physics (Mechanics & Quantum)');
  const [ratePerClass, setRatePerClass] = useState<string | number>('');
  const [branch, setBranch] = useState<Branch>('Narayanganj');

  // Pay Modal Form
  const [payAmount, setPayAmount] = useState<string | number>('');
  const [payMethod, setPayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank'>('bank');
  const [payNote, setPayNote] = useState('Monthly Class Honorarium Remuneration');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmTeacherToDelete) {
          setConfirmTeacherToDelete(null);
        } else if (historyModalTeacher) {
          setHistoryModalTeacher(null);
        } else if (payModalTeacher) {
          setPayModalTeacher(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmTeacherToDelete, historyModalTeacher, payModalTeacher, isModalOpen, setIsModalOpen]);

  const filteredTeachers = teachers
    .filter((t) => !t.branch || t.branch === 'Narayanganj')
    .filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.mobileNumber.includes(searchTerm)
    );

  const handleExportCSV = () => {
    const data = filteredTeachers.map((t, idx) => ({
      'SL': idx + 1,
      'Teacher Name': t.name,
      'Subject': t.subject,
      'Contact': t.mobileNumber,
      'Campus Branch': t.branch,
      'Rate Per Class': t.ratePerClass,
      'Total Classes Taken': t.totalClassesTaken,
      'Total Earned (BDT)': t.totalEarned,
      'Total Paid (BDT)': t.totalPaid,
      'Pending Payable (BDT)': t.pendingPayable,
      'Status': t.pendingPayable > 0 ? 'Pending Payment' : 'Cleared',
    }));
    exportToCSV(`Atomic_Faculty_Payroll_${selectedBranch.replace(/\s+/g, '_')}`, data);
    showToast('success', 'Payroll Exported', 'Faculty payroll report generated successfully');
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeacher: Teacher = {
      id: `tch_${Date.now()}`,
      name,
      mobileNumber,
      subject,
      ratePerClass: Number(ratePerClass) || 0,
      totalClassesTaken: 0,
      totalEarned: 0,
      totalPaid: 0,
      pendingPayable: 0,
      branch,
      joiningDate: new Date().toISOString().split('T')[0],
      paymentHistory: [],
    };

    onAddTeacher(newTeacher);
    setIsModalOpen(false);
    showToast('success', 'Faculty Registered', `${name} added to faculty roster!`);
    setName('');
    setMobileNumber('');
    setRatePerClass('');
  };

  const handleOpenPayModal = (teacher: Teacher) => {
    setPayModalTeacher(teacher);
    setPayAmount(teacher.pendingPayable > 0 ? teacher.pendingPayable : '');
    setPayNote(`Class Honorarium for ${teacher.subject}`);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalTeacher) return;
    const numericPay = Number(payAmount) || 0;
    onPayTeacher(payModalTeacher.id, numericPay, payMethod, payNote);
    showToast('success', 'Honorarium Disbursed', `৳${numericPay.toLocaleString()} paid to ${payModalTeacher.name}. Payment voucher issued.`);
    setPayModalTeacher(null);
  };

  const handleDelete = (teacher: Teacher) => {
    setConfirmTeacherToDelete(teacher);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fdfbf7] p-5 rounded-2xl border border-[#d9c7b4] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#521218] font-serif">
              শিক্ষক সম্মানী ও ফ্যাকাল্টি পরিষদ (Faculty Management)
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f6eee2] text-[#6d1a22] border border-[#d9c7b4]">
              {filteredTeachers.length} জন ফ্যাকাল্টি শিক্ষক
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            শিক্ষকদের ক্লাস পারিশ্রমিক গণনা, সম্মানী বিতরণ, বকেয়া ব্যালেন্স ও অফিশিয়াল পেমেন্ট ভাউচার প্রদান
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4] font-bold text-xs transition-colors cursor-pointer"
            title="শিক্ষক সম্মানী তালিকা এক্সেল/সিএসভি ডাউনলোড করুন"
          >
            <Download size={14} />
            <span>এক্সেল এক্সপোর্ট (.csv)</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>+ নতুন শিক্ষক নিবন্ধন</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="শিক্ষকের নাম, বিষয় (পদার্থ, গণিত, রসায়ন, জীববিজ্ঞান) বা মোবাইল নম্বর দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#fdfbf7] border border-[#d9c7b4] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6d1a22] focus:border-transparent text-gray-800 placeholder:text-gray-400"
        />
      </div>

      {/* Teachers List Table */}
      <div className="bg-[#fdfbf7] rounded-2xl border border-[#d9c7b4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#6d1a22] text-[#fcf7ee] font-semibold">
              <tr>
                <th className="py-3 px-4">শিক্ষকের নাম ও যোগাযোগ</th>
                <th className="py-3 px-4">বিষয় ও পদবী</th>
                <th className="py-3 px-4 text-center">গৃহীত ক্লাস</th>
                <th className="py-3 px-4 text-right">ক্লাস রেট</th>
                <th className="py-3 px-4 text-right">মোট অর্জিত সম্মানী</th>
                <th className="py-3 px-4 text-right">প্রদত্ত সম্মানী</th>
                <th className="py-3 px-4 text-right">বকেয়া প্রাপ্য</th>
                <th className="py-3 px-4 text-center">সম্মানী ও ভাউচার</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee0d3] bg-white">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <GraduationCap size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">কোনো শিক্ষকের রেকর্ড পাওয়া যায়নি।</p>
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => {
                  const latestPay = t.paymentHistory[t.paymentHistory.length - 1];
                  const hasPending = t.pendingPayable > 0;

                  return (
                    <tr key={t.id} className="hover:bg-[#faf4ea]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-gray-900 text-sm">{t.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                          <Phone size={10} className="text-[#6d1a22]" />
                          <span className="font-mono">{t.mobileNumber}</span>
                          <span>•</span>
                          <span>{t.branch}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#6d1a22] block">{t.subject}</span>
                        <span className="text-[10px] text-gray-500 font-medium">সিনিয়র ফ্যাকাল্টি</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-[#f7efe3] text-[#6d1a22] border border-[#d9c7b4]">
                          <CalendarCheck size={12} /> {t.totalClassesTaken} টি
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-gray-700 font-mono tabular-nums">
                        ৳{t.ratePerClass.toLocaleString()}/ক্লাস
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-gray-800 font-mono tabular-nums">
                        ৳{t.totalEarned.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-[#15803d] font-mono tabular-nums">
                        ৳{t.totalPaid.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {hasPending ? (
                          <span className="inline-block px-2 py-0.5 rounded font-black text-[#be123c] bg-rose-50 border border-rose-200">
                            ৳{t.pendingPayable.toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-sans">
                            পরিশোধিত
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenPayModal(t)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] transition-colors shadow-xs cursor-pointer active:scale-95"
                          >
                            সম্মানী প্রদান
                          </button>

                          {latestPay && (
                            <button
                              onClick={() =>
                                onViewReceipt({
                                  id: `rcp_view_tc_${t.id}`,
                                  receiptNo: latestPay.receiptNo,
                                  type: 'teacher',
                                  targetId: t.id,
                                  targetName: t.name,
                                  contactNumber: t.mobileNumber,
                                  programme: t.subject,
                                  branch: t.branch,
                                  amountPaid: latestPay.amount,
                                  totalFee: t.totalEarned,
                                  dueAmount: t.pendingPayable,
                                  date: latestPay.date,
                                  time: latestPay.time,
                                  receiverName: latestPay.disbursedBy,
                                  paymentMethod: latestPay.method,
                                  transactionId: latestPay.transactionId,
                                })
                              }
                              className="px-2 py-1 text-xs font-bold rounded-lg bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4] transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                              title="পেমেন্ট ভাউচার দেখুন ও প্রিন্ট করুন"
                            >
                              <Receipt size={13} />
                              <span>ভাউচার</span>
                            </button>
                          )}

                          {t.paymentHistory.length > 1 && (
                            <button
                              onClick={() => setHistoryModalTeacher(t)}
                              className="px-2 py-1 text-xs font-bold rounded-lg bg-white hover:bg-[#faf4ea] text-gray-700 border border-[#d9c7b4] transition-colors flex items-center gap-1 cursor-pointer"
                              title="সকল সম্মানী প্রদানের হিস্ট্রি দেখুন"
                            >
                              <History size={13} />
                              <span>হিস্ট্রি</span>
                            </button>
                          )}

                          {onDeleteTeacher && (
                            <button
                              onClick={() => handleDelete(t)}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="শিক্ষক রেকর্ড মুছে ফেলুন"
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

      {/* Modal: Teacher Payment History */}
      {historyModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden">
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <History size={18} />
                <h3 className="font-bold text-sm">
                  সম্মানী প্রদানের হিস্ট্রি: {historyModalTeacher.name}
                </h3>
              </div>
              <button
                onClick={() => setHistoryModalTeacher(null)}
                className="text-[#fcf7ee] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="text-xs text-gray-600 pb-2 border-b border-[#d9c7b4] flex justify-between items-center">
                <span>বিষয়: <strong>{historyModalTeacher.subject}</strong></span>
                <span>মোট প্রদান: <strong>৳{historyModalTeacher.totalPaid.toLocaleString()}</strong></span>
              </div>

              <div className="space-y-2">
                {historyModalTeacher.paymentHistory.map((pay, i) => (
                  <div
                    key={pay.id}
                    className="p-3 bg-white rounded-xl border border-[#d9c7b4] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span>ভাউচার #{i + 1}</span>
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
                          setHistoryModalTeacher(null);
                          onViewReceipt({
                            id: `rcp_tch_hist_${pay.id}`,
                            receiptNo: pay.receiptNo,
                            type: 'teacher',
                            targetId: historyModalTeacher.id,
                            targetName: historyModalTeacher.name,
                            contactNumber: historyModalTeacher.mobileNumber,
                            programme: historyModalTeacher.subject,
                            branch: historyModalTeacher.branch,
                            amountPaid: pay.amount,
                            totalFee: historyModalTeacher.totalEarned,
                            dueAmount: historyModalTeacher.pendingPayable,
                            date: pay.date,
                            time: pay.time,
                            receiverName: pay.disbursedBy,
                            paymentMethod: pay.method,
                            transactionId: pay.transactionId,
                          });
                        }}
                        className="px-2 py-1 text-xs font-bold rounded-lg bg-[#6d1a22] text-white hover:bg-[#521218] transition-colors cursor-pointer"
                        title="এই ভাউচার দেখুন"
                      >
                        ভাউচার
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden">
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} />
                <h3 className="font-bold text-sm">নতুন শিক্ষক নিবন্ধন (Register Faculty Member)</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#fcf7ee] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  শিক্ষকের পূর্ণ নাম (Teacher Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ড. কাজী শফিকুল ইসলাম"
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
                  placeholder="যেমন: 01819-876543"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  পাঠদানের বিষয় (Subject / Department) *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-medium"
                >
                  <option value="Physics (Mechanics & Quantum)">পদার্থবিজ্ঞান (Physics)</option>
                  <option value="Higher Mathematics (Calculus & Vectors)">উচ্চতর গণিত (Higher Mathematics)</option>
                  <option value="Chemistry (Organic & Periodic Table)">রসায়ন (Chemistry)</option>
                  <option value="Biology (Genetics & Botany)">জীববিজ্ঞান (Biology)</option>
                  <option value="ICT & Computer Science">আইসিটি (ICT & Computer Science)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    ক্লাস প্রতি সম্মানী রেট (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="যেমন: ১২০০"
                    value={ratePerClass}
                    onChange={(e) => setRatePerClass(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-bold"
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
                    <option value="Narayanganj">Narayanganj Campus</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <GraduationCap size={16} />
                  <span>শিক্ষক নিবন্ধন সম্পন্ন করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Disburse Honorarium Payment */}
      {payModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden">
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <Receipt size={18} />
                <h3 className="font-bold text-sm">শিক্ষক সম্মানী প্রদান ও ভাউচার তৈরি</h3>
              </div>
              <button onClick={() => setPayModalTeacher(null)} className="text-[#fcf7ee] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="p-5 space-y-4">
              <div className="bg-[#f8f1e7] p-3 rounded-xl border border-[#d9c7b4] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">শিক্ষকের নাম:</span>
                  <span className="font-bold text-gray-900">{payModalTeacher.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">পাঠদানের বিষয়:</span>
                  <span className="font-bold text-[#6d1a22]">{payModalTeacher.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">পরিচালিত মোট ক্লাস:</span>
                  <span className="font-bold text-gray-800">{payModalTeacher.totalClassesTaken} টি ক্লাস</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">মোট প্রাপ্য বকেয়া:</span>
                  <span className="font-black text-[#be123c]">৳{payModalTeacher.pendingPayable.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  প্রদেয় সম্মানীর পরিমাণ (৳) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black text-[#15803d] bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">পরিশোধের মাধ্যম (Channel)</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none capitalize font-medium"
                >
                  <option value="bank">ব্যাংক একাউন্ট ট্রান্সফার (Bank Wire)</option>
                  <option value="bkash">বিকাশ সেন্ড মানি (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="rocket">রকেট (Rocket)</option>
                  <option value="cash">নগদ ক্যাশ খাম (Cash Envelope)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">বিবরণ / নোট (Particulars)</label>
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
                  <span>৳{Number(payAmount || 0).toLocaleString()} সম্মানী প্রদান ও ভাউচার ইস্যু করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Teacher Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmTeacherToDelete}
        onClose={() => setConfirmTeacherToDelete(null)}
        onConfirm={() => {
          if (confirmTeacherToDelete && onDeleteTeacher) {
            onDeleteTeacher(confirmTeacherToDelete.id);
            showToast('info', 'শিক্ষক রেকর্ড মুছে ফেলা হয়েছে', `${confirmTeacherToDelete.name}-এর রেকর্ড সফলভাবে অপসারিত হয়েছে।`);
          }
        }}
        title="শিক্ষক রেকর্ড মুছে ফেলতে চান?"
        message={`আপনি কি নিশ্চিতভাবে শিক্ষক "${confirmTeacherToDelete?.name}" (${confirmTeacherToDelete?.subject})-এর সকল হিসাব ও ক্লাস রেকর্ড মুছে ফেলতে চান?`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
      />
    </div>
  );
};
