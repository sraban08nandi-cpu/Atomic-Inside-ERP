import React, { useState, useEffect } from 'react';
import { ReceiptData, Branch } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { useToast } from './ToastContext';
import { ConfirmModal } from './ConfirmModal';
import {
  Receipt,
  Search,
  Phone,
  Eye,
  Download,
  PlusCircle,
  Trash2,
} from 'lucide-react';

interface ReceiptsListProps {
  receipts: ReceiptData[];
  onViewReceipt: (receipt: ReceiptData) => void;
  onDeleteReceipt?: (receiptId: string) => void;
  selectedBranch: Branch;
  onOpenNewCashMemo?: () => void;
}

export const ReceiptsList: React.FC<ReceiptsListProps> = ({
  receipts,
  onViewReceipt,
  onDeleteReceipt,
  selectedBranch,
  onOpenNewCashMemo,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'student' | 'teacher' | 'staff'>('all');
  const [confirmReceiptToDelete, setConfirmReceiptToDelete] = useState<{ id: string; receiptNo: string } | null>(null);

  // Close confirm modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmReceiptToDelete) {
        setConfirmReceiptToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmReceiptToDelete]);

  const filteredReceipts = receipts
    .filter((r) => !r.branch || r.branch === 'Narayanganj')
    .filter((r) => (typeFilter === 'all' ? true : r.type === typeFilter))
    .filter(
      (r) =>
        r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.contactNumber || '').includes(searchTerm) ||
        r.programme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalAmountInLedger = filteredReceipts.reduce((acc, r) => acc + r.amountPaid, 0);

  const handleExportCSV = () => {
    const data = filteredReceipts.map((r, idx) => ({
      'SL': idx + 1,
      'Receipt / Voucher #': r.receiptNo,
      'Type':
        r.type === 'student'
          ? 'Student Money Receipt'
          : r.type === 'teacher'
          ? 'Teacher Payment Voucher'
          : 'Staff Salary Payment Voucher',
      'Name': r.targetName,
      'Student/Teacher/Staff ID': r.studentId || '',
      'Contact Number': r.contactNumber || '',
      'Programme / Course / Role': r.programme,
      'Campus Branch': r.branch,
      'Amount Paid (BDT)': r.amountPaid,
      'Total Billed (BDT)': r.totalFee,
      'Due Balance (BDT)': r.dueAmount,
      'Date': r.date,
      'Time': r.time,
      'Payment Method': r.paymentMethod,
      'Transaction Ref': r.transactionId || '',
      'Authorized Receiver': r.receiverName,
    }));
    exportToCSV(`Atomic_Receipts_Register_${selectedBranch.replace(/\s+/g, '_')}`, data);
    showToast('success', 'Receipts Ledger Exported', 'CSV register generated successfully');
  };

  const handleDelete = (receiptId: string, receiptNo: string) => {
    setConfirmReceiptToDelete({ id: receiptId, receiptNo });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fdfbf7] p-5 rounded-2xl border border-[#d9c7b4] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#521218] font-serif">
              মানি রসিদ ও ভাউচার রেজিস্টার
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f6eee2] text-[#6d1a22] border border-[#d9c7b4]">
              {filteredReceipts.length} টি ইস্যুকৃত রেকর্ড
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Receipts & Vouchers Ledger • শিক্ষার্থী ফি রসিদ ও শিক্ষক সম্মানী ভাউচারের কেন্দ্রীয় অডিট ট্রেইল
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenNewCashMemo && (
            <button
              onClick={onOpenNewCashMemo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer border border-[#f59e0b]/50"
              title="নতুন ক্যাশ মেমো / পেমেন্ট ভাউচার তৈরি করুন"
            >
              <PlusCircle size={14} />
              <span>+ নতুন ক্যাশ মেমো</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4] font-bold text-xs transition-colors cursor-pointer"
            title="Download CSV Register"
          >
            <Download size={14} />
            <span>সিএসভি এক্সপোর্ট (CSV)</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-[#faf4ea] border border-[#d9c7b4] text-xs font-bold text-[#6d1a22]">
            মোট রেজিস্টার ভলিউম: <span className="font-black text-sm">৳{totalAmountInLedger.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="রসিদ নং (যেমন: RCP-...), নাম, মোবাইল নম্বর, বা বিষয় দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#fdfbf7] border border-[#d9c7b4] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6d1a22] text-gray-800"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#fdfbf7] border border-[#d9c7b4] p-1 rounded-xl">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#6d1a22] text-[#fcf7ee]'
                : 'text-gray-600 hover:text-[#6d1a22] hover:bg-[#f8f1e7]'
            }`}
          >
            সকল রেকর্ড (All)
          </button>
          <button
            onClick={() => setTypeFilter('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              typeFilter === 'student'
                ? 'bg-[#6d1a22] text-[#fcf7ee]'
                : 'text-gray-600 hover:text-[#6d1a22] hover:bg-[#f8f1e7]'
            }`}
          >
            শিক্ষার্থী রসিদ (Students)
          </button>
          <button
            onClick={() => setTypeFilter('teacher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              typeFilter === 'teacher'
                ? 'bg-[#6d1a22] text-[#fcf7ee]'
                : 'text-gray-600 hover:text-[#6d1a22] hover:bg-[#f8f1e7]'
            }`}
          >
            শিক্ষক ভাউচার (Faculty)
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-[#fdfbf7] rounded-2xl border border-[#d9c7b4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#6d1a22] text-[#fcf7ee] font-semibold">
              <tr>
                <th className="py-3 px-4">রসিদ / ভাউচার নং (Receipt #)</th>
                <th className="py-3 px-4">ব্যক্তি ও মোবাইল (Name & Mobile)</th>
                <th className="py-3 px-4">প্রোগ্রাম / কোর্স (Course)</th>
                <th className="py-3 px-4">তারিখ ও সময় (Date & Time)</th>
                <th className="py-3 px-4">ক্যাম্পাস ও রিসিভার (Branch & Receiver)</th>
                <th className="py-3 px-4 text-right">পরিশোধিত (Amount)</th>
                <th className="py-3 px-4 text-right">বকেয়া (Due)</th>
                <th className="py-3 px-4 text-center">অ্যাকশন (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee0d3] bg-white">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Receipt size={36} className="mx-auto mb-2 text-[#6d1a22]/40" />
                    <p className="text-sm font-bold text-gray-700">কোনো রসিদ বা ভাউচার রেকর্ড পাওয়া যায়নি (No receipts found)</p>
                    <p className="text-xs text-gray-500 mt-0.5">নতুন পেমেন্ট সম্পন্ন হলে এখানে স্বয়ংক্রিয়ভাবে অডিট রেকর্ড জমা হবে</p>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => {
                  const hasDue = r.dueAmount > 0;
                  return (
                    <tr key={r.id} className="hover:bg-[#faf4ea]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-[#6d1a22] flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              r.type === 'student' ? 'bg-[#6d1a22]' : 'bg-[#521218]'
                            }`}
                          />
                          <span>#{r.receiptNo}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase">
                          {r.type === 'student' ? 'শিক্ষার্থী মানি রসিদ' : r.type === 'teacher' ? 'টিচার সম্মানী ভাউচার' : 'স্টাফ বেতন ভাউচার'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-extrabold text-gray-900">{r.targetName}</div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-mono">
                          <Phone size={10} className="text-[#6d1a22]" /> {r.contactNumber || 'N/A'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#6d1a22] block">{r.programme}</span>
                        <span className="text-[10px] text-gray-500 capitalize">
                          {r.paymentMethod === 'cash' ? 'নগদ (Cash)' : r.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-800">{r.date}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{r.time}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-xs font-semibold text-gray-800">{r.branch} শাখা</div>
                        <div className="text-[11px] text-gray-500">আদায়কারী: {r.receiverName}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-black text-[#15803d] text-sm font-mono tabular-nums">
                        ৳{r.amountPaid.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {hasDue ? (
                          <span className="inline-block px-2 py-0.5 rounded font-black text-[#be123c] bg-rose-50 border border-rose-200">
                            ৳{r.dueAmount.toLocaleString()}
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
                            onClick={() => onViewReceipt(r)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                          >
                            <Eye size={13} />
                            <span>রসিদ দেখুন</span>
                          </button>
                          {onDeleteReceipt && (
                            <button
                              onClick={() => handleDelete(r.id, r.receiptNo)}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="রসিদ মুছে ফেলুন"
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

      {/* Delete Receipt Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmReceiptToDelete}
        onClose={() => setConfirmReceiptToDelete(null)}
        onConfirm={() => {
          if (confirmReceiptToDelete && onDeleteReceipt) {
            onDeleteReceipt(confirmReceiptToDelete.id);
            showToast('info', 'রসিদ অপসারিত', `রসিদ #${confirmReceiptToDelete.receiptNo} সফলভাবে মুছে ফেলা হয়েছে।`);
          }
        }}
        title="রসিদ মুছে ফেলতে চান?"
        message={`আপনি কি নিশ্চিতভাবে রসিদ #${confirmReceiptToDelete?.receiptNo} কেন্দ্রীয় অডিট খতিয়ান থেকে মুছে ফেলতে চান?`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
      />
    </div>
  );
};
