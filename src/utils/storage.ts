import { Student, Teacher, Expense, TeacherClassLog, ReceiptData, User, StaffMember } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'atomic_erp_students_v1',
  TEACHERS: 'atomic_erp_teachers_v1',
  STAFF: 'atomic_erp_staff_v1',
  EXPENSES: 'atomic_erp_expenses_v1',
  CLASS_LOGS: 'atomic_erp_class_logs_v1',
  RECEIPTS: 'atomic_erp_receipts_v1',
  CURRENT_USER: 'atomic_erp_current_user_v1',
};

// Initial Seed Data for immediate testing & realistic operations
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_101',
    studentId: 'AI-ST-8821',
    name: 'ফারহান আহমেদ (Farhan Ahmed)',
    mobileNumber: '01712-345678',
    programme: 'HSC Medical & Dental Physics+Chem',
    batchTime: 'রবি-মঙ্গল-বৃহস্পতি (সকাল ৯:০০)',
    totalFee: 12000,
    paidAmount: 8000,
    dueAmount: 4000,
    branch: 'Narayanganj',
    admissionDate: '2026-09-01',
    lastPaymentDate: '2026-09-15',
    paymentHistory: [
      {
        id: 'pay_101_1',
        date: '2026-09-01',
        time: '10:30 AM',
        amount: 5000,
        method: 'cash',
        receivedBy: 'Anirban Ghosh (Founder)',
        receiptNo: 'RCP-882101',
        note: 'ভর্তি ও প্রথম কিস্তি',
      },
      {
        id: 'pay_101_2',
        date: '2026-09-15',
        time: '11:15 AM',
        amount: 3000,
        method: 'bkash',
        transactionId: 'TRX9A8B7C',
        receivedBy: 'Ankon Saha (Manager)',
        receiptNo: 'RCP-882102',
        note: 'দ্বিতীয় কিস্তি',
      },
    ],
  },
  {
    id: 'std_102',
    studentId: 'AI-ST-8822',
    name: 'নুসরাত জাহান (Nusrat Jahan)',
    mobileNumber: '01911-987654',
    programme: 'Engineering BUET Advance Mathematics',
    batchTime: 'শনি-সোম-বুধ (বিকাল ৩:০০)',
    totalFee: 15000,
    paidAmount: 15000,
    dueAmount: 0,
    branch: 'Narayanganj',
    admissionDate: '2026-09-05',
    lastPaymentDate: '2026-09-20',
    paymentHistory: [
      {
        id: 'pay_102_1',
        date: '2026-09-05',
        time: '03:45 PM',
        amount: 15000,
        method: 'cash',
        receivedBy: 'Srabon Nondi (ICT Head)',
        receiptNo: 'RCP-882201',
        note: 'এককালীন পূর্ণ পরিশোধ',
      },
    ],
  },
  {
    id: 'std_103',
    studentId: 'AI-ST-8823',
    name: 'সাকিব আল হাসান (Sakib Al Hasan)',
    mobileNumber: '01823-456789',
    programme: 'Physics Special Mechanics & Optics',
    batchTime: 'রবি-মঙ্গল-বৃহস্পতি (বিকাল ৪:৩০)',
    totalFee: 10000,
    paidAmount: 5000,
    dueAmount: 5000,
    branch: 'Narayanganj',
    admissionDate: '2026-09-10',
    lastPaymentDate: '2026-09-10',
    paymentHistory: [
      {
        id: 'pay_103_1',
        date: '2026-09-10',
        time: '04:15 PM',
        amount: 5000,
        method: 'nagad',
        transactionId: 'NGD4F5G6',
        receivedBy: 'Ankon Saha (Manager)',
        receiptNo: 'RCP-882301',
        note: 'ভর্তি ফি ও অগ্রিম',
      },
    ],
  },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch_201',
    name: 'ড. কাজী শফিকুল ইসলাম (Dr. Kazi Shafiq)',
    mobileNumber: '01819-876543',
    subject: 'পদার্থবিজ্ঞান (Physics Mechanics & Quantum)',
    ratePerClass: 1500,
    totalClassesTaken: 8,
    totalEarned: 12000,
    totalPaid: 9000,
    pendingPayable: 3000,
    branch: 'Narayanganj',
    joiningDate: '2026-08-01',
    paymentHistory: [
      {
        id: 'tch_pay_201_1',
        date: '2026-09-10',
        time: '06:00 PM',
        amount: 9000,
        method: 'bank',
        transactionId: 'DBBL99218',
        disbursedBy: 'Anirban Ghosh (Founder)',
        receiptNo: 'VCH-TCH-00201',
        note: 'আগস্ট ও সেপ্টেম্বর ক্লাস সম্মানী',
      },
    ],
  },
  {
    id: 'tch_202',
    name: 'প্রকৌশলী মাহমুদুল হাসান (Engr. Mahmud)',
    mobileNumber: '01733-112233',
    subject: 'উচ্চতর গণিত (Higher Mathematics Calculus)',
    ratePerClass: 1200,
    totalClassesTaken: 6,
    totalEarned: 7200,
    totalPaid: 7200,
    pendingPayable: 0,
    branch: 'Narayanganj',
    joiningDate: '2026-08-15',
    paymentHistory: [
      {
        id: 'tch_pay_202_1',
        date: '2026-09-18',
        time: '05:30 PM',
        amount: 7200,
        method: 'bkash',
        transactionId: 'BK991203',
        disbursedBy: 'Ankon Saha (Manager)',
        receiptNo: 'VCH-TCH-00202',
        note: 'ক্যালকুলাস স্পেশাল ব্যাচ সম্মানী',
      },
    ],
  },
  {
    id: 'tch_203',
    name: 'তানজিলা রহমান (Tanzila Rahman)',
    mobileNumber: '01677-445566',
    subject: 'রসায়ন (Chemistry Organic & Periodic)',
    ratePerClass: 1200,
    totalClassesTaken: 5,
    totalEarned: 6000,
    totalPaid: 3600,
    pendingPayable: 2400,
    branch: 'Narayanganj',
    joiningDate: '2026-08-20',
    paymentHistory: [
      {
        id: 'tch_pay_203_1',
        date: '2026-09-12',
        time: '04:00 PM',
        amount: 3600,
        method: 'cash',
        disbursedBy: 'Anirban Ghosh (Founder)',
        receiptNo: 'VCH-TCH-00203',
        note: 'পার্ট পেমেন্ট সম্মানী',
      },
    ],
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_301',
    voucherNo: 'VCH-30101',
    title: 'নারায়ণগঞ্জ ক্যাম্পাস রুম ভাড়া (September Rent)',
    category: 'rent',
    amount: 18000,
    date: '2026-09-02',
    branch: 'Narayanganj',
    recordedBy: 'Anirban Ghosh (Founder)',
    paymentMethod: 'bank',
    notes: 'আমলাপাড়া ক্যাম্পাস ভবন ভাড়া',
  },
  {
    id: 'exp_302',
    voucherNo: 'VCH-30102',
    title: 'ফিজিক্স ও কেমিস্ট্রি লেকচার শিট প্রিন্ট ও বাইন্ডিং',
    category: 'printing',
    amount: 3500,
    date: '2026-09-08',
    branch: 'Narayanganj',
    recordedBy: 'Srabon Nondi (ICT Head)',
    paymentMethod: 'cash',
    notes: '২০০ সেট স্পেশাল নোটস',
  },
  {
    id: 'exp_303',
    voucherNo: 'VCH-30103',
    title: 'চলতি মাসের বিদ্যুৎ বিল (DESCO / DPDC)',
    category: 'utilities',
    amount: 4200,
    date: '2026-09-14',
    branch: 'Narayanganj',
    recordedBy: 'Ankon Saha (Manager)',
    paymentMethod: 'bkash',
    notes: 'এসি ও লাইটিং বিল',
  },
  {
    id: 'exp_304',
    voucherNo: 'VCH-30104',
    title: 'শিক্ষক ও অভিভাবক আপ্যায়ন (Tea & Refreshment)',
    category: 'refreshment',
    amount: 1400,
    date: '2026-09-22',
    branch: 'Narayanganj',
    recordedBy: 'Ankon Saha (Manager)',
    paymentMethod: 'cash',
    notes: 'অভিভাবক মিটিং নাশতা',
  },
];

