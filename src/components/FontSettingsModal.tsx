import React, { useState, useEffect } from 'react';
import { X, Check, Type, Sparkles, Sliders, Eye, RefreshCw } from 'lucide-react';
import { useToast } from './ToastContext';

export type BanglaFontId = 'anek' | 'hind' | 'noto-sans' | 'noto-serif';
export type FontScale = 'compact' | 'normal' | 'comfortable';

export interface FontSettings {
  banglaFont: BanglaFontId;
  fontScale: FontScale;
  smoothRendering: boolean;
}

export const FONT_OPTIONS: {
  id: BanglaFontId;
  nameBn: string;
  nameEn: string;
  tagline: string;
  fontFamily: string;
  badge: string;
  badgeColor: string;
}[] = [
  {
    id: 'anek',
    nameBn: 'অনিক বাংলা',
    nameEn: 'Anek Bangla',
    tagline: 'সর্বাধুনিক, সুপার ক্রিস্প ও সফটওয়্যার ডিসপ্লে উপযোগী (সেরা পছন্দ)',
    fontFamily: "'Anek Bangla', 'Outfit', sans-serif",
    badge: 'প্রস্তাবিত ও আধুনিক',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'hind',
    nameBn: 'হিন্দ শিলিগুড়ি',
    nameEn: 'Hind Siliguri',
    tagline: 'পরিচ্ছন্ন, সুষম ও পাঠকদের অতি পরিচিত ক্লাসিক বাংলা ফন্ট',
    fontFamily: "'Hind Siliguri', 'Outfit', sans-serif",
    badge: 'ক্লাসিক ও নরম',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'noto-sans',
    nameBn: 'নোটো সান্স বাংলা',
    nameEn: 'Noto Sans Bengali',
    tagline: 'গুগল আন্তর্জাতিক মানসম্মত, নিখুঁত যুক্তাক্ষর ও সমান্তরাল মাত্রা',
    fontFamily: "'Noto Sans Bengali', 'Outfit', sans-serif",
    badge: 'গুগল স্ট্যান্ডার্ড',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'noto-serif',
    nameBn: 'নোটো সেরিফ বাংলা',
    nameEn: 'Noto Serif Bengali',
    tagline: 'প্রাতিষ্ঠানিক, রাজকীয় ও ক্যাশ মেমো/মানি রসিদ ভাউচারের নান্দনিক সেরিফ রূপ',
    fontFamily: "'Noto Serif Bengali', 'Times New Roman', serif",
    badge: 'ক্যাশ মেমো ও প্রিন্ট স্পেশাল',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
];

const STORAGE_KEY = 'atomic_bangla_font_settings_v1';

export function getSavedFontSettings(): FontSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // fallback
  }
  return {
    banglaFont: 'anek',
    fontScale: 'normal',
    smoothRendering: true,
  };
}

export function applyFontSettingsToDOM(settings: FontSettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-bangla-font', settings.banglaFont);
  root.setAttribute('data-font-scale', settings.fontScale);

  if (settings.smoothRendering) {
    root.classList.add('subpixel-antialiased');
  } else {
    root.classList.remove('subpixel-antialiased');
  }
}

interface FontSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: FontSettings;
  onSaveSettings: (settings: FontSettings) => void;
}

