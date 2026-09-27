import React, { useState, useEffect } from 'react';
import { Expense, Branch, User } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { useToast } from './ToastContext';
import { ConfirmModal } from './ConfirmModal';
import {
  WalletCards,
  PlusCircle,
  Search,
  Filter,
  TrendingDown,
  X,
  Download,
  Trash2,
} from 'lucide-react';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  selectedBranch: Branch;
  currentUser: User | null;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  selectedBranch,
  currentUser,
  isAddModalOpen: externalModalOpen,
  setIsAddModalOpen: setExternalModalOpen,
}) => {
  const { showToast } = useToast();
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setIsModalOpen = setExternalModalOpen || setInternalModalOpen;

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confirmExpenseToDelete, setConfirmExpenseToDelete] = useState<{ id: string; voucherNo: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('rent');
  const [amount, setAmount] = useState<string | number>('');
  const [branch, setBranch] = useState<Branch>('Narayanganj');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'bank'>('cash');
  const [notes, setNotes] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmExpenseToDelete) {
          setConfirmExpenseToDelete(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmExpenseToDelete, isModalOpen, setIsModalOpen]);

  const filteredExpenses = expenses
    .filter((e) => !e.branch || e.branch === 'Narayanganj')
    .filter((e) => (categoryFilter === 'all' ? true : e.category === categoryFilter))
    .filter(
      (e) =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.voucherNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const handleExportCSV = () => {
    const data = filteredExpenses.map((exp, idx) => ({
      'SL': idx + 1,
      'Voucher No': exp.voucherNo,
      'Date': exp.date,
      'Expense Title': exp.title,
      'Category': exp.category,
      'Campus Branch': exp.branch,
      'Amount (BDT)': exp.amount,
      'Payment Method': exp.paymentMethod,
      'Authorized / Recorded By': exp.recordedBy,
      'Notes': exp.notes || '',
    }));
    exportToCSV(`Atomic_Expenses_Report_${selectedBranch.replace(/\s+/g, '_')}`, data);
    showToast('success', 'Expenses Exported', 'Expenses CSV report generated successfully');
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      voucherNo: `VCH-${Date.now().toString().slice(-6)}`,
      title,
      category,
      amount: Number(amount) || 0,
      date: new Date().toISOString().split('T')[0],
      branch,
      recordedBy: currentUser ? currentUser.name : 'Branch Admin',
      paymentMethod,
      notes,
    };

    onAddExpense(newExpense);
    setIsModalOpen(false);
    showToast('success', 'Expense Recorded', `Voucher ${newExpense.voucherNo} posted for ৳${newExpense.amount.toLocaleString()}`);
    setTitle('');
    setAmount('');
    setNotes('');
  };

  const handleDelete = (expenseId: string, voucherNo: string) => {
    setConfirmExpenseToDelete({ id: expenseId, voucherNo });
  };

  const categoryNames: Record<string, string> = {
    rent: 'ক্যাম্পাস রুম ভাড়া (Campus Rent)',
    utilities: 'বিদ্যুৎ ও পরিষেবা বিল (Electricity & Utilities)',
    printing: 'লেকচার শিট ও ফটোকপি (Lecture Sheets & Notes)',
    salary_staff: 'কর্মচারী ও অফিস বেতন (Staff Salary)',
    refreshment: 'চা ও নাস্তা আপ্যায়ন (Tea & Refreshments)',
    marketing: 'ব্যানার ও ভর্তি প্রচার (Marketing & Promo)',
    maintenance: 'ক্যাম্পাস রক্ষণাবেক্ষণ ও ল্যাব (Maintenance & Lab)',
    other: 'বিবিধ খরচ (Miscellaneous / Other)',
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fdfbf7] p-5 rounded-2xl border border-[#d9c7b4] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#521218] font-serif">
              ক্যাম্পাস ব্যয় ও ভাউচার রেজিস্টার
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#be123c] border border-rose-200">
              মোট ব্যয়: ৳{totalExpenseAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Expense Tracker & Vouchers • রুম ভাড়া, বিদ্যুৎ বিল, লেকচার শিট প্রিন্টিং, কর্মচারী বেতন ও প্রাতিষ্ঠানিক দৈনন্দিন খরচের রেজিস্টার
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4] font-bold text-xs transition-colors cursor-pointer"
            title="Download CSV"
          >
            <Download size={14} />
            <span>সিএসভি এক্সপোর্ট (CSV)</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>নতুন ভাউচার এন্ট্রি (Record Expense)</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="ভাউচার নম্বর, খরচের নাম বা খাতের বিবরণ দিয়ে খুঁজুন (Search expense, voucher)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#fdfbf7] border border-[#d9c7b4] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6d1a22] text-gray-800"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#fdfbf7] border border-[#d9c7b4] px-3.5 py-2 rounded-xl text-xs">
          <Filter size={14} className="text-[#6d1a22]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">সকল ব্যয়ের খাত (All Categories)</option>
            {Object.entries(categoryNames).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#fdfbf7] rounded-2xl border border-[#d9c7b4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#6d1a22] text-[#fcf7ee] font-semibold">
              <tr>
                <th className="py-3 px-4">ভাউচার ও তারিখ (Voucher & Date)</th>
                <th className="py-3 px-4">ব্যয়ের বিবরণ (Expense Title)</th>
                <th className="py-3 px-4">খাত (Category)</th>
                <th className="py-3 px-4">শাখা (Campus)</th>
                <th className="py-3 px-4">মাধ্যম ও এন্ট্রি (Method & Signature)</th>
                <th className="py-3 px-4 text-right">টাকার পরিমাণ (Amount ৳)</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee0d3] bg-white">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <WalletCards size={36} className="mx-auto mb-2 text-[#be123c]/40" />
                    <p className="text-sm font-bold text-gray-700">কোনো খরচের ভাউচার রেকর্ড পাওয়া যায়নি (No expense vouchers found)</p>
                    <p className="text-xs text-gray-500 mt-0.5">নতুন খরচের হিসাব লিপিবদ্ধ করতে উপরের "নতুন ভাউচার এন্ট্রি" বাটনে চাপ দিন</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#faf4ea]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#6d1a22]">{exp.voucherNo}</div>
                      <div className="text-[11px] text-gray-500">{exp.date}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-extrabold text-gray-900">{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-gray-500 italic mt-0.5">{exp.notes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#faf0e1] text-[#6d1a22] border border-[#e2d0bd]">
                        {categoryNames[exp.category] || exp.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-gray-700">{exp.branch} ক্যাম্পাস</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="capitalize font-bold text-gray-800">{exp.paymentMethod}</div>
                      <div className="text-[11px] text-gray-500">কর্তৃক: {exp.recordedBy}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#be123c] text-sm sm:text-base font-mono tabular-nums">
                      ৳{exp.amount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {onDeleteExpense && (
                        <button
                          onClick={() => handleDelete(exp.id, exp.voucherNo)}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="ভাউচার মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record New Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden">
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <WalletCards size={18} />
                <h3 className="font-bold text-sm">নতুন ব্যয় ভাউচার এন্ট্রি (Record Expense Voucher)</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#fcf7ee] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  ব্যয়ের বিবরণ বা খাত (Expense Title / Details) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: চলতি মাসের বিদ্যুৎ বিল (DESCO) বা রুম ভাড়া"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    ব্যয়ের ক্যাটাগরি (Category) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-medium"
                  >
                    <option value="rent">রুম ভাড়া (Rent)</option>
                    <option value="utilities">বিদ্যুৎ ও সেবা (Utilities)</option>
                    <option value="printing">লেকচার শিট প্রিন্ট (Sheets)</option>
                    <option value="salary_staff">স্টাফ বেতন (Staff Salary)</option>
                    <option value="refreshment">চা ও আপ্যায়ন (Refreshment)</option>
                    <option value="marketing">ব্যানার ও প্রচার (Marketing)</option>
                    <option value="maintenance">মেরামত ও ল্যাব (Maintenance)</option>
                    <option value="other">অন্যান্য / বিবিধ (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    টাকার পরিমাণ (Amount ৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="যেমন: ৫০০০"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-bold text-[#be123c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    ক্যাম্পাস শাখা (Branch) *
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as Branch)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                  >
                    <option value="Narayanganj">নারায়ণগঞ্জ ক্যাম্পাস (Narayanganj)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    পরিশোধ মাধ্যম (Payment Method)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none capitalize"
                  >
                    <option value="cash">নগদ কাউন্টার (Cash Counter)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ ওয়ালেট (Nagad)</option>
                    <option value="bank">ব্যাংক / চেক (Bank / Cheque)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  মন্তব্য / মেমো বা বিল নম্বর (Remarks / Memo)
                </label>
                <input
                  type="text"
                  placeholder="মেমো নং বা প্রাসঙ্গিক তথ্য (ঐচ্ছিক)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
                >
                  <TrendingDown size={16} />
                  <span>ভাউচার লেজারে যুক্ত করুন (Post Expense Voucher)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Voucher Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmExpenseToDelete}
        onClose={() => setConfirmExpenseToDelete(null)}
        onConfirm={() => {
          if (confirmExpenseToDelete && onDeleteExpense) {
            onDeleteExpense(confirmExpenseToDelete.id);
            showToast('info', 'ভাউচার অপসারিত', `ভাউচার #${confirmExpenseToDelete.voucherNo} সফলভাবে মুছে ফেলা হয়েছে।`);
          }
        }}
        title="খরচের ভাউচার মুছে ফেলতে চান?"
        message={`আপনি কি নিশ্চিতভাবে খরচের ভাউচার #${confirmExpenseToDelete?.voucherNo} হিসাব খতিয়ান থেকে মুছে ফেলতে চান?`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
      />
    </div>
  );
};
