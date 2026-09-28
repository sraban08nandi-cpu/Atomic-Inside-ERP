import React, { useRef, useState, useEffect } from 'react';
import { ReceiptData } from '../types';
import { numberToWordsBengali, numberToWordsEnglish } from '../utils/numberToWords';
import { AtomicLogo } from './AtomicLogo';
import { CashMemoVoucher, CashMemoData } from './CashMemoVoucher';
import {
  Printer,
  X,
  CheckCircle2,
  Building,
  Phone,
  Calendar,
  Clock,
  BookOpen,
  Copy,
  Receipt as ReceiptIcon,
  MessageSquare,
  FileDown,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  Check,
  FileText,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface ReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [printFormat, setPrintFormat] = useState<'cashmemo' | 'a5' | 'a4' | 'thermal'>('cashmemo');
  const [copyType, setCopyType] = useState<'client' | 'office'>('client');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'pdf' | 'image' | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && receipt) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [receipt, onClose]);

  if (!receipt) return null;

  const isStudent = receipt.type === 'student';
  const hasDue = receipt.dueAmount > 0;

  // Direct A5 / A4 / POS PDF Download
  const handleDownloadPDF = async () => {
    if (!printAreaRef.current) return;
    setIsDownloading(true);
    setDownloadStatus('pdf');

    try {
      if (document.fonts) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      }

      const element = printAreaRef.current;
      const isCashMemo = printFormat === 'cashmemo';
      const isA5 = printFormat === 'a5';
      const isThermal = printFormat === 'thermal';

      // For cash memo, target the 780px voucher directly if present
      const targetElement = isCashMemo
        ? ((element.querySelector('.cash-memo-sheet') as HTMLElement) || element)
        : element;

      const canvas = await html2canvas(targetElement, {
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

      let pdf: jsPDF;
      if (isCashMemo) {
        // A5 Landscape for Cash Memo Voucher: 210mm × 148mm
        pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a5',
          compress: true,
        });
      } else if (isThermal) {
        const thermalHeight = Math.max(120, (canvas.height * 74) / canvas.width + 10);
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [80, thermalHeight],
          compress: true,
        });
      } else if (isA5) {
        // Standard A5 Portrait: 148mm × 210mm
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5',
          compress: true,
        });
      } else {
        // Standard A4: 210mm × 297mm
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = isCashMemo ? 3.5 : isThermal ? 3 : 4; // mm
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      let imgWidth = availableWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');

      const cleanName = (receipt.targetName || 'Customer').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
      const docPrefix = isCashMemo
        ? 'Atomic_Cash_Memo'
        : isStudent
        ? 'Atomic_Money_Receipt'
        : 'Atomic_Faculty_Voucher';
      const formatTag = isCashMemo ? 'CashMemo_A5' : isThermal ? 'Thermal' : isA5 ? 'A5' : 'A4';
      const fileName = `${docPrefix}_${receipt.receiptNo}_${cleanName}_${formatTag}.pdf`;

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
      console.error('Error generating PDF:', error);
      try {
        const element = printAreaRef.current;
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            windowWidth: 1024,
          });
          const imgData = canvas.toDataURL('image/png');
          const cleanName = (receipt.targetName || 'Customer').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
          const link = document.createElement('a');
          link.download = `Atomic_Receipt_${receipt.receiptNo}_${cleanName}.png`;
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
      setDownloadStatus(null);
    }
  };

  // Direct High-Resolution Image Download (PNG)
  const handleDownloadImage = async () => {
    if (!printAreaRef.current) return;
    setIsDownloading(true);
    setDownloadStatus('image');

    try {
      if (document.fonts) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      }

      const element = printAreaRef.current;
      const isCashMemo = printFormat === 'cashmemo';
      const targetElement = isCashMemo
        ? ((element.querySelector('.cash-memo-sheet') as HTMLElement) || element)
        : element;

      const canvas = await html2canvas(targetElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1280,
      });

      const cleanName = (receipt.targetName || 'Customer').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
      const docPrefix =
        printFormat === 'cashmemo'
          ? 'Atomic_Cash_Memo'
          : isStudent
          ? 'Atomic_Money_Receipt'
          : 'Atomic_Faculty_Voucher';
      const fileName = `${docPrefix}_${receipt.receiptNo}_${cleanName}.png`;

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
      setDownloadStatus(null);
    }
  };

  // Direct Synchronized Print Handler with graceful fallback
  const handlePrint = () => {
    window.focus();
    try {
      window.print();
    } catch (err) {
      console.warn('Direct print blocked by sandbox, downloading PDF instead:', err);
      handleDownloadPDF();
    }
  };

  const getSmsText = () => {
    return isStudent
      ? `অ্যাটমিক শিক্ষা পরিবার (Atomic Inside)\nমানি রসিদ নং: ${receipt.receiptNo}\nশিক্ষার্থী: ${receipt.targetName} (${receipt.studentId || ''})\nপ্রোগ্রাম: ${receipt.programme}\nপরিশোধ: ৳${receipt.amountPaid.toLocaleString()} (বকেয়া: ৳${receipt.dueAmount.toLocaleString()})\nতারিখ: ${receipt.date} ${receipt.time}\nক্যাম্পাস: ${receipt.branch}\nআদায়কারী: ${receipt.receiverName}\nধন্যবাদ!`
      : `অ্যাটমিক শিক্ষা পরিবার (Atomic Inside)\nসম্মানী ভাউচার নং: ${receipt.receiptNo}\nশিক্ষক: ${receipt.targetName}\nবিষয়/প্রোগ্রাম: ${receipt.programme}\nসম্মানী প্রদান: ৳${receipt.amountPaid.toLocaleString()} (বকেয়া: ৳${receipt.dueAmount.toLocaleString()})\nতারিখ: ${receipt.date} ${receipt.time}\nক্যাম্পাস: ${receipt.branch}\nইস্যুকারী: ${receipt.receiverName}`;
  };

  const handleCopySMS = () => {
    navigator.clipboard.writeText(getSmsText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const rawContact = receipt.contactNumber || '';
    const cleanMobile = rawContact.replace(/[^0-9]/g, '');
    const mobileWithCode = cleanMobile.startsWith('880')
      ? cleanMobile
      : cleanMobile.startsWith('0')
      ? `88${cleanMobile}`
      : `880${cleanMobile}`;
    const url = `https://wa.me/${mobileWithCode}?text=${encodeURIComponent(getSmsText())}`;
    window.open(url, '_blank');
  };

  // Prepare Cash Memo Data matching User's template
  const cashMemoData: CashMemoData = {
    studentName: receipt.targetName,
    recipientName: isStudent ? receipt.targetName : 'অভিভাবক / অনুষদ সদস্য',
    paymentDate: receipt.date,
    tuitionFee: receipt.amountPaid,
    paymentPurpose: isStudent
      ? `${receipt.programme} (একাডেমিক ক্লাস ফি)`
      : `${receipt.programme} (শ্রেণিকক্ষে পাঠদান সম্মানী)`,
    invoiceNumber: receipt.receiptNo,
    paymentMethod: receipt.paymentMethod,
    receivedBy: receipt.receiverName,
    authoritySignature: 'Principal (AI)',
    payerSignature: receipt.targetName ? receipt.targetName.split(' ')[0] : '',
  };

  return (
    <div
      className={`receipt-modal-overlay fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-1 sm:p-3 md:p-4'
      } bg-black/80 backdrop-blur-xs overflow-hidden`}
    >
      {/* Inject dynamic print page sizing matching current selection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: ${
                  printFormat === 'cashmemo'
                    ? 'A5 landscape'
                    : printFormat === 'thermal'
                    ? '80mm auto'
                    : printFormat === 'a4'
                    ? 'A4 portrait'
                    : 'A5 portrait'
                };
                margin: ${
                  printFormat === 'cashmemo'
                    ? '4mm 5mm'
                    : printFormat === 'thermal'
                    ? '3mm'
                    : printFormat === 'a4'
                    ? '10mm'
                    : '6mm 7mm'
                };
              }
              body {
                background: white !important;
              }
              .no-print {
                display: none !important;
              }
              .receipt-modal-overlay {
                position: static !important;
                background: transparent !important;
                padding: 0 !important;
                overflow: visible !important;
                display: block !important;
              }
              .receipt-modal-card {
                box-shadow: none !important;
                border: none !important;
                max-width: 100% !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                margin: 0 !important;
                border-radius: 0 !important;
              }
              .receipt-print-wrapper {
                padding: 0 !important;
                background: transparent !important;
                overflow: visible !important;
              }
            }
          `,
        }}
      />

      <div
        className={`receipt-modal-card relative w-full ${
          isFullscreen
            ? 'h-screen w-screen max-w-none max-h-none rounded-none border-0'
            : printFormat === 'cashmemo'
            ? 'max-w-[98vw] 2xl:max-w-[1550px] h-[95vh] rounded-2xl border-2 border-[#6d1a22]'
            : printFormat === 'a4'
            ? 'max-w-[96vw] xl:max-w-[1100px] 2xl:max-w-[1250px] h-[95vh] rounded-2xl border-2 border-[#6d1a22]'
            : printFormat === 'thermal'
            ? 'max-w-[520px] h-[95vh] rounded-2xl border-2 border-[#6d1a22]'
            : 'max-w-[96vw] xl:max-w-[1100px] 2xl:max-w-[1250px] h-[95vh] rounded-2xl border-2 border-[#6d1a22]'
        } bg-[#fdfbf7] shadow-2xl overflow-hidden transition-all flex flex-col`}
      >
        {/* Modal Top Control Bar (Non-Printable) */}
        <div className="no-print shrink-0 bg-[#6d1a22] text-[#fcf7ee] px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between border-b border-[#521218] gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#521218] flex items-center justify-center text-[#f6dfbf] border border-[#88242d]">
              {printFormat === 'cashmemo' ? <FileText size={18} /> : <ReceiptIcon size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                  {printFormat === 'cashmemo'
                    ? 'ক্যাশ মেমো / পেমেন্ট ভাউচার (Payment Voucher)'
                    : isStudent
                    ? 'অফিসিয়াল শিক্ষার্থী মানি রসিদ'
                    : 'অনুষদ শিক্ষক সম্মানী ভাউচার'}
                </span>
                <span className="text-[11px] bg-[#521218] text-[#fbf5eb] px-2 py-0.5 rounded font-mono font-bold border border-[#7d1e26]">
                  #{receipt.receiptNo}
                </span>
              </div>
              <p className="text-[10px] text-[#e8cbb0]">
                ফরম্যাট: <strong className="text-white">{printFormat.toUpperCase()}</strong> • গ্রাহক কপি
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format toggle */}
            <div className="flex items-center bg-[#521218] p-1 rounded-xl text-xs font-semibold border border-[#7d1e26]">
              {/* Cash Memo Voucher Button */}
              <button
                onClick={() => setPrintFormat('cashmemo')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                  printFormat === 'cashmemo'
                    ? 'bg-[#faf4ea] text-[#6d1a22] font-black shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="অফিসিয়াল ক্যাশ মেমো / পেমেন্ট ভাউচার"
              >
                <FileText size={12} />
                <span>ক্যাশ মেমো</span>
                {printFormat === 'cashmemo' && (
                  <span className="text-[9px] bg-[#ea580c] text-white px-1 rounded font-bold">
                    ভাউচার
                  </span>
                )}
              </button>

              {/* Standard A5 Certificate */}
              <button
                onClick={() => setPrintFormat('a5')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${
                  printFormat === 'a5'
                    ? 'bg-[#faf4ea] text-[#6d1a22] font-black shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="A5 স্ট্যান্ডার্ড সার্টিফিকেট রসিদ"
              >
                <span>সার্টিফিকেট A5</span>
              </button>

              {/* Standard A4 */}
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  printFormat === 'a4'
                    ? 'bg-[#faf4ea] text-[#6d1a22] font-black shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="A4 পেপার সাইজ"
              >
                A4 পেপার
              </button>

              {/* POS Slip */}
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  printFormat === 'thermal'
                    ? 'bg-[#faf4ea] text-[#6d1a22] font-black shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="৮০মিমি পিওএস থার্মাল স্লিপ"
              >
                পিওএস (POS)
              </button>
            </div>

            {/* DOWNLOAD BUTTONS */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white shadow-md transition-all active:scale-95 cursor-pointer border border-[#f59e0b]/50 disabled:opacity-50"
                title="A5 সাইজের নিখুঁত PDF হিসেবে ডাউনলোড করুন"
              >
                {isDownloading && downloadStatus === 'pdf' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileDown size={14} />
                )}
                <span>
                  ডাউনলোড PDF ({printFormat === 'cashmemo' ? 'A5 ভাউচার' : printFormat.toUpperCase()})
                </span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isDownloading}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-[#521218] hover:bg-[#430c12] text-[#fcf7ee] border border-[#85252e] transition-colors cursor-pointer disabled:opacity-50"
                title="ছবি (PNG) হিসেবে সংরক্ষণ করুন"
              >
                {isDownloading && downloadStatus === 'image' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ImageIcon size={13} />
                )}
                <span>ছবি</span>
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-[#faf4ea] text-[#6d1a22] hover:bg-[#ffffff] transition-all shadow-md active:scale-95 cursor-pointer border border-[#ebd7be]"
              title="রসিদ সরাসরি প্রিন্ট করুন"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>

            {/* WhatsApp Send */}
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#25D366] text-white hover:bg-[#1eb755] transition-colors shadow-xs cursor-pointer"
              title="গ্রাহকের হোয়াটসঅ্যাপে পাঠান"
            >
              <MessageSquare size={13} />
              <span className="hidden md:inline">হোয়াটসঅ্যাপ</span>
            </button>

            {/* Copy SMS */}
            <button
              onClick={handleCopySMS}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-[#58141b] text-[#fcf7ee] hover:bg-[#430c12] transition-colors border border-[#85252e] cursor-pointer"
              title="এসএমএস টেক্সট কপি করুন"
            >
              {copied ? (
                <CheckCircle2 size={13} className="text-emerald-300" />
              ) : (
                <Copy size={13} />
              )}
              <span className="hidden md:inline">{copied ? 'কপি হয়েছে!' : 'এসএমএস'}</span>
            </button>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl text-[#fcf7ee] hover:bg-[#521218] transition-colors cursor-pointer border border-[#7d1e26] flex items-center justify-center"
              title={isFullscreen ? 'স্বাভাবিক আকার (Restore Size)' : 'ফুলস্ক্রিন ভিউ (Full Screen)'}
              aria-label={isFullscreen ? 'Restore View' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#fcf7ee] hover:bg-[#521218] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Download Success Banner Notification */}
        {downloadSuccess && (
          <div className="no-print shrink-0 bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 size={15} />
            <span>সফলভাবে ডাউনলোড সম্পন্ন হয়েছে!</span>
          </div>
        )}

        {/* PRINTABLE RECEIPT CONTENT AREA */}
        <div className="receipt-print-wrapper flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 bg-[#ece7dd] text-[#241315] relative select-text transition-all flex justify-center items-start">
          <div
            ref={printAreaRef}
            className={`w-full ${
              printFormat === 'cashmemo'
                ? 'max-w-4xl mx-auto flex justify-center'
                : printFormat === 'thermal'
                ? 'max-w-[420px] mx-auto text-[11px]'
                : printFormat === 'a5'
                ? 'max-w-[850px] mx-auto'
                : 'max-w-[900px] mx-auto'
            }`}
          >
            {/* OPTION 1: USER'S CASH MEMO / PAYMENT VOUCHER DESIGN */}
            {printFormat === 'cashmemo' ? (
              <div className="border border-[#d9c7b4] rounded-2xl shadow-sm bg-white p-2 sm:p-4 overflow-x-auto flex justify-center">
                <div className="w-[780px] min-w-[780px] max-w-[780px] shrink-0 bg-white">
                  <CashMemoVoucher data={cashMemoData} />
                </div>
              </div>
            ) : (
              /* OPTION 2: OFFICIAL CERTIFICATE RECEIPT DESIGN */
              <>
                {/* Subtle Institutional Watermark in background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.038] select-none">
                  <AtomicLogo size={printFormat === 'thermal' ? 240 : 380} />
                </div>

                {/* Receipt Outer Frame */}
                <div className="relative border-2 border-[#6d1a22] p-4 sm:p-6 md:p-8 rounded-2xl bg-white shadow-xl">
                  {/* Decorative Inner Golden Inset Border */}
                  <div className="absolute inset-1.5 rounded-xl border border-[#c4a98e]/40 pointer-events-none" />

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#6d1a22] pb-3.5 mb-3.5 gap-3 text-center sm:text-left relative">
                    <div className="flex items-center gap-3.5">
                      <AtomicLogo size={printFormat === 'thermal' ? 52 : 64} />
                      <div>
                        <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#6d1a22] font-bangla leading-tight">
                          অ্যাটমিক শিক্ষা পরিবার
                        </h1>
                        <h2 className="text-xs sm:text-[13px] font-black text-[#450e13] font-serif tracking-wider uppercase">
                          Atomic Inside Coaching Care • Narayanganj
                        </h2>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 justify-center sm:justify-start">
                          <span className="text-[10px] sm:text-[10.5px] font-bold text-[#7d212b]">
                            পদার্থবিজ্ঞান • রসায়ন • উচ্চতর গণিত • জীববিজ্ঞান
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 font-semibold mt-0.5">
                          গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত • রেজিঃ নং: AI-8824/BD • স্থাপিত ২০১৮
                        </p>
                      </div>
                    </div>

                    {/* Receipt Title Badge & Number */}
                    <div className="flex flex-col items-center sm:items-end">
                      <div className="flex items-center gap-1 mb-1">
                        <button
                          type="button"
                          onClick={() => setCopyType(copyType === 'client' ? 'office' : 'client')}
                          className="no-print text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#f4ebe1] hover:bg-[#ebdccf] text-[#6d1a22] border border-[#d6c2ae] cursor-pointer transition-colors"
                          title="ক্লিক করে গ্রাহক কপি বা অফিস কপি নির্বাচন করুন"
                        >
                          {copyType === 'client' ? '✓ গ্রাহক কপি' : '✓ অফিস কপি'}
                        </button>
                        <span className="print-only text-[9px] font-bold px-2 py-0.5 rounded bg-[#f4ebe1] text-[#6d1a22] border border-[#d6c2ae]">
                          {copyType === 'client' ? 'গ্রাহক কপি (Client Copy)' : 'অফিস কপি (Office Copy)'}
                        </span>
                      </div>

                      <span className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#5a141b] via-[#6d1a22] to-[#82212b] text-[#fcf7ee] font-black text-xs uppercase tracking-wider shadow-xs border border-[#480c12]">
                        {isStudent
                          ? 'অফিসিয়াল মানি রসিদ (MONEY RECEIPT)'
                          : 'অনুষদ শিক্ষক সম্মানী ভাউচার (FACULTY VOUCHER)'}
                      </span>

                      <div className="flex items-center gap-1 text-xs font-mono font-black text-[#6d1a22] mt-1.5 bg-[#fdf5ea] px-2.5 py-0.5 rounded border border-[#ecd9c2]">
                        <span>রসিদ নং:</span>
                        <span className="tracking-wide">#{receipt.receiptNo}</span>
                      </div>

                      <span className="text-[9px] text-emerald-800 font-bold flex items-center gap-0.5 mt-0.5">
                        <ShieldCheck size={11} className="text-emerald-700" />
                        ডিজিটালভাবে ভেরিফাইড ও প্রামাণ্য
                      </span>
                    </div>
                  </div>

                  {/* Quick Metadata Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#fdfaf5] p-2.5 rounded-xl border border-[#e6d7c7] text-xs mb-3.5">
                    <div className="border-r border-[#ebdccf] pr-2">
                      <span className="text-gray-500 block text-[9.5px] font-bold uppercase tracking-wider">
                        ক্যাম্পাস (Campus):
                      </span>
                      <span className="font-extrabold text-[#6d1a22] flex items-center gap-1">
                        <Building size={12} className="text-[#6d1a22]" /> {receipt.branch} শাখা
                      </span>
                    </div>
                    <div className="border-r sm:border-r border-[#ebdccf] pr-2">
                      <span className="text-gray-500 block text-[9.5px] font-bold uppercase tracking-wider">
                        তারিখ (Date):
                      </span>
                      <span className="font-bold text-gray-900 flex items-center gap-1 font-mono">
                        <Calendar size={12} className="text-[#6d1a22]" /> {receipt.date}
                      </span>
                    </div>
                    <div className="border-r border-[#ebdccf] pr-2">
                      <span className="text-gray-500 block text-[9.5px] font-bold uppercase tracking-wider">
                        সময় (Time):
                      </span>
                      <span className="font-bold text-gray-900 flex items-center gap-1 font-mono">
                        <Clock size={12} className="text-[#6d1a22]" /> {receipt.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[9.5px] font-bold uppercase tracking-wider">
                        পরিশোধ পদ্ধতি (Method):
                      </span>
                      <span className="font-bold text-[#6d1a22] capitalize flex items-center gap-1">
                        {receipt.paymentMethod === 'cash' ? 'নগদ (Cash)' : receipt.paymentMethod}
                        {receipt.transactionId && (
                          <span className="text-[10px] text-gray-600 font-mono">
                            ({receipt.transactionId})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Recipient & Programme Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 border-b border-[#ebdccd] pb-3.5">
                    {/* Left Column */}
                    <div className="space-y-1.5 bg-[#fefdfb] p-3 rounded-lg border border-[#f0e4d7]">
                      <div className="flex items-baseline justify-between border-b border-dashed border-[#ecd9c5] pb-1">
                        <span className="text-gray-500 font-bold text-[11px]">
                          {isStudent ? 'শিক্ষার্থীর নাম (Student):' : 'অনুষদ সদস্য (Faculty):'}
                        </span>
                        <span className="font-black text-sm text-[#4d1419]">
                          {receipt.targetName}
                        </span>
                      </div>

                      {isStudent && (
                        <div className="flex items-baseline justify-between border-b border-dashed border-[#ecd9c5] pb-1">
                          <span className="text-gray-500 font-bold text-[11px]">
                            রোল / আইডি (Roll/ID):
                          </span>
                          <span className="font-mono font-extrabold text-[#6d1a22] bg-[#fbf5eb] px-2 py-0.5 rounded border border-[#e8d7c4]">
                            {receipt.studentId || receipt.rollNumber || 'STD-01'}
                          </span>
                        </div>
                      )}

                      {isStudent && receipt.studentClass && (
                        <div className="flex items-baseline justify-between border-b border-dashed border-[#ecd9c5] pb-1">
                          <span className="text-gray-500 font-bold text-[11px]">
                            শ্রেণি / ক্লাস (Class):
                          </span>
                          <span className="font-bold text-[#6d1a22] bg-[#fbf5eb] px-2 py-0.5 rounded border border-[#e8d7c4]">
                            {receipt.studentClass}
                          </span>
                        </div>
                      )}

                      <div className="flex items-baseline justify-between">
                        <span className="text-gray-500 font-bold text-[11px]">
                          যোগাযোগ মোবাইল (Phone):
                        </span>
                        <span className="font-bold text-gray-800 font-mono flex items-center gap-1">
                          <Phone size={12} className="text-[#6d1a22]" /> {receipt.contactNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-1.5 bg-[#fefdfb] p-3 rounded-lg border border-[#f0e4d7]">
                      <div className="flex items-baseline justify-between border-b border-dashed border-[#ecd9c5] pb-1">
                        <span className="text-gray-500 font-bold text-[11px]">
                          প্রোগ্রাম / কোর্স (Course):
                        </span>
                        <span className="font-extrabold text-[#6d1a22] flex items-center gap-1">
                          <BookOpen size={12} className="text-[#6d1a22]" /> {receipt.programme}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between border-b border-dashed border-[#ecd9c5] pb-1">
                        <span className="text-gray-500 font-bold text-[11px]">
                          ব্যাচের সময়সূচি (Batch):
                        </span>
                        <span className="font-semibold text-gray-800">
                          {receipt.batchTime || 'সকাল ও বিকাল ব্যাচ'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-gray-500 font-bold text-[11px]">বিবরণ (Particulars):</span>
                        <span className="font-semibold text-gray-700">
                          {isStudent
                            ? 'একাডেমিক বিজ্ঞান পাঠদান ও লেকচার শিট ফি বাবদ'
                            : 'শ্রেণিকক্ষে পাঠদান সম্মানী ও মেধা পারিশ্রমিক'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown Table */}
                  <div className="mb-3.5 overflow-x-auto rounded-xl border border-[#6d1a22] shadow-xs bg-white">
                    <table className="w-full text-xs min-w-[540px] sm:min-w-0">
                      <thead>
                        <tr className="bg-[#6d1a22] text-[#fcf7ee] font-bold">
                          <th className="py-2.5 px-3 text-left">ক্রম (SL)</th>
                          <th className="py-2.5 px-3 text-left">
                            বিবরণ ও কোর্স (Particulars / Course)
                          </th>
                          <th className="py-2.5 px-3 text-right">নির্ধারিত ফি (Total Payable)</th>
                          <th className="py-2.5 px-3 text-right">পরিশোধিত (Paid Amount)</th>
                          <th className="py-2.5 px-3 text-right">বকেয়া (Due)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eee0d3] bg-[#fffdfa]">
                        <tr>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#6d1a22]">০১</td>
                          <td className="py-2.5 px-3">
                            <span className="font-extrabold text-gray-900 block text-xs sm:text-[13px]">
                              {receipt.programme}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {isStudent
                                ? 'নিয়মিত বিজ্ঞান পাঠদান, বিশেষ ক্লাস ও মডেল টেস্ট মূল্যায়ন'
                                : 'অনুষদ ক্লাস পরিচালনা ও মডেল টেস্ট মেধা যাচাই'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-gray-800 font-mono">
                            ৳{receipt.totalFee.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-[#15803d] text-sm font-mono">
                            ৳{receipt.amountPaid.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {hasDue ? (
                              <span className="font-black text-[#be123c] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
                                ৳{receipt.dueAmount.toLocaleString()} (বকেয়া)
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300 text-[11px] inline-flex items-center gap-1">
                                <Check size={11} /> পরিশোধিত (NIL)
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Summary Net Received Row */}
                        <tr className="bg-[#faf4ea] font-bold text-[#450e13] border-t-2 border-[#d9c5b2]">
                          <td colSpan={3} className="py-2.5 px-3 text-right font-extrabold text-xs sm:text-sm">
                            সর্বমোট প্রাপ্তি / পরিশোধিত (Net Amount Received):
                          </td>
                          <td className="py-2.5 px-3 text-right text-base sm:text-lg text-[#15803d] font-black font-mono">
                            ৳{receipt.amountPaid.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right text-xs">
                            {hasDue ? (
                              <span className="text-[#be123c] font-black">
                                অবশিষ্ট বকেয়া: ৳{receipt.dueAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-black">
                                সম্পূর্ণ পরিশোধিত (Paid in Full)
                              </span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* In Words Callout */}
                  <div className="bg-[#f7efe3] border-l-4 border-[#6d1a22] p-2.5 rounded-r-xl text-xs mb-5 space-y-0.5 shadow-xs">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="font-extrabold text-[#6d1a22]">কথায় (In Words):</span>
                      <span className="font-extrabold text-[#450e13] font-bangla text-[13px]">
                        {numberToWordsBengali(receipt.amountPaid)}
                      </span>
                      <span className="text-gray-600 font-medium italic text-[11px]">
                        ({numberToWordsEnglish(receipt.amountPaid)})
                      </span>
                    </div>
                  </div>

                  {/* Signatures & Seal Section */}
                  <div className="grid grid-cols-3 items-end pt-3 pb-2 gap-3 text-center text-xs">
                    {/* Receiver Info */}
                    <div className="flex flex-col items-center">
                      <div className="h-9 flex items-center justify-center">
                        <span className="font-serif italic font-bold text-[#6d1a22] text-sm">
                          {receipt.receiverName ? receipt.receiverName.split(' ')[0] : 'Cashier'}
                        </span>
                      </div>
                      <div className="w-full border-t border-gray-400 pt-1">
                        <p className="font-black text-gray-800 text-[11px]">{receipt.receiverName}</p>
                        <p className="text-[9.5px] text-gray-500 font-semibold">
                          আদায়কারী / ক্যাশিয়ার স্বাক্ষর
                        </p>
                        <p className="text-[8.5px] text-gray-400">Accounts & Cashier</p>
                      </div>
                    </div>

                    {/* Rubber Stamp */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#781822] flex flex-col items-center justify-center text-center p-1 text-[#781822] rotate-[-4deg] bg-[#fff5f5]/70 shadow-xs relative mx-auto shrink-0">
                        <span className="text-[7.5px] font-black uppercase tracking-tight leading-none">
                          অ্যাটমিক শিক্ষা পরিবার
                        </span>
                        <span className="text-[8.5px] font-black uppercase text-[#781822] border-y border-[#781822] my-0.5 px-1 tracking-wider">
                          VERIFIED & APPROVED
                        </span>
                        <span className="text-[7.5px] font-bold font-mono">{receipt.date}</span>
                        <span className="text-[6.5px] uppercase tracking-tighter text-gray-600">
                          NARAYANGANJ CAMPUS
                        </span>
                      </div>
                      <span className="text-[8.5px] text-gray-500 font-bold mt-1">
                        অফিসিয়াল সিলমোহর (Official Seal)
                      </span>
                    </div>

                    {/* Principal Signature */}
                    <div className="flex flex-col items-center">
                      <div className="h-9 flex items-center justify-center">
                        <span className="font-serif italic font-black text-[#450e13] text-sm tracking-wider">
                          Principal (AI)
                        </span>
                      </div>
                      <div className="w-full border-t border-gray-400 pt-1">
                        <p className="font-black text-gray-800 text-[11px]">অনুমোদিত কর্মকর্তা স্বাক্ষর</p>
                        <p className="text-[9.5px] text-gray-500 font-semibold">
                          Branch Principal / Director
                        </p>
                        <p className="text-[8.5px] text-gray-400">অ্যাটমিক শিক্ষা পরিবার</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Barcode & Security ID Strip */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-[#d9c5b2] flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-gray-600 bg-[#fdfbf7] p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-6 w-32 shrink-0"
                        viewBox="0 0 100 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="0" y="0" width="3" height="24" />
                        <rect x="5" y="0" width="1" height="24" />
                        <rect x="8" y="0" width="4" height="24" />
                        <rect x="14" y="0" width="2" height="24" />
                        <rect x="18" y="0" width="1" height="24" />
                        <rect x="21" y="0" width="5" height="24" />
                        <rect x="28" y="0" width="2" height="24" />
                        <rect x="32" y="0" width="3" height="24" />
                        <rect x="37" y="0" width="1" height="24" />
                        <rect x="40" y="0" width="4" height="24" />
                        <rect x="46" y="0" width="2" height="24" />
                        <rect x="50" y="0" width="5" height="24" />
                        <rect x="57" y="0" width="1" height="24" />
                        <rect x="60" y="0" width="3" height="24" />
                        <rect x="65" y="0" width="2" height="24" />
                        <rect x="69" y="0" width="4" height="24" />
                        <rect x="75" y="0" width="1" height="24" />
                        <rect x="78" y="0" width="5" height="24" />
                        <rect x="85" y="0" width="2" height="24" />
                        <rect x="89" y="0" width="3" height="24" />
                        <rect x="94" y="0" width="2" height="24" />
                        <rect x="98" y="0" width="2" height="24" />
                      </svg>
                      <div className="font-mono font-bold text-gray-700">
                        <span>SEC-ID: AI-ERP-{receipt.receiptNo}</span>
                        <span className="block text-[8px] text-gray-400">
                          STATUS: DIGITAL AUTHENTICATED
                        </span>
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="font-bold text-[#6d1a22] block">
                        কাগজের সাইজ: {printFormat.toUpperCase()} স্ট্যান্ডার্ড
                      </span>
                      <span className="text-gray-500">
                        নিরাপত্তা যাচাইকরণ: https://atomicinside.edu.bd/verify/{receipt.receiptNo}
                      </span>
                    </div>
                  </div>

                  {/* Footer Notice */}
                  <div className="mt-2 text-center text-[9px] text-gray-500 space-y-0.5">
                    <p>
                      * এটি অ্যাটমিক ইনসাইড কোচিং ইআরপি কর্তৃক স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত অফিশিয়াল মানি রসিদ।
                      আইডি কার্ড ইস্যু, ক্লাস ও পরীক্ষার সুবিধার জন্য এই রসিদটি সংরক্ষণ করুন।
                    </p>
                    <p className="font-bold text-[#6d1a22]">
                      কেন্দ্রীয় হেল্পলাইন: 01834899620 • ইমেইল: info@atomicinside.edu.bd • নারায়ণগঞ্জ ক্যাম্পাস
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