export const INITIAL_CLASS_LOGS: TeacherClassLog[] = [
  {
    id: 'cls_401',
    teacherId: 'tch_201',
    teacherName: 'ড. কাজী শফিকুল ইসলাম (Dr. Kazi Shafiq)',
    subject: 'পদার্থবিজ্ঞান (Physics)',
    batchName: 'HSC Medical & Dental Physics',
    date: '2026-09-21',
    time: '09:30 AM',
    durationHours: 1.5,
    studentAttendanceCount: 28,
    topic: 'নিউটনিয়ান বলবিদ্যা ও ভরবেগের নিত্যতা সূত্র',
    branch: 'Narayanganj',
    status: 'conducted',
    rateApplied: 1500,
  },
  {
    id: 'cls_402',
    teacherId: 'tch_202',
    teacherName: 'প্রকৌশলী মাহমুদুল হাসান (Engr. Mahmud)',
    subject: 'উচ্চতর গণিত (Higher Mathematics)',
    batchName: 'Engineering BUET Advance Mathematics',
    date: '2026-09-22',
    time: '03:15 PM',
    durationHours: 2.0,
    studentAttendanceCount: 24,
    topic: 'অন্তরীকরণ ও গুরুমান-লঘুমান ক্যালকুলাস',
    branch: 'Narayanganj',
    status: 'conducted',
    rateApplied: 1200,
  },
  {
    id: 'cls_403',
    teacherId: 'tch_203',
    teacherName: 'তানজিলা রহমান (Tanzila Rahman)',
    subject: 'রসায়ন (Chemistry)',
    batchName: 'HSC Medical & Dental Chemistry',
    date: '2026-09-23',
    time: '11:00 AM',
    durationHours: 1.5,
    studentAttendanceCount: 26,
    topic: 'জৈব রসায়ন—অ্যালকাইন ও অ্যারোমেটিক হাইড্রোকার্বন',
    branch: 'Narayanganj',
    status: 'conducted',
    rateApplied: 1200,
  },
];

