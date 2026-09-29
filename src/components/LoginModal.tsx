import React, { useState, useEffect } from 'react';
import { User, StaffRole } from '../types';
import { AtomicLogo } from './AtomicLogo';
import { ShieldCheck, X, Building2, Crown, Laptop, MapPin, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [role, setRole] = useState<StaffRole>('founder');
  const [entryCode, setEntryCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  // Fixed official entry codes as requested:
  // 1. Founder- 9620
  // 2. ICT Head- 1878
  // 3. Manager- 4048
  const ROLE_ENTRY_CODES: Record<StaffRole, string> = {
    founder: '9620',
    ict_head: '1878',
    manager: '4048',
  };

  const roleConfigs: Record<
    StaffRole,
    {
      fixedName: string;
      roleTitle: string;
      email: string;
      desc: string;
      icon: React.ReactNode;
      signature: string;
    }
  > = {
    founder: {
      fixedName: 'Anirban Ghosh',
      roleTitle: 'Founder',
      email: 'founder@atomicinside.edu.bd',
      desc: 'Supreme Authority',
      icon: <Crown size={16} />,
      signature: 'Anirban Ghosh',
    },
    ict_head: {
      fixedName: 'Srabon Nondi',
      roleTitle: 'ICT Head',
      email: 'ict.head@atomicinside.edu.bd',
      desc: 'IT & Infrastructure',
      icon: <Laptop size={16} />,
      signature: 'Srabon Nondi',
    },
    manager: {
      fixedName: 'Ankon Saha',
      roleTitle: 'Manager',
      email: 'manager@atomicinside.edu.bd',
      desc: 'Branch & Operations',
      icon: <Building2 size={16} />,
      signature: 'Ankon Saha',
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = entryCode.trim();
    const expectedCode = ROLE_ENTRY_CODES[role];

    if (!cleanCode) {
      setErrorMsg('অনুগ্রহ করে এন্ট্রি কোড লিখুন');
      return;
    }

    if (cleanCode !== expectedCode) {
      setErrorMsg(`${roleConfigs[role].roleTitle}-এর সঠিক কোড প্রদান করুন`);
      return;
    }

    const active = roleConfigs[role];
    onLogin({
      id: `usr_${role}_${Date.now()}`,
      name: active.fixedName,
      email: active.email,
      role,
      branch: 'Narayanganj',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden">
        {/* Top Accent Stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-[#501117] via-[#6d1a22] to-[#8d242e]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-[#6d1a22] hover:bg-[#f6eee2] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <AtomicLogo size={70} />
            <h2 className="mt-2 text-xl font-black text-[#521218] font-serif tracking-tight">
              Atomic Inside ERP
            </h2>
            <p className="text-xs font-bold text-[#6d1a22] font-bangla">
              অ্যাটমিক শিক্ষা পরিবার • Narayanganj
            </p>
          </div>

          {/* Role Badges: Exactly 3 */}
          <div className="mb-4">
            <span className="block text-[11px] font-bold text-[#6d1a22] uppercase tracking-wider mb-2">
              স্টাফ পদবী নির্বাচন করুন (Staff Role):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['founder', 'ict_head', 'manager'] as const).map((rKey) => {
                const cfg = roleConfigs[rKey];
                const isSelected = role === rKey;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => {
                      setRole(rKey);
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#6d1a22] bg-[#f8efe3] font-bold text-[#6d1a22] shadow-xs ring-1 ring-[#6d1a22]'
                        : 'border-[#e4d4c3] bg-white text-gray-700 hover:bg-[#faf5ec]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={isSelected ? 'text-[#6d1a22]' : 'text-gray-400'}>
                          {cfg.icon}
                        </span>
                        <span className="font-extrabold text-xs">{cfg.roleTitle}</span>
                      </div>
                      <div className="text-[11px] font-bold text-gray-900 mt-1">{cfg.fixedName}</div>
                      <div className="text-[9.5px] text-gray-500 mt-0.5">{cfg.desc}</div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-[#ebdccf] text-center bg-white/70 rounded py-0.5">
                      <span className="font-serif italic text-[11px] font-black text-[#6d1a22] tracking-wider block">
                        {cfg.signature}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Narayanganj Campus Section */}
          <div className="mb-4 bg-[#f5ecdf] border border-[#d5be9f] rounded-xl p-3 flex items-center justify-between text-xs font-bold text-[#521218]">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#6d1a22]" />
              ব্রাঞ্চ / ক্যাম্পাস:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#6d1a22] text-[#fcf7ee] text-[11px] font-bold">
              Narayanganj
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#450e13] mb-1">
                কর্মকর্তা (Staff Officer)
              </label>
              <input
                type="text"
                readOnly
                value={`${roleConfigs[role].fixedName} (${roleConfigs[role].roleTitle})`}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-100 border border-[#d8c5b2] rounded-lg text-gray-800 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#450e13] mb-1">
                এন্ট্রি কোড (Entry Code)
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-2.5 text-[#6d1a22]" />
                <input
                  type="password"
                  value={entryCode}
                  onChange={(e) => {
                    setEntryCode(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="এন্ট্রি কোড লিখুন"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#d8c5b2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d1a22] text-gray-800 font-mono font-bold"
                  required
                />
              </div>
              {errorMsg && (
                <p className="mt-1 text-xs text-red-600 font-bold">{errorMsg}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>প্রবেশ করুন (Confirm & Enter)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
