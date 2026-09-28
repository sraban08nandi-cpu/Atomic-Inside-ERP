import React, { useState, useRef, useEffect } from 'react';
import { User, TabType, Branch } from '../types';
import { AtomicLogo } from './AtomicLogo';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Receipt,
  WalletCards,
  LogOut,
  MapPin,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Briefcase,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onResetAllData?: () => void;
  onOpenMonthlyReport?: () => void;
  onOpenCashMemo?: () => void;
  onOpenFontSettings?: () => void;
  currentFontName?: string;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  selectedBranch,
  setSelectedBranch,
  onLogout,
  onOpenLogin,
  onResetAllData,
  onOpenMonthlyReport,
  onOpenCashMemo,
}) => {
  const [showBranchInfo, setShowBranchInfo] = useState(false);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  // Close branch dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setShowBranchInfo(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: TabType; label: string; sublabel: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', sublabel: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'students', label: 'শিক্ষার্থী ফি', sublabel: 'Student Fee', icon: <Users size={16} /> },
    { id: 'teachers', label: 'শিক্ষক সম্মানী', sublabel: 'Teacher Pay', icon: <GraduationCap size={16} /> },
    { id: 'class-counting', label: 'ক্লাস কাউন্টিং', sublabel: 'Class Log', icon: <CalendarCheck size={16} /> },
    { id: 'expenses', label: 'খরচ ট্র্যাকার', sublabel: 'Expenses', icon: <WalletCards size={16} /> },
    { id: 'staff-salary', label: 'স্টাফ বেতন', sublabel: 'Staff Salary', icon: <Briefcase size={16} /> },
    { id: 'receipts', label: 'রসিদ খতিয়ান', sublabel: 'Receipts', icon: <Receipt size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7] border-b border-[#e5d8c8] shadow-xs">
      {/* Top Brand Stripe in signature Maroon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#501117] via-[#6d1a22] to-[#8d242e]" />

      {/* Campus Administration Fixed Header Strip */}
      <div className="bg-[#59141b] text-[#f7e6d2] w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-1.5 text-[11px] flex flex-wrap items-center justify-between border-b border-[#471015]">
        <div className="flex items-center gap-1.5 font-bold">
          <MapPin size={12} className="text-[#f5c388]" />
          <span>ক্যাম্পাস পরিচালনা পরিষদ (Administration):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono font-medium text-[11px]">
          <span className="text-white font-bold">1. Founder- Anirban Ghosh</span>
          <span className="text-[#e2a893]">•</span>
          <span className="text-white font-bold">2. ICT Head- Srabon Nondi</span>
          <span className="text-[#e2a893]">•</span>
          <span className="text-white font-bold">3. Manager- Ankon Saha</span>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between py-2.5 sm:py-3 gap-2">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <AtomicLogo size="md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#58141b] tracking-tight font-serif flex items-center gap-1">
                  Atomic Inside
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6d1a22] text-[#fcf7ee] uppercase tracking-wider">
                  ERP
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#7c202a] font-semibold">
                <span className="font-bangla text-sm">অ্যাটমিক শিক্ষা পরিবার</span>
                <span className="hidden md:inline text-[11px] text-[#8c6b61]">• Narayanganj Campus</span>
              </div>
            </div>
          </div>

          {/* Right Controls: Branch Display & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reset to 0 Button */}
            {onResetAllData && (
              <button
                onClick={onResetAllData}
                title="সকল পেমেন্ট ও খরচের হিসাব শূন্য (০) করুন (শিক্ষার্থী বহাল থাকবে)"
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#6d1a22] hover:bg-[#faebdb] border border-[#d9c7b4] transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>হিসাব রিসেট (০)</span>
              </button>
            )}

            {/* Branch Section: Solely Narayanganj with Fixed Text Dropdown/Card */}
            <div className="relative" ref={branchDropdownRef}>
              <button
                type="button"
                onClick={() => setShowBranchInfo(!showBranchInfo)}
                className="flex items-center gap-1.5 bg-[#f7efe3] hover:bg-[#f1e4d3] border-2 border-[#6d1a22] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-[#4d161c] font-black cursor-pointer shadow-xs transition-colors"
                title="ক্যাম্পাস পরিচালনা প্যানেল তথ্য দেখুন"
              >
                <MapPin size={14} className="text-[#6d1a22] shrink-0" />
                <span>Narayanganj</span>
                <ChevronDown size={14} className="text-[#6d1a22] ml-0.5" />
              </button>

              {/* Popover showing the fixed text */}
              {showBranchInfo && (
                <div className="absolute right-0 top-full mt-1.5 w-76 bg-[#fdfbf7] border-2 border-[#6d1a22] rounded-2xl shadow-2xl p-4 z-50 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e2d4c3]">
                    <div className="font-bold text-[#6d1a22] flex items-center gap-1.5">
                      <MapPin size={14} />
                      <span>Narayanganj Campus</span>
                    </div>
                    <span className="text-[10px] bg-[#6d1a22] text-[#fcf7ee] font-bold px-2 py-0.5 rounded-full">
                      সক্রিয় ক্যাম্পাস
                    </span>
                  </div>

                  <div className="mt-2.5 text-[11px] font-bold text-[#54131a]">
                    ক্যাম্পাস প্রশাসন ও পরিচালনা পরিষদ:
                  </div>

                  {/* Fixed Text Requirement */}
                  <div className="mt-1.5 space-y-1 font-mono text-xs font-bold text-gray-900 bg-white p-2.5 rounded-xl border border-[#d9c7b4]">
                    <div className="flex items-center gap-1.5 text-[#521218]">
                      <span className="text-[#6d1a22] font-black">1.</span>
                      <span>Founder- Anirban Ghosh</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#521218]">
                      <span className="text-[#6d1a22] font-black">2.</span>
                      <span>ICT Head- Srabon Nondi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#521218]">
                      <span className="text-[#6d1a22] font-black">3.</span>
                      <span>Manager- Ankon Saha</span>
                    </div>
                  </div>

                  <p className="mt-2 text-[10px] text-gray-500 text-center">
                    অ্যাটমিক শিক্ষা পরিবার • Narayanganj Head Office
                  </p>
                </div>
              )}
            </div>

            {/* Auth / Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#4d161c] leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] font-bold text-[#7c202a] uppercase">
                    {currentUser.role} • Narayanganj
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#6d1a22] text-[#fcf7ee] flex items-center justify-center font-bold text-xs shadow-xs border border-[#4d161c]">
                  {currentUser.name.charAt(0)}
                </div>
                <button
                  onClick={onLogout}
                  title="লগআউট করে লগইন স্ক্রিনে ফিরুন"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#6d1a22] hover:bg-[#faebdb] border border-[#d9c7b4] transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">লগআউট</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6d1a22] text-[#fcf7ee] hover:bg-[#521218] transition-all text-xs sm:text-sm font-semibold shadow-xs"
              >
                <ShieldCheck size={15} />
                <span>স্টাফ লগইন</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1.5 border-t border-[#ede0d2] scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#6d1a22] text-[#fdf8f2] shadow-xs'
                    : 'text-[#5d2b31] hover:text-[#450e14] hover:bg-[#f6eee3]'
                }`}
              >
                {item.icon}
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bangla">{item.label}</span>
                  <span className={`text-[9.5px] font-normal ${isActive ? 'text-[#fce4cb]' : 'text-gray-500'}`}>
                    {item.sublabel}
                  </span>
                </div>
              </button>
            );
          })}

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {onOpenCashMemo && (
              <button
                onClick={onOpenCashMemo}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#faf4ea] hover:bg-white text-[#6d1a22] border border-[#d9c7b4] shadow-2xs transition-all cursor-pointer active:scale-95"
                title="নতুন ক্যাশ মেমো ও পেমেন্ট ভাউচার তৈরি ও প্রিন্ট করুন"
              >
                <FileText size={16} className="text-[#ea580c]" />
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bangla">ক্যাশ মেমো / ভাউচার</span>
                  <span className="text-[9.5px] font-normal text-gray-500">Cash Memo</span>
                </div>
              </button>
            )}

            {onOpenMonthlyReport && (
              <button
                onClick={onOpenMonthlyReport}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#faf4ea] hover:bg-white text-[#6d1a22] border border-[#d9c7b4] shadow-2xs transition-all cursor-pointer active:scale-95"
                title="প্রতি মাসের হিসাব ও এক্সেল রিপোর্ট ডাউনলোড (Monthly Accounting & Excel Export)"
              >
                <FileSpreadsheet size={16} />
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-bangla">মাসিক এক্সেল রিপোর্ট</span>
                  <span className="text-[9.5px] font-normal text-gray-500">Monthly Excel</span>
                </div>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