export const INITIAL_RECEIPTS: ReceiptData[] = [
  {
    id: 'rcp_init_1',
    receiptNo: 'RCP-882101',
    type: 'student',
    targetId: 'std_101',
    targetName: 'ফারহান আহমেদ (Farhan Ahmed)',
    studentId: 'AI-ST-8821',
    contactNumber: '01712-345678',
    programme: 'HSC Medical & Dental Physics+Chem',
    branch: 'Narayanganj',
    amountPaid: 5000,
    totalFee: 12000,
    dueAmount: 7000,
    date: '2026-09-01',
    time: '10:30 AM',
    receiverName: 'Anirban Ghosh (Founder)',
    paymentMethod: 'cash',
    batchTime: 'রবি-মঙ্গল-বৃহস্পতি (সকাল ৯:০০)',
  },
  {
    id: 'rcp_init_2',
    receiptNo: 'RCP-882201',
    type: 'student',
    targetId: 'std_102',
    targetName: 'নুসরাত জাহান (Nusrat Jahan)',
    studentId: 'AI-ST-8822',
    contactNumber: '01911-987654',
    programme: 'Engineering BUET Advance Mathematics',
    branch: 'Narayanganj',
    amountPaid: 15000,
    totalFee: 15000,
    dueAmount: 0,
    date: '2026-09-05',
    time: '03:45 PM',
    receiverName: 'Srabon Nondi (ICT Head)',
    paymentMethod: 'cash',
    batchTime: 'শনি-সোম-বুধ (বিকাল ৩:০০)',
  },
  {
    id: 'rcp_init_3',
    receiptNo: 'VCH-TCH-00201',
    type: 'teacher',
    targetId: 'tch_201',
    targetName: 'ড. কাজী শফিকুল ইসলাম (Dr. Kazi Shafiq)',
    contactNumber: '01819-876543',
    programme: 'পদার্থবিজ্ঞান (Physics)',
    branch: 'Narayanganj',
    amountPaid: 9000,
    totalFee: 12000,
    dueAmount: 3000,
    date: '2026-09-10',
    time: '06:00 PM',
    receiverName: 'Anirban Ghosh (Founder)',
    paymentMethod: 'bank',
  },
  {
    id: 'rcp_init_4',
    receiptNo: 'VCH-SAL-260901',
    type: 'staff',
    targetId: 'stf_01',
    targetName: 'অনির্বাণ ঘোষ (Anirban Ghosh)',
    contactNumber: '01834-899620',
    programme: 'Founder & Academic Director',
    branch: 'Narayanganj',
    amountPaid: 50000,
    totalFee: 50000,
    dueAmount: 0,
    date: '2026-09-05',
    time: '11:00 AM',
    receiverName: 'Anirban Ghosh (Founder)',
    paymentMethod: 'bank',
    transactionId: 'SAL-DBBL-991',
    salaryMonth: 'September 2026',
    salaryDetails: {
      basicSalary: 45000,
      bonus: 5000,
      deduction: 0,
    },
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf_01',
    staffId: 'AI-STF-01',
    name: 'অনির্বাণ ঘোষ (Anirban Ghosh)',
    mobileNumber: '01834-899620',
    designation: 'Founder & Academic Director',
    department: 'Executive Administration',
    monthlySalary: 45000,
    branch: 'Narayanganj',
    joiningDate: '2018-01-01',
    status: 'active',
    paymentHistory: [
      {
        id: 'stf_pay_01_1',
        voucherNo: 'VCH-SAL-260901',
        date: '2026-09-05',
        time: '11:00 AM',
        month: 'September 2026',
        basicSalary: 45000,
        bonus: 5000,
        deduction: 0,
        netAmount: 50000,
        method: 'bank',
        transactionId: 'SAL-DBBL-991',
        disbursedBy: 'Anirban Ghosh (Founder)',
        note: 'সেপ্টেম্বর ২০২৬ মাসিক নির্বাহী সম্মানী ও উৎসব বোনাস',
      },
    ],
  },
  {
    id: 'stf_02',
    staffId: 'AI-STF-02',
    name: 'শ্রাবণ নন্দী (Srabon Nondi)',
    mobileNumber: '01711-223344',
    designation: 'ICT Head & Systems Lead',
    department: 'IT & Software Operations',
    monthlySalary: 35000,
    branch: 'Narayanganj',
    joiningDate: '2019-03-01',
    status: 'active',
    paymentHistory: [
      {
        id: 'stf_pay_02_1',
        voucherNo: 'VCH-SAL-260902',
        date: '2026-09-05',
        time: '11:30 AM',
        month: 'September 2026',
        basicSalary: 35000,
        bonus: 0,
        deduction: 0,
        netAmount: 35000,
        method: 'bank',
        transactionId: 'SAL-EBL-8812',
        disbursedBy: 'Anirban Ghosh (Founder)',
        note: 'সেপ্টেম্বর ২০২৬ মাসিক বেতন',
      },
    ],
  },
  {
    id: 'stf_03',
    staffId: 'AI-STF-03',
    name: 'অঙ্কন সাহা (Ankon Saha)',
    mobileNumber: '01912-334455',
    designation: 'Campus Manager & Admin In-Charge',
    department: 'Campus Administration',
    monthlySalary: 30000,
    branch: 'Narayanganj',
    joiningDate: '2020-07-15',
    status: 'active',
    paymentHistory: [
      {
        id: 'stf_pay_03_1',
        voucherNo: 'VCH-SAL-260903',
        date: '2026-09-06',
        time: '12:00 PM',
        month: 'September 2026',
        basicSalary: 30000,
        bonus: 2000,
        deduction: 0,
        netAmount: 32000,
        method: 'bkash',
        transactionId: 'BK-SAL-7712',
        disbursedBy: 'Anirban Ghosh (Founder)',
        note: 'সেপ্টেম্বর ২০২৬ মাসিক বেতন ও ক্যাম্পাস ওভারটাইম ভাতা',
      },
    ],
  },
  {
    id: 'stf_04',
    staffId: 'AI-STF-04',
    name: 'আফরোজা আক্তার (Afroza Akter)',
    mobileNumber: '01622-445566',
    designation: 'Senior Front Desk & Accounts Executive',
    department: 'Accounts & Student Care',
    monthlySalary: 18000,
    branch: 'Narayanganj',
    joiningDate: '2022-02-01',
    status: 'active',
    paymentHistory: [],
  },
  {
    id: 'stf_05',
    staffId: 'AI-STF-05',
    name: 'মোঃ রফিকুল ইসলাম (Md. Rafiqul Islam)',
    mobileNumber: '01815-667788',
    designation: 'Lab Assistant & IT Caretaker',
    department: 'Science & Computer Lab',
    monthlySalary: 15000,
    branch: 'Narayanganj',
    joiningDate: '2023-01-10',
    status: 'active',
    paymentHistory: [],
  },
  {
    id: 'stf_06',
    staffId: 'AI-STF-06',
    name: 'কামাল হোসেন (Kamal Hossain)',
    mobileNumber: '01799-887766',
    designation: 'Support Staff & Security Lead',
    department: 'Facility & Maintenance',
    monthlySalary: 12000,
    branch: 'Narayanganj',
    joiningDate: '2021-06-01',
    status: 'active',
    paymentHistory: [],
  },
];

