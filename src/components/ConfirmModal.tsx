import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'হ্যাঁ, মুছে ফেলুন',
  cancelText = 'বাতিল করুন',
  isDestructive = true,
}) => {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl ${isDestructive ? 'bg-rose-100 text-[#be123c]' : 'bg-amber-100 text-[#b45309]'} flex items-center justify-center mx-auto mb-3 shadow-inner`}>
          {isDestructive ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-[#521218] font-serif tracking-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 mt-2 leading-relaxed font-medium">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold rounded-xl border border-[#d9c7b4] text-gray-700 hover:bg-[#faf4ea] transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 text-xs font-black rounded-xl text-white shadow-md transition-all active:scale-95 cursor-pointer ${
              isDestructive
                ? 'bg-[#be123c] hover:bg-[#9f1239]'
                : 'bg-[#6d1a22] hover:bg-[#521218]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
