import React, { useState } from 'react';
import { User, Branch, StaffRole } from '../types';
import { AtomicLogo } from './AtomicLogo';
import { useToast } from './ToastContext';
import {
  KeyRound,
  ShieldCheck,
  Building2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Crown,
  Laptop,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  defaultBranch?: Branch;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { showToast } = useToast();

  // Exactly 3 roles as specified
  const [role, setRole] = useState<StaffRole>('founder');
  const [entryCode, setEntryCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Fixed official entry codes for each role as requested:
  // 1. Founder- 9620
  // 2. ICT Head- 1878
  // 3. Manager- 4048
  const ROLE_ENTRY_CODES: Record<StaffRole, string> = {
    founder: '9620',
    ict_head: '1878',
    manager: '4048',
  };

  // Exactly the 3 official profiles requested
  const roleConfigs: Record<
    StaffRole,
    {
      fixedName: string;
      roleTitle: string;
      email: string;
      badge: string;
      icon: React.ReactNode;
    }
  > = {
    founder: {
      fixedName: 'Anirban Ghosh',
      roleTitle: 'Founder',
      email: 'founder@atomicinside.edu.bd',
      badge: 'Supreme Administrative Authority & Founder',
      icon: <Crown size={19} />,
    },
    ict_head: {
      fixedName: 'Srabon Nondi',
      roleTitle: 'ICT Head',
      email: 'ict.head@atomicinside.edu.bd',
      badge: 'IT & System Infrastructure Technical Head',
      icon: <Laptop size={19} />,
    },
    manager: {
      fixedName: 'Ankon Saha',
      roleTitle: 'Manager',
      email: 'manager@atomicinside.edu.bd',
      badge: 'Campus Operations & Finance Manager',
      icon: <Building2 size={19} />,
    },
  };

  const handleRoleSelect = (selectedRole: StaffRole) => {
    setRole(selectedRole);
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = entryCode.trim();
    const expectedCode = ROLE_ENTRY_CODES[role];

    if (!cleanCode) {
      setErrorMsg('অনুগ্রহ করে এন্ট্রি কোড প্রদান করুন (Please enter the access entry code)');
      return;
    }

    setIsVerifying(true);

    // Verify entry code strictly against role's assigned fixed code
    setTimeout(() => {
      if (cleanCode === expectedCode) {
        const activeProfile = roleConfigs[role];
        const loggedUser: User = {
          id: `usr_${role}_${Date.now()}`,
          name: activeProfile.fixedName,
          email: activeProfile.email,
          role,
          branch: 'Narayanganj',
        };

        showToast(
          'success',
          'লগইন সফল হয়েছে!',
          `${activeProfile.fixedName} (${activeProfile.roleTitle}) হিসেবে Narayanganj ব্রাঞ্চে প্রবেশ করেছেন।`
        );
        onLogin(loggedUser);
      } else {
        setIsVerifying(false);
        const otherRole = (Object.keys(ROLE_ENTRY_CODES) as StaffRole[]).find(
          (r) => ROLE_ENTRY_CODES[r] === cleanCode
        );
        if (otherRole) {
          setErrorMsg(
            `ভুল কোড! এই কোডটি ${roleConfigs[otherRole].roleTitle}-এর জন্য নির্ধারিত। ${roleConfigs[role].roleTitle}-এর সঠিক কোড প্রদান করুন।`
          );
        } else {
          setErrorMsg(
            `ভুল এন্ট্রি কোড! ${roleConfigs[role].roleTitle} পদের জন্য সঠিক কোড প্রদান করুন।`
          );
        }
        showToast('error', 'প্রবেশাধিকার ব্যাহত', `${roleConfigs[role].roleTitle}-এর এন্ট্রি কোড সঠিক নয়।`);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] flex flex-col justify-between selection:bg-[#6d1a22] selection:text-[#fcf7ee] font-sans relative overflow-hidden">
      {/* Background Decorative Blur Orbits */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#6d1a22]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#6d1a22]/5 blur-3xl pointer-events-none" />

      {/* Top Institutional Header Bar */}
      <header className="bg-[#6d1a22] text-[#fcf7ee] py-2.5 px-4 sm:px-8 border-b-2 border-[#521218] shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <ShieldCheck size={16} className="text-[#f7dfbe]" />
          <span>অ্যাটমিক শিক্ষা পরিবার • Narayanganj Campus ERP Portal</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#f7e4ce] font-medium">
          <span>Official Secure Portal</span>
          <span>•</span>
          <span>SSL 256-Bit Protection</span>
          <span>•</span>
          <span>Version 2026.2</span>
        </div>
      </header>

      {/* Center Main Login Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-[#fdfbf7] rounded-3xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden transition-all">
          {/* Header Banner with Maroon Identity & Official Logo */}
          <div className="relative bg-gradient-to-br from-[#501117] via-[#6d1a22] to-[#8d242e] text-[#fcf7ee] p-6 sm:p-8 text-center border-b border-[#4d1015]">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-[#faf5eb] rounded-2xl shadow-xl border-2 border-[#f7e0c4] transform hover:scale-105 transition-transform">
                <AtomicLogo size={80} />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white">
              Atomic Inside
            </h1>
            <p className="text-sm sm:text-base font-bold text-[#fde4cb] font-bangla mt-0.5">
              অ্যাটমিক শিক্ষা পরিবার • কেন্দ্রীয় একাডেমিক ও আর্থিক ব্যবস্থাপনা ইআরপি
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-3 py-0.5 rounded-full bg-[#faf5eb] text-[#6d1a22] uppercase tracking-wider shadow-xs">
                Narayanganj Campus • Official Gate
              </span>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Step 1: Select Staff Role (Founder, ICT Head, Manager) */}
              <div>
                <label className="block text-xs font-bold text-[#521218] uppercase tracking-wider mb-2">
                  ১. দায়িত্বপ্রাপ্ত কর্মকর্তা নির্বাচন করুন (Select Staff Officer):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(['founder', 'ict_head', 'manager'] as const).map((rKey) => {
                    const cfg = roleConfigs[rKey];
                    const isSelected = role === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => handleRoleSelect(rKey)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#6d1a22] bg-[#f8efe3] text-[#6d1a22] font-bold shadow-xs ring-2 ring-[#6d1a22]'
                            : 'border-[#e5d6c5] bg-white text-gray-700 hover:bg-[#faf4ea]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={isSelected ? 'text-[#6d1a22]' : 'text-gray-400'}>
                            {cfg.icon}
                          </span>
                          <span className="text-sm font-black leading-tight">{cfg.roleTitle}</span>
                        </div>
                        <div className="mt-2 text-xs font-bold text-gray-900">{cfg.fixedName}</div>
                        <span className="text-[10px] text-gray-500 mt-1 leading-tight">{cfg.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Branch Section - Narayanganj */}
              <div className="bg-[#f5ecdf] border-2 border-[#d5be9f] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#6d1a22] text-[#fcf7ee] flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#521218] uppercase tracking-wider">
                      ২. ক্যাম্পাস ও শাখা (Campus Branch)
                    </label>
                    <div className="text-sm font-black text-gray-900">
                      Narayanganj Campus (নারায়ণগঞ্জ শাখা)
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#6d1a22] text-[#fcf7ee] text-xs font-bold shadow-xs">
                    <CheckCircle2 size={12} />
                    Narayanganj
                  </span>
                  <span className="text-[11px] text-gray-600 font-semibold mt-1">
                    লগইন কর্মকর্তা: <strong className="text-[#6d1a22]">{roleConfigs[role].fixedName}</strong>
                  </span>
                </div>
              </div>

              {/* Step 3: Entry Code Field */}
              <div className="bg-[#f8f1e7] p-4 rounded-2xl border-2 border-[#d9c7b4] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#521218] uppercase tracking-wide flex items-center gap-1.5">
                    <KeyRound size={15} className="text-[#6d1a22]" />
                    <span>৩. সিস্টেম সিকিউরিটি এন্ট্রি কোড (System Security Entry Code) *</span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    required
                    value={entryCode}
                    onChange={(e) => {
                      setEntryCode(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="সিস্টেম এন্ট্রি কোড লিখুন"
                    className="w-full pl-3.5 pr-10 py-3 text-sm sm:text-base font-mono font-black tracking-widest bg-white border-2 border-[#6d1a22]/40 rounded-xl focus:ring-2 focus:ring-[#6d1a22] focus:border-[#6d1a22] focus:outline-none text-gray-900 placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-[#6d1a22] p-1 cursor-pointer"
                    title={showCode ? 'Hide Code' : 'Show Code'}
                  >
                    {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Error feedback */}
                {errorMsg && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#be123c] pt-1">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 px-4 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-98 disabled:opacity-75"
              >
                {isVerifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>যাচাই করা হচ্ছে (Authenticating...)...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>ERP সিস্টেমে প্রবেশ করুন (Enter ERP System)</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Narayanganj Campus Quick Info Footer Banner */}
            <div className="p-3 rounded-xl bg-white border border-[#ede0d2] text-center space-y-1">
              <span className="block font-bold text-xs text-[#521218]">
                Atomic Inside Coaching ERP • Narayanganj
              </span>
              <p className="text-[11px] text-gray-500">
                শিক্ষার্থী ভর্তি ফি, শিক্ষক ক্লাস কাউন্টিং, অনারিয়াম ও খরচ ব্যবস্থাপনা
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-[#fbf7f0] border-t border-[#e2d5c3] py-4 text-center text-xs text-gray-600 px-4">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-1.5">
          <p className="font-bangla text-xs text-[#6d1a22] font-bold">
            অ্যাটমিক শিক্ষা পরিবার • Narayanganj Campus
          </p>
          <div className="text-[11px] text-gray-600 font-medium">
            1. Founder- Anirban Ghosh • 2. ICT Head- Srabon Nondi • 3. Manager- Ankon Saha
          </div>
          <p className="text-[11px] text-gray-400">
            © {new Date().getFullYear()} Atomic Inside ERP. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