export function loadStudents(): Student[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving students:', err);
  }
}

export function loadTeachers(): Teacher[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return data ? JSON.parse(data) : INITIAL_TEACHERS;
  } catch {
    return INITIAL_TEACHERS;
  }
}

export function saveTeachers(teachers: Teacher[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  } catch (err) {
    console.error('Error saving teachers:', err);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : INITIAL_EXPENSES;
  } catch {
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('Error saving expenses:', err);
  }
}

export function loadClassLogs(): TeacherClassLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLASS_LOGS);
    return data ? JSON.parse(data) : INITIAL_CLASS_LOGS;
  } catch {
    return INITIAL_CLASS_LOGS;
  }
}

export function saveClassLogs(logs: TeacherClassLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASS_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Error saving class logs:', err);
  }
}

export function loadReceipts(): ReceiptData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    return data ? JSON.parse(data) : INITIAL_RECEIPTS;
  } catch {
    return INITIAL_RECEIPTS;
  }
}

export function saveReceipts(receipts: ReceiptData[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  } catch (err) {
    console.error('Error saving receipts:', err);
  }
}

export function loadStaffMembers(): StaffMember[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    return data ? JSON.parse(data) : INITIAL_STAFF;
  } catch {
    return INITIAL_STAFF;
  }
}

export function saveStaffMembers(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  } catch (err) {
    console.error('Error saving staff members:', err);
  }
}

export function loadCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (data) {
      return JSON.parse(data);
    }
    // Default logged in user: Anirban Ghosh (Founder)
    const defaultUser: User = {
      id: 'usr_founder_default',
      name: 'Anirban Ghosh',
      email: 'founder@atomicinside.edu.bd',
      role: 'founder',
      branch: 'Narayanganj',
    };
    return defaultUser;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (err) {
    console.error('Error saving current user:', err);
  }
}

export function clearAllDataToZero(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CLASS_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
  } catch (err) {
    console.error('Error resetting data:', err);
  }
}
