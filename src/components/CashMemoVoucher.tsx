import React from 'react';
import { AtomicLogo } from './AtomicLogo';
import { Phone, MapPin, Globe } from 'lucide-react';

export interface CashMemoData {
  studentName: string;
  recipientName?: string;
  paymentDate: string;
  tuitionFee: number | string;
  paymentPurpose: string;
  invoiceNumber: string;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | string;
  receivedBy: string;
  authoritySignature?: string;
  payerSignature?: string;
  notes?: string;
}

interface CashMemoVoucherProps {
  data: CashMemoData;
  className?: string;
  isBlank?: boolean;
}

export const CashMemoVoucher: React.FC<CashMemoVoucherProps> = ({
  data,
  className = '',
  isBlank = false,
}) => {
  const normalizedMethod = (data.paymentMethod || 'cash').toLowerCase();
  const isCash = normalizedMethod.includes('cash') || normalizedMethod.includes('নগদ');
  const isBkash = normalizedMethod.includes('bkash') || normalizedMethod.includes('বিকাশ');
  const isNagad = normalizedMethod.includes('nagad') || normalizedMethod.includes('নগদ');

  const defaultNotes =
    'Thank you for your payment! We are absolutely thrilled to have you with us this term. Your dedication to your education is the first step toward a bright future. Let\'s make this academic journey full of growth, learning, and success!';

  return (
    <div
      className={`cash-memo-sheet bg-white text-black p-5 sm:p-6 md:p-7 rounded-2xl relative select-text shadow-sm border border-gray-300 w-[780px] max-w-[780px] min-w-[780px] mx-auto box-border ${className}`}
      style={{
        fontFamily: "var(--font-bangla-current)",
      }}
    >
      {/* TOP LEFT: Hexagonal 3D Orange Cluster */}
      <div className="absolute top-2 left-2 pointer-events-none select-none z-0">
        <svg
          width="130"
          height="100"
          viewBox="0 0 130 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Top 3D Hexagon */}
          <g transform="translate(15, 2)">
            <polygon points="25,4 47,4 58,23 47,42 25,42 14,23" fill="#ea580c" />
            <polygon points="25,4 47,4 36,23 14,23" fill="#fb923c" />
            <polygon points="47,4 58,23 47,42 36,23" fill="#c2410c" />
          </g>

          {/* Left Middle 3D Hexagon */}
          <g transform="translate(-4, 24)">
            <polygon points="22,3 41,3 50,20 41,36 22,36 13,20" fill="#f97316" />
            <polygon points="22,3 41,3 32,20 13,20" fill="#fdba74" />
            <polygon points="41,3 50,20 41,36 32,20" fill="#ea580c" />
          </g>

          {/* Golden Floating Hexagon */}
          <g transform="translate(38, 28)">
            <polygon points="18,3 34,3 42,17 34,30 18,30 10,17" fill="#f59e0b" />
            <polygon points="18,3 34,3 26,17 10,17" fill="#fde047" />
            <polygon points="34,3 42,17 34,30 26,17" fill="#d97706" />
          </g>

          {/* Small Accent Bottom Hexagon */}
          <g transform="translate(0, 62)">
            <polygon points="14,2 26,2 32,13 26,23 14,23 8,13" fill="#ea580c" />
            <polygon points="14,2 26,2 20,13 8,13" fill="#fb923c" />
          </g>

          {/* Tiny Yellow Accent */}
          <polygon points="42,66 50,66 54,73 50,80 42,80 38,73" fill="#fbbf24" opacity="0.9" />
        </svg>
      </div>

      {/* TOP HEADER: Centered Brand Logo Box & Title */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo Frame Box */}
        <div className="border-2 border-black px-4 sm:px-5 py-1.5 inline-flex items-center gap-3 bg-white shadow-2xs rounded-sm">
          <AtomicLogo size={40} />
          <div className="flex flex-col text-left">
            <span className="text-xl sm:text-2xl font-black text-[#6d1a22] font-bangla leading-tight">
              অ্যাটমিক
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-gray-900 font-bangla">
              শিক্ষা পরিবার
            </span>
          </div>
        </div>

        {/* Headings */}
        <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase mt-2 leading-none">
          PAYMENT VOUCHER
        </h2>
        <p className="text-[11px] sm:text-xs font-bold text-gray-900 tracking-wider uppercase mt-1">
          PAYMENT RECEIPT FOR ACADEMIC CLASS
        </p>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="relative z-10 mt-3.5 border-2 border-black rounded-2xl px-5 sm:px-6 py-4 sm:py-5 bg-white space-y-3.5 shadow-2xs">
        {/* ROW 1: Student Name (Left) & Payment Date (Right) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 items-end">
          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Student Name:
            </span>
            <div className="border-b border-black flex-1 min-h-[20px] px-1 font-extrabold text-xs sm:text-sm text-gray-900">
              {!isBlank && (data.studentName || '')}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Payment Date:
            </span>
            <div className="border-b border-black flex-1 min-h-[20px] px-1 font-bold text-xs sm:text-sm text-gray-900 font-mono">
              {!isBlank && (data.paymentDate || '')}
            </div>
          </div>
        </div>

        {/* ROW 2: Recipient Name */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 items-end">
          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Recipient Name:
            </span>
            <div className="border-b border-black flex-1 min-h-[20px] px-1 font-semibold text-xs sm:text-sm text-gray-800">
              {!isBlank && (data.recipientName || data.studentName || '')}
            </div>
          </div>
          <div />
        </div>

        {/* ROW 3: Tuition Fee (Left) & Payment Method (Right) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 items-end pt-0.5">
          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Tuition fee :
            </span>
            <div className="border-b border-black flex-1 min-h-[20px] px-1 font-black text-xs sm:text-base text-[#15803d] font-mono flex items-center gap-1">
              {!isBlank && (
                <span>
                  ৳ {typeof data.tuitionFee === 'number' ? data.tuitionFee.toLocaleString() : data.tuitionFee}
                </span>
              )}
            </div>
          </div>

          {/* Payment Method Radio Dots (Cash, Bkash, Nagad) */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Payment Method:
            </span>
            <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold text-gray-900 whitespace-nowrap">
              {/* Cash Radio */}
              <label className="flex items-center gap-1 cursor-pointer">
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-[#7c3aed] ${
                    !isBlank && isCash ? 'bg-[#7c3aed]' : 'bg-white'
                  }`}
                >
                  {!isBlank && isCash && <span className="w-1 h-1 rounded-full bg-white" />}
                </span>
                <span>Cash</span>
              </label>

              {/* Bkash Radio */}
              <label className="flex items-center gap-1 cursor-pointer">
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-[#7c3aed] ${
                    !isBlank && isBkash ? 'bg-[#7c3aed]' : 'bg-white'
                  }`}
                >
                  {!isBlank && isBkash && <span className="w-1 h-1 rounded-full bg-white" />}
                </span>
                <span>Bkash</span>
              </label>

              {/* Nagad Radio */}
              <label className="flex items-center gap-1 cursor-pointer">
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-[#7c3aed] ${
                    !isBlank && isNagad ? 'bg-[#7c3aed]' : 'bg-white'
                  }`}
                >
                  {!isBlank && isNagad && <span className="w-1 h-1 rounded-full bg-white" />}
                </span>
                <span>Nagad</span>
              </label>
            </div>
          </div>
        </div>

        {/* ROW 4: Payment Purpose (Left) & Received By (Right) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 items-end">
          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Payment Purpose:
            </span>
            <div className="border-b border-black flex-1 min-h-[20px] px-1 font-semibold text-xs sm:text-sm text-gray-800">
              {!isBlank && (data.paymentPurpose || '')}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Received By:
            </span>
            <div className="border-b border-black flex-1 min-h-[20px] px-1 font-bold text-xs sm:text-sm text-gray-900">
              {!isBlank && (data.receivedBy || '')}
            </div>
          </div>
        </div>

        {/* ROW 5: Invoice Number */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 items-end">
          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Invoice Number:
            </span>
            <div className="border-b border-black flex-1 min-h-[20px] px-1 font-mono font-black text-xs sm:text-sm text-[#be123c]">
              {!isBlank && (data.invoiceNumber || '')}
            </div>
          </div>
          <div />
        </div>

        {/* ROW 6: Signatures */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8 items-end pt-1.5">
          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Authority Signature:
            </span>
            <div className="border-b border-black flex-1 min-h-[22px] px-2 font-serif italic font-bold text-xs sm:text-sm text-[#4d1419] flex items-center">
              {!isBlank && (data.authoritySignature || 'Principal (AI)')}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-xs sm:text-sm font-bold text-black whitespace-nowrap shrink-0">
              Payer Signature:
            </span>
            <div className="border-b border-black flex-1 min-h-[22px] px-2 font-serif italic text-xs text-gray-700 flex items-center">
              {!isBlank && (data.payerSignature || '')}
            </div>
          </div>
        </div>

        {/* ROW 7: Exact Notes Callout */}
        <div className="pt-2 text-[10px] sm:text-[11px] text-gray-700 leading-relaxed border-t border-gray-100">
          <strong className="text-black font-bold">Notes:</strong>{' '}
          <em className="text-gray-600">"{data.notes || defaultNotes}"</em>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 mt-3 flex items-center justify-between gap-3 text-xs font-bold text-gray-900 px-1">
        {/* Phone */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-4 h-4 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Phone size={9} fill="currentColor" />
          </div>
          <span className="font-mono font-bold text-[11px] sm:text-xs">01834899620</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 shrink-0 text-[10.5px] sm:text-xs">
          <div className="w-4 h-4 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin size={9} fill="currentColor" />
          </div>
          <span>Atomic center , Amlapara, Narayanganj.</span>
        </div>

        {/* Website */}
        <div className="flex items-center gap-1.5 shrink-0 text-[10.5px] sm:text-xs">
          <div className="w-4 h-4 rounded-full bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Globe size={9} />
          </div>
          <span className="text-[#0369a1] font-mono tracking-tight">
            atomicshikkhaporibar.netlify.app
          </span>
        </div>
      </div>
    </div>
  );
};
