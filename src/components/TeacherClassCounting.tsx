import React, { useState, useEffect } from 'react';
import { TeacherClassLog, Teacher, Branch } from '../types';
import { exportToCSV } from '../utils/exportCsv';
import { useToast } from './ToastContext';
import { ConfirmModal } from './ConfirmModal';
import {
  CalendarCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  X,
  GraduationCap,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';

interface TeacherClassCountingProps {
  classLogs: TeacherClassLog[];
  teachers: Teacher[];
  onAddClassLog: (log: TeacherClassLog) => void;
  onDeleteClassLog?: (logId: string) => void;
  selectedBranch: Branch;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

export const TeacherClassCounting: React.FC<TeacherClassCountingProps> = ({
  classLogs,
  teachers,
  onAddClassLog,
  onDeleteClassLog,
  selectedBranch,
  isAddModalOpen: externalModalOpen,
  setIsAddModalOpen: setExternalModalOpen,
}) => {
  const { showToast } = useToast();
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
  const setIsModalOpen = setExternalModalOpen || setInternalModalOpen;

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchTopic, setSearchTopic] = useState('');
  const [confirmLogToDelete, setConfirmLogToDelete] = useState<{ id: string; topic: string } | null>(null);

  // Form State
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [batchName, setBatchName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationHours, setDurationHours] = useState<string | number>('');
  const [studentAttendanceCount, setStudentAttendanceCount] = useState<string | number>('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmLogToDelete) {
          setConfirmLogToDelete(null);
        } else if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmLogToDelete, isModalOpen, setIsModalOpen]);

  const filteredLogs = classLogs
    .filter((log) => !log.branch || log.branch === 'Narayanganj')
    .filter((log) => (selectedTeacherId === 'all' ? true : log.teacherId === selectedTeacherId))
    .filter((log) => {
      if (selectedSubject === 'all') return true;
      return log.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    })
    .filter(
      (log) =>
        log.topic.toLowerCase().includes(searchTopic.toLowerCase()) ||
        log.teacherName.toLowerCase().includes(searchTopic.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchTopic.toLowerCase())
    );

  // Stats calculation
  const totalClasses = filteredLogs.length;
  const totalHours = filteredLogs.reduce((acc, log) => acc + log.durationHours, 0);
  const totalHonorariumValue = filteredLogs.reduce(
    (acc, log) => acc + log.rateApplied,
    0
  );

  const handleExportCSV = () => {
    const data = filteredLogs.map((log, idx) => ({
      'SL': idx + 1,
      'Date': log.date,
      'Time': log.time,
      'Teacher Name': log.teacherName,
      'Subject': log.subject,
      'Topic Taught': log.topic,
      'Batch Name': log.batchName,
      'Branch': log.branch,
      'Duration (Hours)': log.durationHours,
      'Students Attended': log.studentAttendanceCount,
      'Honorarium Rate': log.rateApplied,
      'Status': log.status,
    }));
    exportToCSV(`Atomic_Class_Logs_${selectedBranch.replace(/\s+/g, '_')}`, data);
    showToast('success', 'Class Logs Exported', 'CSV report generated successfully');
  };

  const handleQuickAddClass = (teacher: Teacher) => {
    const newLog: TeacherClassLog = {
      id: `cls_${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      subject: teacher.subject,
      batchName: 'Regular Academic Batch',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      durationHours: 1,
      studentAttendanceCount: 0,
      topic: `${teacher.subject.split(' ')[0]} Lecture`,
      branch: 'Narayanganj',
      status: 'conducted',
      rateApplied: teacher.ratePerClass,
    };
    onAddClassLog(newLog);
    showToast('success', 'Quick Class Logged', `+1 class added for ${teacher.name}`);
  };

  const handleDelete = (logId: string, topic: string) => {
    setConfirmLogToDelete({ id: logId, topic });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === formTeacherId) || teachers[0];
    if (!teacher) {
      showToast('error', 'Faculty Required', 'Please register a teacher first to log classes.');
      return;
    }

    const newLog: TeacherClassLog = {
      id: `cls_${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      subject: teacher.subject,
      batchName: batchName || 'Regular Batch',
      date,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      durationHours: Number(durationHours) || 1,
      studentAttendanceCount: Number(studentAttendanceCount) || 0,
      topic,
      branch: 'Narayanganj',
      status: 'conducted',
      rateApplied: teacher.ratePerClass,
    };

    onAddClassLog(newLog);
    setIsModalOpen(false);
    showToast('success', 'Class Logged Successfully', `Recorded: ${topic} for ${teacher.name}`);
    setTopic('');
    setBatchName('');
    setDurationHours('');
    setStudentAttendanceCount('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fdfbf7] p-5 rounded-2xl border border-[#d9c7b4] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#521218] font-serif">
              শিক্ষকের ক্লাস গণনা ও একাডেমিক রেজিস্টার
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f6eee2] text-[#6d1a22] border border-[#d9c7b4]">
              {totalClasses} টি ক্লাস গণনা সম্পন্ন
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Faculty Class Counting & Academic Logs • দৈনিক পাঠদান ট্র্যাকিং, শিক্ষার্থী উপস্থিতি যাচাই ও স্বয়ংক্রিয় শিক্ষক সম্মানী হিসাবায়ন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f7efe3] hover:bg-[#eee1cf] text-[#6d1a22] border border-[#d9c7b4] font-bold text-xs transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download size={14} />
            <span>সিএসভি এক্সপোর্ট (CSV)</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>নতুন ক্লাস এন্ট্রি (Log Class)</span>
          </button>
        </div>
      </div>

      {/* Per Teacher Class Counting Dropdown Selector */}
      <div className="bg-[#f8efe3] border-2 border-[#d9c7b4] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6d1a22] text-[#fcf7ee] flex items-center justify-center shrink-0">
            <Filter size={18} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#521218] uppercase tracking-wider">
              প্রতি শিক্ষক ক্লাস গণনা (Per Teacher Class Counting Dropdown)
            </label>
            <p className="text-[11px] text-gray-600">
              নির্দিষ্ট শিক্ষকের পৃথক ক্লাস লগ, মোট ক্লাস সংখ্যা ও সম্মানী দেখতে শিক্ষক বাছাই করুন
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto min-w-[280px]">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border-2 border-[#6d1a22]/30 rounded-xl text-xs sm:text-sm font-bold text-[#6d1a22] focus:outline-none focus:ring-2 focus:ring-[#6d1a22] cursor-pointer shadow-xs"
          >
            <option value="all">👥 সকল শিক্ষক (All Faculty Members Combined)</option>
            {teachers.map((t) => {
              const tLogs = classLogs.filter(
                (l) => l.teacherId === t.id && (!l.branch || l.branch === 'Narayanganj')
              );
              const tClasses = tLogs.length;
              return (
                <option key={t.id} value={t.id}>
                  👨‍🏫 {t.name} — ({t.subject}) [{tClasses} টি ক্লাস সম্পন্ন]
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Selected Teacher Highlight Info Banner (if a specific teacher is selected) */}
      {selectedTeacherId !== 'all' && (() => {
        const activeT = teachers.find((t) => t.id === selectedTeacherId);
        if (!activeT) return null;
        return (
          <div className="bg-gradient-to-r from-[#6d1a22] to-[#8d242e] text-[#fcf7ee] p-4 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center font-black text-lg border border-white/20">
                👨‍🏫
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-white">{activeT.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-gray-900 font-bold uppercase">
                    {activeT.subject}
                  </span>
                </div>
                <p className="text-xs text-[#fde4cb] mt-0.5">
                  প্রতি ক্লাস সম্মানী হার: <strong>৳{activeT.ratePerClass.toLocaleString()}</strong> • শাখা: {activeT.branch}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/20 px-3.5 py-2 rounded-xl text-xs border border-white/10 font-mono">
              <span>এই শিক্ষকের মোট ক্লাস: <strong className="text-amber-300">{totalClasses} টি</strong></span>
              <span>•</span>
              <span>মোট সম্মানী: <strong className="text-emerald-300">৳{totalHonorariumValue.toLocaleString()}</strong></span>
            </div>
          </div>
        );
      })()}

      {/* 3 Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Classes */}
        <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#d9c7b4] shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#6d1a22]/10 text-[#6d1a22] flex items-center justify-center shrink-0">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">মোট ক্লাস সম্পন্ন (Conducted)</p>
            <h3 className="text-2xl font-black text-[#521218]">
              {totalClasses} <span className="text-sm font-semibold text-gray-500">টি ক্লাস</span>
            </h3>
          </div>
        </div>

        {/* Total Hours */}
        <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#d9c7b4] shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">মোট পাঠদান সময় (Hours)</p>
            <h3 className="text-2xl font-black text-[#521218]">
              {totalHours.toFixed(1)} <span className="text-sm font-semibold text-gray-500">ঘণ্টা</span>
            </h3>
          </div>
        </div>

        {/* Accrued Honorarium */}
        <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#d9c7b4] shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">মোট সম্মানী মান (Billing Value)</p>
            <h3 className="text-2xl font-black text-[#15803d]">
              ৳{totalHonorariumValue.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Science Subjects Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#fdfbf7] border border-[#d9c7b4] rounded-xl text-xs">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedSubject === 'all'
              ? 'bg-[#6d1a22] text-[#fcf7ee]'
              : 'text-gray-700 hover:text-[#6d1a22] hover:bg-[#f6eee2]'
          }`}
        >
          সব বিষয় (All Subjects)
        </button>
        <button
          onClick={() => setSelectedSubject('physics')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedSubject === 'physics'
              ? 'bg-[#be123c] text-white'
              : 'text-gray-700 hover:text-[#be123c] hover:bg-rose-50'
          }`}
        >
          <span>⚛️ পদার্থবিজ্ঞান (Physics)</span>
        </button>
        <button
          onClick={() => setSelectedSubject('mathematics')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedSubject === 'mathematics'
              ? 'bg-[#1e293b] text-white'
              : 'text-gray-700 hover:text-[#1e293b] hover:bg-slate-100'
          }`}
        >
          <span>📐 উচ্চতর গণিত (Higher Math)</span>
        </button>
        <button
          onClick={() => setSelectedSubject('chemistry')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedSubject === 'chemistry'
              ? 'bg-[#2563eb] text-white'
              : 'text-gray-700 hover:text-[#2563eb] hover:bg-blue-50'
          }`}
        >
          <span>🧪 রসায়ন (Chemistry)</span>
        </button>
        <button
          onClick={() => setSelectedSubject('biology')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedSubject === 'biology'
              ? 'bg-[#15803d] text-white'
              : 'text-gray-700 hover:text-[#15803d] hover:bg-emerald-50'
          }`}
        >
          <span>🧬 জীববিজ্ঞান (Biology)</span>
        </button>
      </div>

      {/* Quick Class Adder Pills for each Faculty */}
      <div className="bg-[#faf5eb] p-3.5 rounded-xl border border-[#e3d3c1] text-xs">
        <span className="font-bold text-[#450e13] block mb-2">
          ⚡ দ্রুত ক্লাস এন্ট্রি (1-Click Fast Class Logger) — ক্লিক করলেই শিক্ষকের ক্লাস সংখ্যা ও প্রদেয় সম্মানী স্বয়ংক্রিয়ভাবে যুক্ত হবে:
        </span>
        <div className="flex flex-wrap gap-2">
          {teachers.map((t) => (
            <button
              key={t.id}
              onClick={() => handleQuickAddClass(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#d9c7b4] hover:border-[#6d1a22] hover:bg-[#fff9f0] font-bold text-gray-800 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus size={13} className="text-[#6d1a22]" />
              <span>{t.name.split(' ')[0]}</span>
              <span className="text-[10px] text-[#6d1a22] bg-[#f8ede1] px-1.5 py-0.5 rounded font-mono font-bold">
                +১ ক্লাস (৳{t.ratePerClass})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="পাঠদানের বিষয়, অধ্যায়, বা শিক্ষকের নাম দিয়ে খুঁজুন (Search topic, faculty)..."
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#fdfbf7] border border-[#d9c7b4] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6d1a22] text-gray-800"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#fdfbf7] border border-[#d9c7b4] px-3.5 py-2 rounded-xl text-xs">
          <Filter size={14} className="text-[#6d1a22]" />
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">সকল শিক্ষক (All Faculty Members)</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.subject})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Counting Logs Table */}
      <div className="bg-[#fdfbf7] rounded-2xl border border-[#d9c7b4] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#6d1a22] text-[#fcf7ee] font-semibold">
              <tr>
                <th className="py-3 px-4">তারিখ ও সময় (Date & Time)</th>
                <th className="py-3 px-4">শিক্ষক (Faculty Member)</th>
                <th className="py-3 px-4">বিষয় ও অধ্যায় (Topic & Subject)</th>
                <th className="py-3 px-4">ব্যাচ ও শাখা (Batch / Campus)</th>
                <th className="py-3 px-4 text-center">সময়কাল (Duration)</th>
                <th className="py-3 px-4 text-center">উপস্থিতি (Students)</th>
                <th className="py-3 px-4 text-right">ক্লাস সম্মানী (Class Honorarium)</th>
                <th className="py-3 px-4 text-center">অবস্থা / অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee0d3] bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <CalendarCheck size={36} className="mx-auto mb-2 text-[#6d1a22]/40" />
                    <p className="text-sm font-bold text-gray-700">কোনো ক্লাসের বিবরণ পাওয়া যায়নি (No class logs found)</p>
                    <p className="text-xs text-gray-500 mt-0.5">নতুন ক্লাস যুক্ত করতে উপরের "নতুন ক্লাস এন্ট্রি" বাটনে ক্লিক করুন</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#faf4ea]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{log.date}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{log.time}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-extrabold text-[#450e13]">{log.teacherName}</div>
                      <div className="text-[11px] text-gray-500 font-medium">{log.subject}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#6d1a22]">{log.topic}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{log.batchName}</div>
                      <div className="text-[11px] text-gray-500">{log.branch}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded font-mono font-bold bg-[#faf0e1] text-[#6d1a22] border border-[#e2d0bd]">
                        {log.durationHours} ঘণ্টা ({log.durationHours}h)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-gray-700">
                      {log.studentAttendanceCount} জন
                    </td>

                    <td className="py-3 px-4 text-right font-black text-[#15803d] font-mono tabular-nums">
                      ৳{log.rateApplied.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 size={12} /> সম্পন্ন
                        </span>
                        {onDeleteClassLog && (
                          <button
                            onClick={() => handleDelete(log.id, log.topic)}
                            className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="ক্লাস লগ মুছে ফেলুন"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log New Completed Class */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-[#fdfbf7] rounded-2xl shadow-2xl border-2 border-[#6d1a22] overflow-hidden">
            <div className="bg-[#6d1a22] text-[#fcf7ee] px-5 py-3.5 flex items-center justify-between border-b border-[#521218]">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} />
                <h3 className="font-bold text-sm">নতুন সম্পন্ন ক্লাস রেজিস্টার (Record Completed Class)</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#fcf7ee] hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  অনুষদ শিক্ষক নির্বাচন (Select Faculty Teacher) *
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none font-semibold text-gray-800"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.subject} (সম্মানী: ৳{t.ratePerClass}/ক্লাস)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  পাঠদানের বিষয় ও অধ্যায় (Lecture Topic / Chapter) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তাপগতিবিদ্যা ও কার্নো ইঞ্জিন (Thermodynamics)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  ব্যাচ বা প্রোগ্রাম (Batch / Academic Programme) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: HSC Physics Morning Batch 2026"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    তারিখ (Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#450e13] mb-1">
                    সময়কাল ঘণ্টা (Duration)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="6"
                    placeholder="যেমন: 1.5"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#450e13] mb-1">
                  উপস্থিত শিক্ষার্থীর সংখ্যা (Present Students Count)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="যেমন: ৩২ জন"
                  value={studentAttendanceCount}
                  onChange={(e) => setStudentAttendanceCount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#d9c7b4] rounded-lg focus:ring-2 focus:ring-[#6d1a22] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#6d1a22] hover:bg-[#521218] text-[#fcf7ee] font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>ক্লাস নিশ্চিত করুন ও ব্যালেন্স আপডেট করুন (Confirm Class)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Class Log Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmLogToDelete}
        onClose={() => setConfirmLogToDelete(null)}
        onConfirm={() => {
          if (confirmLogToDelete && onDeleteClassLog) {
            onDeleteClassLog(confirmLogToDelete.id);
            showToast('info', 'ক্লাস লগ অপসারিত', 'ক্লাসের রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।');
          }
        }}
        title="ক্লাস লগ মুছে ফেলতে চান?"
        message={`আপনি কি নিশ্চিতভাবে এই ক্লাসের লগ (${confirmLogToDelete?.topic}) মুছে ফেলতে চান? সংশ্লিষ্ট শিক্ষকের প্রদেয় সম্মানী স্বয়ংক্রিয়ভাবে সমন্বয় করা হবে।`}
        confirmText="হ্যাঁ, মুছে ফেলুন"
      />
    </div>
  );
};
