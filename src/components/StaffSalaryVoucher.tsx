import React from 'react';
import { AtomicLogo } from './AtomicLogo';
import { numberToWordsBengali, numberToWordsEnglish } from '../utils/numberToWords';
import { Phone, MapPin, Globe, CheckCircle2, Building2 } from 'lucide-react';

export interface StaffSalaryVoucherData {
  voucherNo: string;
  date: string;
  time?: string;
  month: string;
  staffName: string;
  staffId: string;
  designation: string;
  department: string;
  contactNumber: string;
  basicSalary: number;
  bonus: number;
  deduction: number;
  netAmount: number;
  paymentMethod: string;
  transactionId?: string;
  disbursedBy: string;
  note?: string;
  copyType?: 'office' | 'staff';
}

interface StaffSalaryVoucherProps {
  data: StaffSalaryVoucherData;
  className?: string;
}

export const StaffSalaryVoucher: React.FC<StaffSalaryVoucherProps> = ({
  data,
  className = '',
}) => {
  const grossPayable = (data.basicSalary || 0) + (data.bonus || 0);
  const wordsBn = numberToWordsBengali(data.netAmount);
  const wordsEn = numberToWordsEnglish(data.netAmount);

  const normalizedMethod = (data.paymentMethod || 'cash').toLowerCase();
  const isCash = normalizedMethod.includes('cash') || normalizedMethod.includes('নগদ');
  const isBkash = normalizedMethod.includes('bkash') || normalizedMethod.includes('বিকাশ');
  const isNagad = normalizedMethod.includes('nagad') || normalizedMethod.includes('নগদ');
  const isBank = normalizedMethod.includes('bank') || normalizedMethod.includes('ব্যাংক');

  return (
    <div
      className={`staff-salary-voucher-sheet bg-white text-gray-900 p-6 sm:p-8 rounded-2xl relative select-text shadow-sm border-2 border-[#58141b] w-full max-w-[820px] mx-auto box-border ${className}`}
      style={{
        fontFamily: "var(--font-bangla-current)",
      }}
    >
      {/* Decorative Gold & Maroon Inset Border */}
      <div className="absolute inset-1.5 rounded-xl border border-[#c5a059]/40 pointer-events-none" />

      {/* Institutional Watermark in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.032] select-none">
        <AtomicLogo size={340} />
      </div>

      {/* TOP HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#58141b] pb-4 mb-4 gap-3">
        {/* Left: Brand & Logo */}
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <AtomicLogo size={60} />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#58141b] font-bangla leading-tight">
              অ্যাটমিক শিক্ষা পরিবার
            </h1>
            <p className="text-xs sm:text-[13px] font-bold text-gray-800 font-serif tracking-wider uppercase">
              Atomic Inside Coaching Care • Narayanganj Campus
            </p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
              কেন্দ্রীয় প্রাতিষ্ঠানিক প্রশাসন ও হিসাব বিভাগ • রেজিঃ নং: AI-8824/BD
            </p>
          </div>
        </div>

        {/* Right: Voucher Badge & Numbers */}
        <div className="flex flex-col items-center sm:items-end shrink-0">
          <div className="px-3.5 py-1 rounded-full bg-[#58141b] text-[#fcf7ee] font-black text-xs uppercase tracking-wider shadow-xs mb-1.5">
            বেতন পরিশোধ ভাউচার
          </div>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
            {data.copyType === 'staff' ? '★ কর্মকর্তা/কর্মচারী কপি (Staff Copy)' : '★ অফিস কপি (Office Copy)'}
          </span>
          <div className="mt-1 font-mono font-bold text-xs text-[#58141b]">
            ভাউচার নং: <span className="font-black text-rose-800">{data.voucherNo}</span>
          </div>
          <div className="text-[11px] font-semibold text-gray-600">
            তারিখ: <span className="font-mono font-bold text-gray-800">{data.date}</span>
            {data.time && <span className="ml-1 text-[10px] text-gray-500">({data.time})</span>}
          </div>
        </div>
      </div>

      {/* SUB-HEADER: Salary Month Banner */}
      <div className="relative z-10 bg-[#faf4ea] border border-[#d9c7b4] rounded-xl px-4 py-2 mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#58141b]">বেতন মাস (Salary Month):</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-[#58141b] text-white font-black text-xs font-mono">
            {data.month}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-700 font-medium text-[11px]">
          <span>শাখা: <strong>নারায়ণগঞ্জ (Narayanganj)</strong></span>
          <span>•</span>
          <span>বিভাগ: <strong>{data.department || 'Administration'}</strong></span>
        </div>
      </div>

      {/* STAFF DETAILS GRID */}
      <div className="relative z-10 bg-white border border-gray-300 rounded-xl p-3.5 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium shrink-0 w-24">কর্মকর্তার নাম:</span>
          <span className="font-black text-gray-900 text-sm">{data.staffName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium shrink-0 w-24">স্টাফ আইডি:</span>
          <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
            {data.staffId || 'AI-STF'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium shrink-0 w-24">পদবি (Designation):</span>
          <span className="font-bold text-[#58141b]">{data.designation}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium shrink-0 w-24">মোবাইল নম্বর:</span>
          <span className="font-mono font-bold text-gray-800">{data.contactNumber || '01XXXXXXXXX'}</span>
        </div>
      </div>

      {/* SALARY FINANCIAL BREAKDOWN TABLE */}
      <div className="relative z-10 overflow-hidden rounded-xl border-2 border-gray-800 mb-4">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#58141b] text-[#fcf7ee] font-black uppercase text-[11px]">
            <tr>
              <th className="py-2.5 px-3 border-r border-[#7d212b]">বিবরণ (Particulars)</th>
              <th className="py-2.5 px-3 text-center border-r border-[#7d212b] w-28">ধরন (Type)</th>
              <th className="py-2.5 px-3 text-right w-36">পরিমাণ (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-medium">
            <tr className="bg-white hover:bg-gray-50">
              <td className="py-2.5 px-3 border-r border-gray-200">
                <span className="font-bold text-gray-900">মূল মাসিক বেতন (Basic Monthly Salary)</span>
                <p className="text-[10px] text-gray-500 mt-0.5">মাসিক নির্ধারিত চুক্তিভিত্তিক মূল সম্মানী</p>
              </td>
              <td className="py-2.5 px-3 text-center border-r border-gray-200 text-gray-600 font-mono text-[11px]">
                স্থায়ী (Fixed)
              </td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                ৳ {data.basicSalary.toLocaleString()}
              </td>
            </tr>

            {data.bonus > 0 && (
              <tr className="bg-emerald-50/50 hover:bg-emerald-50">
                <td className="py-2 px-3 border-r border-gray-200">
                  <span className="font-bold text-emerald-800">বোনাস ও বিশেষ ভাতা (Bonus / Allowances)</span>
                  <p className="text-[10px] text-emerald-600 mt-0.5">উৎসব ভাতা, ওভারটাইম বা অতিরিক্ত কাজের ভাতা</p>
                </td>
                <td className="py-2 px-3 text-center border-r border-gray-200 text-emerald-700 font-mono text-[11px]">
                  যুক্ত (+)
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                  + ৳ {data.bonus.toLocaleString()}
                </td>
              </tr>
            )}

            <tr className="bg-gray-50 font-bold text-gray-800">
              <td className="py-2 px-3 border-r border-gray-200">
                <span>মোট প্রদেয় বেতন (Gross Total Payable)</span>
              </td>
              <td className="py-2 px-3 text-center border-r border-gray-200 text-gray-500 font-mono text-[11px]">
                মোট
              </td>
              <td className="py-2 px-3 text-right font-mono">
                ৳ {grossPayable.toLocaleString()}
              </td>
            </tr>

            {data.deduction > 0 && (
              <tr className="bg-rose-50/50 hover:bg-rose-50">
                <td className="py-2 px-3 border-r border-gray-200">
                  <span className="font-bold text-rose-800">কর্তন / অগ্রিম সমন্বয় (Deduction / Advance Adjusted)</span>
                  <p className="text-[10px] text-rose-600 mt-0.5">পূর্বের অগ্রিম বেতন বা জরিমানা কর্তন</p>
                </td>
                <td className="py-2 px-3 text-center border-r border-gray-200 text-rose-700 font-mono text-[11px]">
                  বিয়োগ (-)
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                  - ৳ {data.deduction.toLocaleString()}
                </td>
              </tr>
            )}

            {/* NET PAID SALARY TOTAL ROW */}
            <tr className="bg-[#faf4ea] font-black text-gray-950 border-t-2 border-gray-800">
              <td className="py-3 px-3 border-r border-gray-300 text-sm">
                <span className="text-[#58141b] uppercase">সর্বমোট প্রদত্ত নিট বেতন (Net Disbursed Amount)</span>
              </td>
              <td className="py-3 px-3 text-center border-r border-gray-300">
                <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                  পরিশোধিত
                </span>
              </td>
              <td className="py-3 px-3 text-right font-mono text-base text-emerald-800 font-black">
                ৳ {data.netAmount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* IN WORDS CALLOUT */}
      <div className="relative z-10 bg-amber-50/70 border border-amber-200 rounded-xl p-3 mb-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-bold text-[#58141b] shrink-0">টাকার পরিমাণ (কথায়):</span>
          <span className="font-bold text-gray-900 font-bangla">
            {wordsBn} মাত্র
          </span>
        </div>
        <div className="text-[11px] text-gray-600 font-mono italic mt-0.5">
          In Words: {wordsEn} Taka Only.
        </div>
      </div>

      {/* PAYMENT METHOD & DISBURSEMENT INFO */}
      <div className="relative z-10 bg-white border border-gray-300 rounded-xl p-3.5 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-gray-500 font-medium block text-[11px]">পরিশোধ মাধ্যম (Method):</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-300 font-mono text-[11px]">
              {data.paymentMethod}
            </span>
            {data.transactionId && (
              <span className="text-[11px] text-gray-600 font-mono">
                Trx: {data.transactionId}
              </span>
            )}
          </div>
        </div>

        <div>
          <span className="text-gray-500 font-medium block text-[11px]">বেতন প্রদানকারী (Disbursed By):</span>
          <span className="font-bold text-gray-900 mt-1 block">
            {data.disbursedBy || 'Anirban Ghosh (Founder)'}
          </span>
        </div>

        <div>
          <span className="text-gray-500 font-medium block text-[11px]">মন্তব্য / নোট (Remarks):</span>
          <span className="text-gray-700 italic mt-1 block text-[11px]">
            {data.note || 'মাসিক প্রাতিষ্ঠানিক বেতন ও দায়িত্ব ভাতা নির্বাহ'}
          </span>
        </div>
      </div>

      {/* SIGNATURES BLOCK */}
      <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 pb-2 text-center text-xs">
        {/* Staff Signature */}
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-dashed border-gray-500 pt-1.5 font-bold text-gray-900">
            {data.staffName.split(' ')[0]}
          </div>
          <span className="text-[10px] text-gray-500 font-medium">প্রাপক কর্মকর্তার স্বাক্ষর</span>
          <span className="text-[9px] text-gray-400">(Employee Signature)</span>
        </div>

        {/* Accountant / In-Charge Signature */}
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-dashed border-gray-500 pt-1.5 font-bold text-gray-900">
            {data.disbursedBy ? data.disbursedBy.split(' ')[0] : 'Accounts'}
          </div>
          <span className="text-[10px] text-gray-500 font-medium">হিসাব প্রস্তুতকারক</span>
          <span className="text-[9px] text-gray-400">(Prepared By Accounts)</span>
        </div>

        {/* Executive Director Signature */}
        <div className="flex flex-col items-center">
          <div className="w-full border-t border-dashed border-gray-500 pt-1.5 font-black text-[#58141b] font-serif">
            Anirban Ghosh
          </div>
          <span className="text-[10px] font-bold text-[#58141b]">অনুমোদনকারী (পরিচালক / প্রতিষ্ঠাতা)</span>
          <span className="text-[9px] text-gray-400">(Authorized Signatory)</span>
        </div>
      </div>

      {/* FOOTER STRIP */}
      <div className="relative z-10 mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-600 font-semibold">
        <div className="flex items-center gap-1.5">
          <Phone size={10} className="text-[#58141b]" />
          <span>হটলাইন: 01834-899620</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={10} className="text-[#58141b]" />
          <span>অ্যাটমিক সেন্টার, আমলাপাড়া, নারায়ণগঞ্জ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe size={10} className="text-[#58141b]" />
          <span>atomicshikkhaporibar.netlify.app</span>
        </div>
      </div>
    </div>
  );
};
