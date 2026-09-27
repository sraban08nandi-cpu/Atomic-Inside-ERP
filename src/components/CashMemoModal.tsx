import React, { useState, useRef, useEffect } from 'react';
import { Student, User, ReceiptData } from '../types';
import { CashMemoVoucher, CashMemoData } from './CashMemoVoucher';
import {
  FileText,
  Printer,
  FileDown,
  Image as ImageIcon,
  X,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Loader2,
  Save,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface CashMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentUser: User | null;
  onSaveReceipt?: (receipt: ReceiptData) => void;
  initialData?: Partial<CashMemoData>;
}

export const CashMemoModal: React.FC<CashMemoModalProps> = ({
  isOpen,
  onClose,
  students,
  currentUser,
  onSaveReceipt,
  initialData,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const defaultReceiver = currentUser ? currentUser.name : 'Anirban Ghosh (Founder)';

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>(initialData?.studentName || '');
  const [recipientName, setRecipientName] = useState<string>(initialData?.recipientName || '');
  const [paymentDate, setPaymentDate] = useState<string>(initialData?.paymentDate || today);
  const [tuitionFee, setTuitionFee] = useState<string | number>(initialData?.tuitionFee || 3500);
  const [paymentPurpose, setPaymentPurpose] = useState<string>(
    initialData?.paymentPurpose || 'Physics & Academic Coaching Class'
  );
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    initialData?.invoiceNumber || `VCH-${Date.now().toString().slice(-6)}`
  );
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad'>(
    (initialData?.paymentMethod as any) || 'cash'
  );
  const [receivedBy, setReceivedBy] = useState<string>(
    initialData?.receivedBy || defaultReceiver
  );
  const [authoritySignature, setAuthoritySignature] = useState<string>(
    initialData?.authoritySignature || 'Principal (AI)'
  );
  const [payerSignature, setPayerSignature] = useState<string>(
    initialData?.payerSignature || ''
  );
  const [isBlankForm, setIsBlankForm] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Download & Print states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  if (!isOpen) return null;

  // When a student is picked from dropdown, autofill data
  const handleStudentSelect = (sId: string) => {
    setSelectedStudentId(sId);
    if (!sId) return;

    const student = students.find((s) => s.id === sId);
    if (student) {
      setStudentName(student.name);
      setRecipientName(student.name);
      setTuitionFee(student.totalFee > 0 ? student.totalFee : 3500);
      setPaymentPurpose(`${student.programme} (একাডেমিক ক্লাস ফি)`);
      setPayerSignature(student.name.split(' ')[0]);
    }
  };

  const handleGenerateNewInvoice = () => {
    setInvoiceNumber(`VCH-${Date.now().toString().slice(-6)}`);
  };

  const cashMemoData: CashMemoData = {
    studentName,
    recipientName: recipientName || studentName,
    paymentDate,
    tuitionFee,
    paymentPurpose,
    invoiceNumber,
    paymentMethod,
    receivedBy,
    authoritySignature,
    payerSignature: payerSignature || (studentName ? studentName.split(' ')[0] : ''),
  };

  // Direct Full-Sheet A5 Landscape PDF Download
  const handleDownloadPDF = async () => {
    if (!printAreaRef.current) return;
    setIsDownloading(true);

    try {
      if (document.fonts) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      }

      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1280,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // A5 Landscape format: 210mm wide × 148mm tall
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a5',
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 148;
      // 3.5mm margin to fill the full A5 paper edge-to-edge
      const margin = 3.5;
      const availableWidth = pageWidth - margin * 2; // 203mm
      const availableHeight = pageHeight - margin * 2; // 141mm

      let imgWidth = availableWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');

      const cleanName = (studentName || 'Student').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
      const fileName = `Atomic_Cash_Memo_${invoiceNumber}_${cleanName}_A5.pdf`;

      // Dual trigger: Blob URL download for maximum browser/iframe compatibility + pdf.save fallback
      try {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 1500);
      } catch (e) {
        pdf.save(fileName);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback: download as high-res PNG image
      try {
        const element = printAreaRef.current;
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2.5,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            windowWidth: 1280,
          });
          const imgData = canvas.toDataURL('image/png');
          const cleanName = (studentName || 'Student').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
          const link = document.createElement('a');
          link.download = `Atomic_Cash_Memo_${invoiceNumber}_${cleanName}.png`;
          link.href = imgData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 3000);
        }
      } catch (e2) {
        console.error('Fallback image download failed:', e2);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Download high-resolution PNG image
  const handleDownloadImage = async () => {
    if (!printAreaRef.current) return;
    setIsDownloading(true);

    try {
      if (document.fonts) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      }

      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1280,
      });

      const cleanName = (studentName || 'Student').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
      const fileName = `Atomic_Cash_Memo_${invoiceNumber}_${cleanName}.png`;

      canvas.toBlob((blob) => {
        if (!blob) {
          const imgData = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.download = fileName;
          link.href = imgData;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 1500);
      }, 'image/png');

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Direct synchronized Print Handler with graceful fallback
  const handlePrint = () => {
    window.focus();
    try {
      window.print();
    } catch (err) {
      console.warn('Direct print blocked by sandbox, downloading PDF instead:', err);
      handleDownloadPDF();
    }
  };

  const handleSaveToLedger = () => {
    if (!onSaveReceipt) return;
    const feeNum = Number(tuitionFee) || 0;

    const newReceipt: ReceiptData = {
      id: `rcp_memo_${Date.now()}`,
      receiptNo: invoiceNumber,
      type: 'student',
      targetId: selectedStudentId || `guest_${Date.now()}`,
      targetName: studentName || 'Walk-in Student',
      studentId: selectedStudentId ? students.find((s) => s.id === selectedStudentId)?.studentId : undefined,
      contactNumber: '01834899620',
      programme: paymentPurpose,
      branch: 'Narayanganj',
      amountPaid: feeNum,
      totalFee: feeNum,
      dueAmount: 0,
      date: paymentDate,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      receiverName: receivedBy,
      paymentMethod,
    };

    onSaveReceipt(newReceipt);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      className={`receipt-modal-overlay fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-1 sm:p-3 md:p-4'
      } bg-black/80 backdrop-blur-xs overflow-y-auto`}
    >
      {/* Dynamic print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A5 landscape;
                margin: 4mm 5mm;
              }
            }
          `,
        }}
      />

      <div
        className={`receipt-modal-card relative w-full ${
          isFullscreen
            ? 'h-screen w-screen max-w-none max-h-none rounded-none border-0'
            : 'max-w-[98vw] 2xl:max-w-[1600px] h-[96vh] rounded-2xl border-2 border-[#6d1a22]'
        } bg-[#fdfbf7] shadow-2xl overflow-hidden transition-all flex flex-col`}
      >
        {/* Top Header Control Bar */}
        <div className="no-print bg-[#6d1a22] text-[#fcf7ee] px-4 py-3 flex flex-wrap items-center justify-between border-b border-[#521218] gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#521218] flex items-center justify-center text-[#f6dfbf] border border-[#88242d]">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base">
                  ক্যাশ মেমো / পেমেন্ট ভাউচার (Cash Memo & Payment Voucher)
                </h3>
                <span className="text-[11px] bg-[#521218] text-[#fbf5eb] px-2 py-0.5 rounded font-mono font-bold border border-[#7d1e26]">
                  #{invoiceNumber}
                </span>
              </div>
              <p className="text-[10px] text-[#e8cbb0]">
                অফিসিয়াল ফরম্যাট • A5 ল্যান্ডস্কেপ ভাউচার
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Blank Form Toggle */}
            <button
              onClick={() => setIsBlankForm(!isBlankForm)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                isBlankForm
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                  : 'bg-[#521218] text-gray-200 border-[#7d1e26] hover:text-white'
              }`}
              title="হাতে লেখার জন্য খালি ভাউচার প্রিন্ট করুন"
            >
              {isBlankForm ? '✓ খালি ফর্ম সক্রিয়' : 'খালি ফর্ম (Blank Slip)'}
            </button>

            {/* Download PDF (A5) */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white shadow-md transition-all active:scale-95 cursor-pointer border border-[#f59e0b]/50 disabled:opacity-50"
              title="A5 ল্যান্ডস্কেপ PDF হিসেবে সরাসরি ডাউনলোড করুন"
            >
              {isDownloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileDown size={14} />
              )}
              <span>ডাউনলোড PDF (A5)</span>
            </button>

            {/* Download Image (PNG) */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#521218] hover:bg-[#430c12] text-[#fcf7ee] border border-[#85252e] transition-colors cursor-pointer disabled:opacity-50"
              title="ছবি (PNG) ডাউনলোড করুন"
            >
              <ImageIcon size={13} />
              <span>ছবি</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl bg-[#faf4ea] text-[#6d1a22] hover:bg-[#ffffff] transition-all shadow-md active:scale-95 cursor-pointer border border-[#ebd7be]"
              title="সরাসরি প্রিন্ট করুন (A5 Landscape)"
            >
              <Printer size={14} />
              <span>প্রিন্ট করুন</span>
            </button>

            {/* Save to Receipts Ledger */}
            {onSaveReceipt && !isBlankForm && (
              <button
                onClick={handleSaveToLedger}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white shadow-md transition-all active:scale-95 cursor-pointer"
                title="রসিদ খতিয়ানে যোগ করুন"
              >
                <Save size={14} />
                <span className="hidden md:inline">সংরক্ষণ</span>
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl text-[#fcf7ee] hover:bg-[#521218] transition-colors cursor-pointer"
              title={isFullscreen ? 'স্বাভাবিক আকার (Restore Size)' : 'ফুল স্ক্রিন করুন (Fullscreen)'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#fcf7ee] hover:bg-[#521218] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {downloadSuccess && (
          <div className="no-print bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={14} />
            <span>ক্যাশ মেমো ভাউচারটি সফলভাবে ডাউনলোড হয়েছে!</span>
          </div>
        )}

        {savedSuccess && (
          <div className="no-print bg-emerald-700 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={14} />
            <span>ভাউচারটি সফলভাবে রসিদ খতিয়ানে সংরক্ষণ করা হয়েছে!</span>
          </div>
        )}

        {/* Body Container */}
        <div className="cash-memo-body-container flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6 bg-[#fbf8f2]">
          {/* LEFT COLUMN: Input Form Controls */}
          <div className="no-print xl:col-span-4 lg:col-span-5 space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-[#e2d5c5] shadow-xs overflow-y-auto max-h-[84vh]">
            <div className="flex items-center justify-between pb-2 border-b border-[#ebdccf]">
              <span className="text-xs font-black text-[#6d1a22] uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={13} />
                ভাউচার তথ্য পূরণ করুন
              </span>
              <button
                type="button"
                onClick={handleGenerateNewInvoice}
                className="text-[11px] text-[#6d1a22] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                title="নতুন ইনভয়েস নং তৈরি করুন"
              >
                <RefreshCw size={11} /> নতুন নং
              </button>
            </div>

            {/* Existing Student Selector */}
            {students.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  শিক্ষার্থী নির্বাচন করুন (ঐচ্ছিক):
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-800 focus:ring-2 focus:ring-[#6d1a22] cursor-pointer"
                >
                  <option value="">-- নতুন বা যেকোনো শিক্ষার্থী --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentId}) - {s.programme}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                শিক্ষার্থীর নাম (Student Name) *
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="যেমন: Rahim Ahmed"
                className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-800 font-bold focus:ring-2 focus:ring-[#6d1a22]"
              />
            </div>

            {/* Recipient Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                গ্রহীতা / অভিভাবকের নাম (Recipient Name)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="যেমন: Mr. Karim (Guardian) বা শিক্ষার্থীর নাম"
                className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-800 focus:ring-2 focus:ring-[#6d1a22]"
              />
            </div>

            {/* Tuition Fee & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  টিউশন ফি (Tuition fee ৳) *
                </label>
                <input
                  type="number"
                  value={tuitionFee}
                  onChange={(e) => setTuitionFee(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="3500"
                  className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-900 font-black focus:ring-2 focus:ring-[#6d1a22]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  তারিখ (Payment Date)
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-800 font-mono focus:ring-2 focus:ring-[#6d1a22]"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                পরিশোধ পদ্ধতি (Payment Method):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['cash', 'bkash', 'nagad'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-[#7c3aed] text-white border-[#6d28d9] shadow-xs'
                        : 'bg-[#faf6ee] text-gray-700 border-[#d9c7b4] hover:bg-[#f1e6d4]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        paymentMethod === method ? 'bg-white' : 'bg-transparent border border-gray-400'
                      }`}
                    />
                    <span>{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Purpose */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                পেমেন্টের উদ্দেশ্য (Payment Purpose)
              </label>
              <input
                type="text"
                value={paymentPurpose}
                onChange={(e) => setPaymentPurpose(e.target.value)}
                placeholder="যেমন: Physics (Mechanics & Quantum) - Class Fee"
                className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-800 focus:ring-2 focus:ring-[#6d1a22]"
              />
            </div>

            {/* Invoice Number & Received By */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ইনভয়েস নং (Invoice No)
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-[#6d1a22] font-mono font-bold focus:ring-2 focus:ring-[#6d1a22]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  আদায়কারী (Received By)
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-800 focus:ring-2 focus:ring-[#6d1a22]"
                />
              </div>
            </div>

            {/* Authority Signature & Payer Signature */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  অনুমোদিত কর্মকর্তা স্বাক্ষর
                </label>
                <input
                  type="text"
                  value={authoritySignature}
                  onChange={(e) => setAuthoritySignature(e.target.value)}
                  placeholder="Principal (AI)"
                  className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-800 font-serif italic focus:ring-2 focus:ring-[#6d1a22]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  প্রদানকারী স্বাক্ষর (Payer Sig)
                </label>
                <input
                  type="text"
                  value={payerSignature}
                  onChange={(e) => setPayerSignature(e.target.value)}
                  placeholder={studentName ? studentName.split(' ')[0] : 'স্বাক্ষর'}
                  className="w-full text-xs p-2 rounded-xl border border-[#d9c7b4] bg-[#fdfbf7] text-gray-800 font-serif italic focus:ring-2 focus:ring-[#6d1a22]"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Printable Voucher Preview */}
          <div className="cash-memo-preview-col xl:col-span-8 lg:col-span-7 flex flex-col items-center justify-start min-w-0 flex-1">
            <div className="no-print text-xs font-bold text-gray-700 mb-2.5 flex items-center justify-between w-full px-1">
              <span className="font-extrabold text-[#521218] flex items-center gap-1.5">
                <span>লাইভ প্রিভিউ (A5 Landscape 210mm × 148mm):</span>
              </span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300">
                ✓ সম্পূর্ণ ভিউ (Full Size Unclipped View)
              </span>
            </div>

            {/* Voucher Sheet Wrapper */}
            <div className="receipt-print-wrapper w-full bg-[#f4ece1] p-3 sm:p-5 lg:p-6 rounded-2xl shadow-inner border border-[#d9c7b4] overflow-x-auto flex items-center justify-center flex-1 min-h-[520px]">
              <div ref={printAreaRef} className="w-[780px] min-w-[780px] max-w-[780px] shrink-0 bg-white rounded-2xl shadow-xl transition-all">
                <CashMemoVoucher data={cashMemoData} isBlank={isBlankForm} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