export const FontSettingsModal: React.FC<FontSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveSettings,
}) => {
  const { showToast } = useToast();
  const [selectedFont, setSelectedFont] = useState<BanglaFontId>(currentSettings.banglaFont);
  const [selectedScale, setSelectedScale] = useState<FontScale>(currentSettings.fontScale);
  const [smoothRendering, setSmoothRendering] = useState<boolean>(currentSettings.smoothRendering);

  if (!isOpen) return null;

  const handleApply = () => {
    const newSettings: FontSettings = {
      banglaFont: selectedFont,
      fontScale: selectedScale,
      smoothRendering,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      // ignore
    }
    applyFontSettingsToDOM(newSettings);
    onSaveSettings(newSettings);
    onClose();

    const fontName = FONT_OPTIONS.find((f) => f.id === selectedFont)?.nameBn || 'অনিক বাংলা';
    showToast('success', 'বাংলা ফন্ট সফলভাবে সেট করা হয়েছে', `${fontName} ফন্ট ইন্টারফেসে সক্রিয় করা হয়েছে। দেখতে এখন আরও চমৎকার লাগছে!`);
  };

  const handleResetDefault = () => {
    setSelectedFont('anek');
    setSelectedScale('normal');
    setSmoothRendering(true);
  };

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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#fcfaf6] border-2 border-[#6d1a22] rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col animate-in zoom-in-95 duration-150"
        style={{ fontFamily: "'Anek Bangla', 'Hind Siliguri', 'Outfit', sans-serif" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#501117] via-[#6d1a22] to-[#88242d] p-5 text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-200">
              <Type size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-normal">
                  বাংলা ফন্ট ও নান্দনিক টাইপোগ্রাফি
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-[#501117]">
                  নতুন অপ্টিমাইজেশন
                </span>
              </div>
              <p className="text-xs text-amber-100/90 font-medium mt-0.5">
                আপনার চোখে যা সবচেয়ে সুন্দর লাগে সেই বাংলা ফন্ট ও সাইজ বেছে নিন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Section 1: Font Selection Cards */}
          <div>
            <label className="block text-xs sm:text-sm font-extrabold text-[#521218] mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#ea580c]" />
                বাংলা ফন্ট স্টাইল নির্বাচন করুন:
              </span>
              <span className="text-[11px] text-gray-500 font-normal">
                (সরাসরি লাইভ প্রিভিউ দেখুন)
              </span>
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {FONT_OPTIONS.map((font) => {
                const isSelected = selectedFont === font.id;
                return (
                  <div
                    key={font.id}
                    onClick={() => setSelectedFont(font.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-white border-[#6d1a22] shadow-md ring-2 ring-[#6d1a22]/15'
                        : 'bg-white/80 border-[#e3d5c5] hover:border-[#bda38b] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#6d1a22] bg-[#6d1a22] text-white'
                              : 'border-gray-400 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-base font-bold text-gray-900"
                              style={{ fontFamily: font.fontFamily }}
                            >
                              {font.nameBn}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              ({font.nameEn})
                            </span>
                            <span
                              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${font.badgeColor}`}
                            >
                              {font.badge}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-gray-600 mt-1 pl-7 leading-snug">
                      {font.tagline}
                    </p>

                    {/* Live Preview Box with Authentic Bengali Sample */}
                    <div
                      className="mt-2.5 pl-3 py-2 pr-2.5 rounded-xl bg-[#fcf9f2] border border-[#ebdccf] text-gray-900 text-xs sm:text-sm font-semibold flex items-center justify-between"
                      style={{ fontFamily: font.fontFamily }}
                    >
                      <span className="truncate">
                        অ্যাটমিক শিক্ষা পরিবার • ক্যাশ মেমো ও হিসাব খতিয়ান
                      </span>
                      <span className="text-[11px] font-bold text-[#6d1a22] shrink-0 bg-white px-2 py-0.5 rounded border border-[#e2d3c3]">
                        ৳ ১২,৫০০
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Font Size Scaling */}
          <div className="bg-white p-4 rounded-2xl border border-[#e2d5c3] shadow-2xs">
            <label className="block text-xs sm:text-sm font-extrabold text-[#521218] mb-2 flex items-center gap-1.5">
              <Sliders size={15} className="text-[#6d1a22]" />
              ফন্ট সাইজ ও পঠনযোগ্যতা (Text Size Scaling):
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedScale('compact')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedScale === 'compact'
                    ? 'bg-[#6d1a22] text-white border-[#501117] shadow-xs'
                    : 'bg-[#faf6ee] text-gray-700 border-[#e0d2c2] hover:bg-[#f3eadc]'
                }`}
              >
                কমপ্যাক্ট (৯৫%)
              </button>
              <button
                type="button"
                onClick={() => setSelectedScale('normal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedScale === 'normal'
                    ? 'bg-[#6d1a22] text-white border-[#501117] shadow-xs'
                    : 'bg-[#faf6ee] text-gray-700 border-[#e0d2c2] hover:bg-[#f3eadc]'
                }`}
              >
                স্বাভাবিক (১০০%) ✓
              </button>
              <button
                type="button"
                onClick={() => setSelectedScale('comfortable')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedScale === 'comfortable'
                    ? 'bg-[#6d1a22] text-white border-[#501117] shadow-xs'
                    : 'bg-[#faf6ee] text-gray-700 border-[#e0d2c2] hover:bg-[#f3eadc]'
                }`}
              >
                আরামদায়ক ও বড় (১০৬%)
              </button>
            </div>
          </div>

          {/* Section 3: Live Real-Time Preview Area */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#f8f2e7] to-[#f4ebe0] border border-[#d9c7b4]">
            <div className="flex items-center justify-between text-xs font-bold text-[#6d1a22] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                লাইভ প্রদর্শন নমুনা (Sample Preview):
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                Font: {FONT_OPTIONS.find((f) => f.id === selectedFont)?.nameEn}
              </span>
            </div>
            <div
              className="bg-white p-3.5 rounded-xl border border-[#d9c7b4] space-y-1.5 shadow-2xs"
              style={{
                fontFamily: FONT_OPTIONS.find((f) => f.id === selectedFont)?.fontFamily,
              }}
            >
              <div className="text-base sm:text-lg font-black text-[#58141b] leading-tight">
                অ্যাটমিক শিক্ষা পরিবার — নারায়ণগঞ্জ ক্যাম্পাস
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                শিক্ষার্থী ভর্তি, মাসিক টিউশন ফি গ্রহণ, ডিজিটাল মানি রসিদ ও ক্যাশ মেমো প্রস্তুতকরণ, শিক্ষক সম্মানী ও ক্লাস হিসাব খতিয়ান।
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-bold text-xs text-[#6d1a22]">
                <span className="bg-[#fcf5eb] px-2 py-0.5 rounded border border-[#ebdccf]">
                  মোট আদায়: ৳ ৪,৮২,৫০০
                </span>
                <span className="bg-[#fcf5eb] px-2 py-0.5 rounded border border-[#ebdccf]">
                  মোট ব্যয়: ৳ ৩,১৫,০০০
                </span>
                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  নিট ক্যাশ স্থিতি: ৳ ১,৬৭,৫০০
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f5ecdf] border-t border-[#dfcfbd] p-4 flex items-center justify-between gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>ডিফল্ট রিস্টোর</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-200/70 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Check size={16} />
              <span>ফন্ট প্রয়োগ করুন (Apply)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
