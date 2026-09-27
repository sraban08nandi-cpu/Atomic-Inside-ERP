import React, { useRef, useState, useEffect } from 'react';
import { StaffSalaryVoucher, StaffSalaryVoucherData } from './StaffSalaryVoucher';
import {
  Printer,
  X,
  CheckCircle2,
  FileDown,
  Image as ImageIcon,
  MessageSquare,
  Copy,
  Maximize2,
  Minimize2,
  Loader2,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface StaffSalaryVoucherModalProps {
  voucher: StaffSalaryVoucherData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StaffSalaryVoucherModal: React.FC<StaffSalaryVoucherModalProps> = ({
  voucher,
  isOpen,
  onClose,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [copyType, setCopyType] = useState<'office' | 'staff'>('staff');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

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

  if (!isOpen || !voucher) return null;

  const voucherWithCopy: StaffSalaryVoucherData = {
    ...voucher,
    copyType,
  };

  const handlePrint = () => {
    window.print();
  };

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
      const target = (element.querySelector('.staff-salary-voucher-sheet') as HTMLElement) || element;

      const canvas = await html2canvas(target, {
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
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      let imgWidth = availableWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const xOffset = (pageWidth - imgWidth) / 2;
      const yOffset = 10;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');

      const cleanName = (voucher.staffName || 'Staff').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
      const fileName = `Atomic_Salary_Voucher_${voucher.voucherNo}_${cleanName}.pdf`;

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
      } catch {
        pdf.save(fileName);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error downloading salary voucher PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

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
      const target = (element.querySelector('.staff-salary-voucher-sheet') as HTMLElement) || element;

      const canvas = await html2canvas(target, {
        scale: 2.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1280,
      });

      const cleanName = (voucher.staffName || 'Staff').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
      const fileName = `Atomic_Salary_Voucher_${voucher.voucherNo}_${cleanName}.png`;

      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error downloading voucher image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const getSmsText = () => {
    return `[অ্যাটমিক শিক্ষা পরিবার]\nবেতন পরিশোধ ভাউচার #${voucher.voucherNo}\nকর্মকর্তা: ${voucher.staffName}\nপদবি: ${voucher.designation}\nবেতন মাস: ${voucher.month}\nমূল বেতন: ৳${voucher.basicSalary.toLocaleString()}\nবোনাস: ৳${voucher.bonus.toLocaleString()}\nকর্তন: ৳${voucher.deduction.toLocaleString()}\nসর্বমোট প্রদত্ত বেতন: ৳${voucher.netAmount.toLocaleString()}\nতারিখ: ${voucher.date}\nক্যাম্পাস: নারায়ণগঞ্জ\nধন্যবাদান্তে,\nঅ্যাটমিক শিক্ষা পরিবার ERP`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getSmsText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const cleanMobile = (voucher.contactNumber || '').replace(/[^0-9]/g, '');
    const mobileWithCode = cleanMobile.startsWith('880')
      ? cleanMobile
      : cleanMobile.startsWith('0')
      ? `88${cleanMobile}`
      : `880${cleanMobile}`;
    const url = `https://wa.me/${mobileWithCode}?text=${encodeURIComponent(getSmsText())}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      } bg-black/80 backdrop-blur-xs overflow-hidden`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              body {
                background: white !important;
              }
              .no-print {
                display: none !important;
              }
              .staff-voucher-overlay {
                position: static !important;
                background: transparent !important;
                padding: 0 !important;
                overflow: visible !important;
                display: block !important;
              }
              .staff-voucher-card {
                box-shadow: none !important;
                border: none !important;
                max-width: 100% !important;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
                margin: 0 !important;
                border-radius: 0 !important;
              }
            }
          `,
        }}
      />

      <div
        className={`staff-voucher-card relative w-full ${
          isFullscreen
            ? 'h-screen max-w-none rounded-none'
            : 'max-w-4xl h-[95vh] rounded-2xl'
        } bg-[#1f191a] shadow-2xl flex flex-col overflow-hidden border border-[#58141b]`}
      >
        {/* TOP CONTROL BAR (Fixed) */}
        <div className="no-print shrink-0 bg-[#58141b] text-[#fcf7ee] px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#731c25] z-20">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5">
              <span>কর্মকর্তা-কর্মচারী বেতন ভাউচার</span>
            </span>
            <span className="font-mono text-xs bg-[#731c25] px-2 py-0.5 rounded font-bold">
              #{voucher.voucherNo}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Copy Type Selector */}
            <div className="flex items-center bg-[#420f14] p-0.5 rounded-lg border border-[#7d212b] text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCopyType('staff')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  copyType === 'staff'
                    ? 'bg-[#fcf7ee] text-[#58141b]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                কর্মকর্তা কপি
              </button>
              <button
                type="button"
                onClick={() => setCopyType('office')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  copyType === 'office'
                    ? 'bg-[#fcf7ee] text-[#58141b]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                অফিস কপি
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-black rounded-lg bg-[#faf4ea] text-[#58141b] hover:bg-white transition-all shadow-xs cursor-pointer active:scale-95"
              title="ভাউচার সরাসরি প্রিন্ট করুন"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>

            {/* PDF Download */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-black rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="পিডিএফ ডাউনলোড করুন"
            >
              {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Image Download */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg bg-[#420f14] text-[#fcf7ee] hover:bg-[#340b0f] transition-colors border border-[#731c25] cursor-pointer"
              title="ইমেজ ডাউনলোড করুন"
            >
              <ImageIcon size={13} />
              <span className="hidden md:inline">ইমেজ</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#1eb755] transition-colors shadow-xs cursor-pointer"
              title="হোয়াটসঅ্যাপে ভাউচার বিবরণ পাঠান"
            >
              <MessageSquare size={13} />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* Copy SMS */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg bg-[#420f14] text-[#fcf7ee] hover:bg-[#340b0f] transition-colors border border-[#731c25] cursor-pointer"
              title="বিবরণ কপি করুন"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden md:inline">{copied ? 'কপি!' : 'কপি'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-[#fcf7ee] hover:bg-[#420f14] transition-colors cursor-pointer border border-[#731c25]"
              title={isFullscreen ? 'স্বাভাবিক আকার' : 'ফুলস্ক্রিন ভিউ'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#fcf7ee] hover:bg-[#420f14] transition-colors cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="no-print shrink-0 bg-emerald-600 text-white text-xs font-bold py-1 px-4 text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>ভাউচার ডাউনলোড সম্পন্ন হয়েছে!</span>
          </div>
        )}

        {/* PRINTABLE VOUCHER VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#eae4d9] flex justify-center items-start">
          <div ref={printAreaRef} className="w-full max-w-[820px] mx-auto">
            <StaffSalaryVoucher data={voucherWithCopy} />
          </div>
        </div>
      </div>
    </div>
  );
};
