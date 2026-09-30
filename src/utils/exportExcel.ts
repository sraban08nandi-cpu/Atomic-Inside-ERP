import ExcelJS from 'exceljs';

export interface MasterReportData {
  institution: string;
  reportTitle: string;
  branch: string;
  monthYear: string;
  generatedAt: string;
  generatedBy: string;
  isAllTime?: boolean;

  // 1. Executive Summary KPIs & Financial Metrics
  kpis: {
    totalStudentIncome: number;
    totalTeacherPaid: number;
    totalStaffPaid: number;
    totalOverheadExpenses: number;
    totalCombinedOutflow: number;
    netCashFlow: number;
    totalRegisteredStudents: number;
    totalStudentDue: number;
    totalFacultyCount: number;
    totalClassesConducted: number;
    totalClassHours: number;
    totalHonorariumAccrued: number;
    totalFacultyDue: number;
    totalStaffCount: number;
    totalStaffPayrollBudget: number;
  };

  summaryRows: Array<{
    sl: number | string;
    metric: string;
    details: string;
    amount: string | number;
    impact: string;
    type:
      | 'neutral'
      | 'inflow'
      | 'outflow'
      | 'net'
      | 'kpi'
      | 'section_header'
      | 'subtotal_inflow'
      | 'subtotal_outflow'
      | 'final_net';
  }>;

  // 2. Master Student Directory & Dues (All Students)
  allStudents: Array<{
    sl: number;
    studentId: string;
    name: string;
    mobileNumber: string;
    programme: string;
    batchTime: string;
    branch: string;
    admissionDate: string;
    totalFee: number;
    paidAmount: number;
    dueAmount: number;
    status: string;
    installmentsCount: number;
    lastPaymentDate: string;
  }>;

  // 3. Student Collections (Receipts)
  students: Array<{
    sl: number;
    receiptNo: string;
    studentId: string;
    studentName: string;
    programme: string;
    mobileNumber: string;
    paymentDate: string;
    paymentTime: string;
    amount: number;
    method: string;
    receivedBy: string;
    note?: string;
  }>;

  // 4. Master Faculty Directory & Honorarium Ledger
  allTeachers: Array<{
    sl: number;
    name: string;
    mobileNumber: string;
    subject: string;
    ratePerClass: number;
    branch: string;
    joiningDate: string;
    totalClassesTaken: number;
    totalEarned: number;
    totalPaid: number;
    pendingPayable: number;
    status: string;
  }>;

  // 5. Class Logs
  classLogs: Array<{
    sl: number;
    date: string;
    time: string;
    teacherName: string;
    subject: string;
    batchName: string;
    topic: string;
    durationHours: number;
    studentAttendanceCount: number;
    rateApplied: number;
    status: string;
    branch: string;
  }>;

  // 6. Teacher Payouts
  teacherPayouts: Array<{
    sl: number;
    receiptNo: string;
    teacherName: string;
    subject: string;
    paymentDate: string;
    paymentTime: string;
    amount: number;
    method: string;
    disbursedBy: string;
    note?: string;
  }>;

  // 7. Master Staff Directory & Payroll
  allStaff: Array<{
    sl: number;
    staffId: string;
    name: string;
    designation: string;
    department: string;
    mobileNumber: string;
    branch: string;
    joiningDate: string;
    monthlySalary: number;
    totalPaidToDate: number;
    currentMonthStatus: string;
    status: string;
  }>;

  // 8. Staff Salary Vouchers
  staffSalaryVouchers: Array<{
    sl: number;
    voucherNo: string;
    staffId: string;
    staffName: string;
    designation: string;
    department: string;
    month: string;
    date: string;
    time: string;
    basicSalary: number;
    bonus: number;
    deduction: number;
    netAmount: number;
    method: string;
    transactionId?: string;
    disbursedBy: string;
    note?: string;
  }>;

  // 9. Institutional Overhead Expenses
  expenses: Array<{
    sl: number;
    voucherNo: string;
    category: string;
    title: string;
    date: string;
    amount: number;
    paymentMethod: string;
    recordedBy: string;
    branch: string;
    notes?: string;
  }>;

  // 10. Central Master Receipts & Vouchers Ledger
  centralReceipts: Array<{
    sl: number;
    receiptNo: string;
    type: string;
    typeLabel: string;
    date: string;
    time: string;
    targetName: string;
    targetId: string;
    contactNumber: string;
    particulars: string;
    inflowAmount: number;
    outflowAmount: number;
    paymentMethod: string;
    receiverName: string;
    branch: string;
  }>;

  // 11. Category-wise Expense Analysis
  expenseCategories: Array<{
    sl: number;
    category: string;
    categoryName: string;
    vouchersCount: number;
    totalAmount: number;
    percentage: number;
  }>;
}

export async function generateMasterExcelWorkbook(
  filename: string,
  data: MasterReportData
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Atomic Inside ERP';
  workbook.lastModifiedBy = data.generatedBy;
  workbook.created = new Date();
  workbook.modified = new Date();

  // Signature Institutional Theme Colors
  const MAROON_HEADER_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6D1A22' },
  };

  const GOLD_ACCENT_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFEF3C7' },
  };

  const ZEBRA_ROW_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFDFBF7' },
  };

  const WHITE_ROW_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' },
  };

  const LIGHT_GREEN_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0FDF4' },
  };

  const LIGHT_ROSE_FILL: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF1F2' },
  };

  const HEADER_FONT: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 10.5,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const CELL_BORDER: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE5D8C8' } },
    bottom: { style: 'thin', color: { argb: 'FFE5D8C8' } },
    left: { style: 'thin', color: { argb: 'FFE5D8C8' } },
    right: { style: 'thin', color: { argb: 'FFE5D8C8' } },
  };

  const TOTAL_BORDER: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF6D1A22' } },
    bottom: { style: 'double', color: { argb: 'FF6D1A22' } },
    left: { style: 'thin', color: { argb: 'FFE5D8C8' } },
    right: { style: 'thin', color: { argb: 'FFE5D8C8' } },
  };

  // Helper to format table headers
  function formatHeader(row: ExcelJS.Row) {
    row.height = 28;
    row.eachCell((cell) => {
      cell.fill = MAROON_HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF521218' } },
        bottom: { style: 'medium', color: { argb: 'FF521218' } },
        left: { style: 'thin', color: { argb: 'FF88242D' } },
        right: { style: 'thin', color: { argb: 'FF88242D' } },
      };
    });
  }

  // Helper to add institutional title header block
  function addTitleHeader(sheet: ExcelJS.Worksheet, sheetTitle: string, lastColLetter: string = 'K') {
    sheet.mergeCells(`A1:${lastColLetter}1`);
    const titleCell = sheet.getCell('A1');
    titleCell.value = `${data.institution} — ${sheetTitle}`;
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF6D1A22' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.getRow(1).height = 30;

    sheet.mergeCells(`A2:${lastColLetter}2`);
    const subCell = sheet.getCell('A2');
    const periodLabel = data.isAllTime ? 'All-Time Historical Master' : data.monthYear;
    subCell.value = `Campus: ${data.branch}  |  Board: 1. Founder- Anirban Ghosh • 2. ICT Head- Srabon Nondi • 3. Manager- Ankon Saha  |  Period: ${periodLabel}  |  Generated by: ${data.generatedBy} (${data.generatedAt})`;
    subCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF555555' } };
    subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.getRow(2).height = 22;

    sheet.addRow([]); // Blank row at line 3
    sheet.getRow(3).height = 10;
  }

  // Helper to draw merged KPI Dashboard Metric Cards in Excel
  function drawKpiCard(
    sheet: ExcelJS.Worksheet,
    startColLetter: string,
    endColLetter: string,
    startCol: number,
    endCol: number,
    startRow: number,
    title: string,
    amountStr: string,
    subtitle: string,
    tag: string,
    accentColor: string,
    bgLight: string,
    bgHeader: string,
    textColor: string
  ) {
    sheet.mergeCells(`${startColLetter}${startRow}:${endColLetter}${startRow}`);
    const titleCell = sheet.getCell(`${startColLetter}${startRow}`);
    titleCell.value = title;
    titleCell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: textColor } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(startRow).height = 22;

    sheet.mergeCells(`${startColLetter}${startRow + 1}:${endColLetter}${startRow + 2}`);
    const valCell = sheet.getCell(`${startColLetter}${startRow + 1}`);
    valCell.value = amountStr;
    valCell.font = { name: 'Segoe UI', size: 17, bold: true, color: { argb: textColor } };
    valCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(startRow + 1).height = 20;
    sheet.getRow(startRow + 2).height = 20;

    sheet.mergeCells(`${startColLetter}${startRow + 3}:${endColLetter}${startRow + 3}`);
    const tagCell = sheet.getCell(`${startColLetter}${startRow + 3}`);
    tagCell.value = `${subtitle} • ${tag}`;
    tagCell.font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: textColor } };
    tagCell.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(startRow + 3).height = 19;

    for (let r = startRow; r <= startRow + 3; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = sheet.getCell(r, c);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: r === startRow ? bgHeader : bgLight },
        };
        cell.border = {
          top: { style: r === startRow ? 'medium' : 'thin', color: { argb: accentColor } },
          bottom: { style: r === startRow + 3 ? 'medium' : 'thin', color: { argb: accentColor } },
          left: { style: c === startCol ? 'medium' : 'thin', color: { argb: accentColor } },
          right: { style: c === endCol ? 'medium' : 'thin', color: { argb: accentColor } },
        };
      }
    }
  }

  // Auto-fit column widths with safety padding so text is never truncated
  function autoFitColumns(sheet: ExcelJS.Worksheet, minWidth = 14, maxWidth = 45) {
    if (!sheet.columns) return;
    sheet.columns.forEach((column) => {
      if (!column || typeof column.eachCell !== 'function') return;
      let maxLen = 0;
      column.eachCell({ includeEmpty: false }, (cell, rowNum) => {
        if (rowNum <= 3) return; // skip header banner
        const val = cell.value;
        if (val !== null && val !== undefined) {
          const str = typeof val === 'object' && val && 'result' in val ? String((val as any).result) : String(val);
          if (str.length > maxLen) {
            maxLen = str.length;
          }
        }
      });
      column.width = Math.min(Math.max(maxLen + 4, minWidth), maxWidth);
    });
  }

  // Apply row height & zebra striping
  function formatDataRow(row: ExcelJS.Row, index: number) {
    row.height = 22;
    const fill = index % 2 === 0 ? WHITE_ROW_FILL : ZEBRA_ROW_FILL;
    row.eachCell((cell) => {
      const currentFill = cell.fill as any;
      if (!currentFill || currentFill.fgColor?.argb === 'FFFFFFFF') {
        cell.fill = fill;
      }
      cell.border = CELL_BORDER;
      if (!cell.alignment) {
        cell.alignment = { vertical: 'middle', wrapText: true };
      } else {
        cell.alignment = { ...cell.alignment, vertical: 'middle', wrapText: true };
      }
    });
  }

  // =========================================================================
  // 1. EXECUTIVE SUMMARY SHEET
  // =========================================================================
  const summarySheet = workbook.addWorksheet('Executive Summary');
  summarySheet.properties.tabColor = { argb: 'FF6D1A22' };
  addTitleHeader(summarySheet, 'Executive Financial Summary & P&L Statement', 'E');

  const isNetPositive = data.kpis.netCashFlow >= 0;

  // Primary Dashboard Row: 3 High-Impact KPI Cards (Rows 4 to 7)
  // Card 1: NET EARNINGS (Cols A-B)
  drawKpiCard(
    summarySheet,
    'A',
    'B',
    1,
    2,
    4,
    '💰 NET EARNINGS (সর্বমোট নেট আয়)',
    `৳ ${data.kpis.totalStudentIncome.toLocaleString()}`,
    'কোর্স ও ভর্তি ফি আদায়',
    '✅ VERIFIED CASH INFLOW (+)',
    'FF10B981',
    'FFECFDF5',
    'FFD1FAE5',
    'FF065F46'
  );

  // Card 2: NET EXPENSES (Col C)
  drawKpiCard(
    summarySheet,
    'C',
    'C',
    3,
    3,
    4,
    '💸 NET EXPENSES (সর্বমোট নেট ব্যয়)',
    `৳ ${data.kpis.totalCombinedOutflow.toLocaleString()}`,
    'সম্মানী + বেতন + অফিস ব্যয়',
    '🔻 CASH OUTFLOW (-)',
    'FFF43F5E',
    'FFFFF1F2',
    'FFFFE4E6',
    'FF881337'
  );

  // Card 3: NET PROFIT / SURPLUS (Cols D-E)
  drawKpiCard(
    summarySheet,
    'D',
    'E',
    4,
    5,
    4,
    '⚖️ NET PROFIT / SURPLUS (নিট ক্যাশ উদ্বৃত্ত)',
    `৳ ${data.kpis.netCashFlow.toLocaleString()}`,
    '(নেট আয় - নেট খরচ)',
    isNetPositive ? '📈 POSITIVE SURPLUS CASH' : '⚠️ NET CASH DEFICIT (ঘাটতি)',
    isNetPositive ? 'FF059669' : 'FFDC2626',
    isNetPositive ? 'FFF0FDF4' : 'FFFEF2F2',
    isNetPositive ? 'FFDCFCE7' : 'FFFECACA',
    isNetPositive ? 'FF047857' : 'FF991B1B'
  );

  // Secondary Dashboard Row: 3 Operational Overview Cards (Rows 8 to 11)
  drawKpiCard(
    summarySheet,
    'A',
    'B',
    1,
    2,
    8,
    '🎓 নিবন্ধিত শিক্ষার্থী ও বকেয়া ফি',
    `${data.kpis.totalRegisteredStudents} জন নিবন্ধিত শিক্ষার্থী`,
    `বকেয়া ফি: ৳ ${data.kpis.totalStudentDue.toLocaleString()}`,
    'ভবিষ্যৎ আদায়যোগ্য প্রাতিষ্ঠানিক পাওনা',
    'FF3B82F6',
    'FFEFF6FF',
    'FFDBEAFE',
    'FF1E40AF'
  );

  drawKpiCard(
    summarySheet,
    'C',
    'C',
    3,
    3,
    8,
    '👨‍🏫 শিক্ষক ও পাঠদান ক্লাস খতিয়ান',
    `${data.kpis.totalFacultyCount} জন শিক্ষক • ${data.kpis.totalClassesConducted} টি ক্লাস`,
    `বকেয়া সম্মানী: ৳ ${data.kpis.totalFacultyDue.toLocaleString()}`,
    `${data.kpis.totalClassHours.toFixed(1)} মোট পাঠদান ঘণ্টা সম্পন্ন`,
    'FFF59E0B',
    'FFFFFBEB',
    'FFFEF3C7',
    'FF92400E'
  );

  drawKpiCard(
    summarySheet,
    'D',
    'E',
    4,
    5,
    8,
    '👔 কর্মকর্তা/স্টাফ ও পে-রোল বাজেট',
    `${data.kpis.totalStaffCount} জন কর্মকর্তা/স্টাফ`,
    `মাসিক বাজেট: ৳ ${data.kpis.totalStaffPayrollBudget.toLocaleString()}`,
    'ক্যাম্পাস ও প্রশাসনিক পরিচালনা পরিষদ',
    'FF8B5CF6',
    'FFFAF5FF',
    'FFF3E8FF',
    'FF581C87'
  );

  // Row 12: Blank separator
  summarySheet.addRow([]);
  summarySheet.getRow(12).height = 10;

  // Row 13: Section Banner
  summarySheet.mergeCells('A13:E13');
  const sectionBannerCell = summarySheet.getCell('A13');
  sectionBannerCell.value = 'DETAILED FINANCIAL AUDIT STATEMENT & P&L LEDGER (বিস্তারিত আয়-ব্যয় খতিয়ান ও নিরীক্ষা বিবরণী)';
  sectionBannerCell.font = { name: 'Segoe UI', size: 11.5, bold: true, color: { argb: 'FFFFFFFF' } };
  sectionBannerCell.fill = MAROON_HEADER_FILL;
  sectionBannerCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(13).height = 28;

  // Row 14: Table Headers
  const summaryHeader = summarySheet.addRow([
    'SL',
    'Financial Metric / Head (হিসাব খাত)',
    'Description & Audit Details (বিবরণ ও খতিয়ান)',
    'Amount / Value (পরিমাণ ৳)',
    'Financial Impact & Cash Flow (আর্থিক স্থিতি)',
  ]);
  formatHeader(summaryHeader);

  summarySheet.columns = [
    { key: 'sl', width: 12 },
    { key: 'metric', width: 44 },
    { key: 'details', width: 50 },
    { key: 'amount', width: 28 },
    { key: 'impact', width: 32 },
  ];

  data.summaryRows.forEach((row) => {
    const isNum = typeof row.amount === 'number';
    const r = summarySheet.addRow([
      row.sl,
      row.metric,
      row.details,
      row.amount,
      row.impact,
    ]);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    r.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    r.getCell(4).alignment = { horizontal: isNum ? 'right' : 'center', vertical: 'middle' };
    r.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

    if (isNum) {
      r.getCell(4).numFmt = '"৳"#,##0;[Red]-"৳"#,##0;"৳"0';
    }

    if (row.type === 'section_header') {
      r.height = 26;
      r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5EDE2' } };
      r.getCell(2).font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF6D1A22' } };
      r.getCell(4).font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FF6D1A22' } };
      r.getCell(5).font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: 'FF6D1A22' } };
    } else if (row.type === 'subtotal_inflow') {
      r.height = 28;
      r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
      r.getCell(2).font = { name: 'Segoe UI', bold: true, size: 11.5, color: { argb: 'FF065F46' } };
      r.getCell(4).font = { name: 'Segoe UI', bold: true, size: 13, color: { argb: 'FF047857' } };
      r.getCell(5).font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF047857' } };
      r.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF10B981' } },
          bottom: { style: 'double', color: { argb: 'FF10B981' } },
          left: { style: 'thin', color: { argb: 'FFE5D8C8' } },
          right: { style: 'thin', color: { argb: 'FFE5D8C8' } },
        };
      });
    } else if (row.type === 'subtotal_outflow') {
      r.height = 28;
      r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
      r.getCell(2).font = { name: 'Segoe UI', bold: true, size: 11.5, color: { argb: 'FF881337' } };
      r.getCell(4).font = { name: 'Segoe UI', bold: true, size: 13, color: { argb: 'FFBE123C' } };
      r.getCell(5).font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFBE123C' } };
      r.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFF43F5E' } },
          bottom: { style: 'double', color: { argb: 'FFF43F5E' } },
          left: { style: 'thin', color: { argb: 'FFE5D8C8' } },
          right: { style: 'thin', color: { argb: 'FFE5D8C8' } },
        };
      });
    } else if (row.type === 'final_net' || row.type === 'net') {
      r.height = 30;
      r.fill = GOLD_ACCENT_FILL;
      r.getCell(2).font = { name: 'Segoe UI', bold: true, size: 12, color: { argb: 'FF521218' } };
      r.getCell(4).font = {
        name: 'Segoe UI',
        bold: true,
        size: 14,
        color: typeof row.amount === 'number' && row.amount >= 0 ? { argb: 'FF047857' } : { argb: 'FFBE123C' },
      };
      r.getCell(5).font = { name: 'Segoe UI', bold: true, size: 11.5, color: { argb: 'FF521218' } };
      r.eachCell((cell) => {
        cell.border = TOTAL_BORDER;
      });
    } else if (row.type === 'inflow') {
      r.height = 24;
      r.getCell(4).font = { name: 'Segoe UI', bold: true, color: { argb: 'FF15803D' } };
      r.getCell(5).font = { name: 'Segoe UI', bold: true, color: { argb: 'FF15803D' } };
      r.fill = LIGHT_GREEN_FILL;
      r.eachCell((cell) => {
        cell.border = CELL_BORDER;
      });
    } else if (row.type === 'outflow') {
      r.height = 24;
      r.getCell(4).font = { name: 'Segoe UI', bold: true, color: { argb: 'FFBE123C' } };
      r.getCell(5).font = { name: 'Segoe UI', bold: true, color: { argb: 'FFBE123C' } };
      r.fill = LIGHT_ROSE_FILL;
      r.eachCell((cell) => {
        cell.border = CELL_BORDER;
      });
    } else if (row.type === 'kpi') {
      r.height = 24;
      r.getCell(4).font = { name: 'Segoe UI', bold: true, color: { argb: 'FF501117' } };
      r.fill = ZEBRA_ROW_FILL;
      r.eachCell((cell) => {
        cell.border = CELL_BORDER;
      });
    } else {
      r.height = 24;
      r.eachCell((cell) => {
        cell.border = CELL_BORDER;
      });
    }
  });

  summarySheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 14, showGridLines: true }];

  // =========================================================================
  // 2. MASTER STUDENT DIRECTORY & DUES SHEET (A-Z Roster)
  // =========================================================================
  const studentDirSheet = workbook.addWorksheet('Student Directory & Dues');
  studentDirSheet.properties.tabColor = { argb: 'FF1E40AF' };
  addTitleHeader(studentDirSheet, 'Master Student Directory & Outstanding Dues Ledger', 'M');

  const studentDirHeader = studentDirSheet.addRow([
    'SL',
    'Student ID',
    'Student Full Name (শিক্ষার্থীর নাম)',
    'Mobile Contact',
    'Course / Programme',
    'Batch Schedule',
    'Campus',
    'Admission Date',
    'Total Course Fee (৳)',
    'Total Paid (৳)',
    'Outstanding Due (৳)',
    'Fee Status',
    'Last Payment Date',
  ]);
  formatHeader(studentDirHeader);

  data.allStudents.forEach((s, idx) => {
    const r = studentDirSheet.addRow([
      s.sl,
      s.studentId,
      s.name,
      s.mobileNumber,
      s.programme,
      s.batchTime || 'Regular',
      s.branch,
      s.admissionDate,
      s.totalFee,
      s.paidAmount,
      s.dueAmount,
      s.status,
      s.lastPaymentDate || 'N/A',
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(12).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(13).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(9).numFmt = '"৳"#,##0';
    r.getCell(10).numFmt = '"৳"#,##0';
    r.getCell(11).numFmt = '"৳"#,##0';

    if (s.dueAmount > 0) {
      r.getCell(11).font = { bold: true, color: { argb: 'FFBE123C' } };
      r.getCell(12).font = { bold: true, color: { argb: 'FFB45309' } };
    } else {
      r.getCell(11).font = { color: { argb: 'FF15803D' } };
      r.getCell(12).font = { bold: true, color: { argb: 'FF15803D' } };
    }
  });

  // Student Directory Totals
  const totalStudentsFee = data.allStudents.reduce((acc, s) => acc + s.totalFee, 0);
  const totalStudentsPaid = data.allStudents.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalStudentsDue = data.allStudents.reduce((acc, s) => acc + s.dueAmount, 0);

  const studentDirLastRow = data.allStudents.length + 4;
  const studentDirTotalRow = studentDirSheet.addRow([
    'TOTAL',
    `${data.allStudents.length} Students`,
    '',
    '',
    '',
    '',
    '',
    '',
    data.allStudents.length > 0 ? { formula: `SUM(I5:I${studentDirLastRow})`, result: totalStudentsFee } : totalStudentsFee,
    data.allStudents.length > 0 ? { formula: `SUM(J5:J${studentDirLastRow})`, result: totalStudentsPaid } : totalStudentsPaid,
    data.allStudents.length > 0 ? { formula: `SUM(K5:K${studentDirLastRow})`, result: totalStudentsDue } : totalStudentsDue,
    totalStudentsDue > 0 ? 'বকেয়া রয়েছে' : 'পরিশোধিত',
    '',
  ]);
  studentDirTotalRow.height = 26;
  studentDirTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF501117' } };
  studentDirTotalRow.fill = GOLD_ACCENT_FILL;
  studentDirTotalRow.getCell(9).numFmt = '"৳"#,##0';
  studentDirTotalRow.getCell(10).numFmt = '"৳"#,##0';
  studentDirTotalRow.getCell(11).numFmt = '"৳"#,##0';
  studentDirTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(studentDirSheet, 12, 40);
  studentDirSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.allStudents.length > 0) {
    studentDirSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: studentDirLastRow, column: 13 } };
  }

  // =========================================================================
  // 3. STUDENT COLLECTIONS SHEET (Money Receipts Ledger)
  // =========================================================================
  const studentSheet = workbook.addWorksheet('Student Collections');
  studentSheet.properties.tabColor = { argb: 'FF15803D' };
  addTitleHeader(studentSheet, 'Student Fee Collections & Money Receipts Ledger', 'L');

  const studentHeader = studentSheet.addRow([
    'SL',
    'Receipt No (রসিদ নং)',
    'Student ID',
    'Student Full Name (নাম)',
    'Programme / Course (কোর্স)',
    'Contact Number (মোবাইল)',
    'Date (তারিখ)',
    'Time (সময়)',
    'Payment Method',
    'Amount Collected (আদায় ৳)',
    'Received By (আদায়কারী)',
    'Remarks / Notes',
  ]);
  formatHeader(studentHeader);

  data.students.forEach((s, idx) => {
    const r = studentSheet.addRow([
      s.sl,
      s.receiptNo,
      s.studentId,
      s.studentName,
      s.programme,
      s.mobileNumber,
      s.paymentDate,
      s.paymentTime,
      s.method,
      s.amount,
      s.receivedBy,
      s.note || '',
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(10).numFmt = '"৳"#,##0';
    r.getCell(10).font = { bold: true, color: { argb: 'FF15803D' } };
  });

  const totalStudentAmount = data.students.reduce((acc, s) => acc + s.amount, 0);
  const studentLastRow = data.students.length + 4;
  const studentTotalRow = studentSheet.addRow([
    'TOTAL',
    `${data.students.length} Receipts`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    data.students.length > 0 ? { formula: `SUM(J5:J${studentLastRow})`, result: totalStudentAmount } : totalStudentAmount,
    '',
    'মোট সংগৃহীত শিক্ষার্থী ফি',
  ]);
  studentTotalRow.height = 26;
  studentTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF15803D' } };
  studentTotalRow.fill = GOLD_ACCENT_FILL;
  studentTotalRow.getCell(10).numFmt = '"৳"#,##0';
  studentTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(studentSheet, 12, 42);
  studentSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.students.length > 0) {
    studentSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: studentLastRow, column: 12 } };
  }

  // =========================================================================
  // 4. MASTER FACULTY DIRECTORY & HONORARIUM LEDGER (Teachers)
  // =========================================================================
  const teacherDirSheet = workbook.addWorksheet('Faculty Directory & Dues');
  teacherDirSheet.properties.tabColor = { argb: 'FFB45309' };
  addTitleHeader(teacherDirSheet, 'Master Faculty Directory & Honorarium Balance Ledger', 'K');

  const teacherDirHeader = teacherDirSheet.addRow([
    'SL',
    'Faculty / Teacher Name (শিক্ষকের নাম)',
    'Contact Number (মোবাইল)',
    'Department / Subject (বিষয়)',
    'Honorarium Rate / Class (৳)',
    'Campus',
    'Joining Date',
    'Classes Taken (ক্লাস)',
    'Total Remuneration (মোট অর্জিত ৳)',
    'Total Paid (পরিশোধিত ৳)',
    'Current Outstanding Due (বকেয়া ৳)',
  ]);
  formatHeader(teacherDirHeader);

  data.allTeachers.forEach((t, idx) => {
    const r = teacherDirSheet.addRow([
      t.sl,
      t.name,
      t.mobileNumber,
      t.subject,
      t.ratePerClass,
      t.branch,
      t.joiningDate,
      t.totalClassesTaken,
      t.totalEarned,
      t.totalPaid,
      t.pendingPayable,
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(11).alignment = { horizontal: 'right', vertical: 'middle' };

    r.getCell(5).numFmt = '"৳"#,##0';
    r.getCell(9).numFmt = '"৳"#,##0';
    r.getCell(10).numFmt = '"৳"#,##0';
    r.getCell(11).numFmt = '"৳"#,##0';

    if (t.pendingPayable > 0) {
      r.getCell(11).font = { bold: true, color: { argb: 'FFBE123C' } };
    }
  });

  const totalClassesCount = data.allTeachers.reduce((acc, t) => acc + t.totalClassesTaken, 0);
  const totalFacultyEarned = data.allTeachers.reduce((acc, t) => acc + t.totalEarned, 0);
  const totalFacultyPaid = data.allTeachers.reduce((acc, t) => acc + t.totalPaid, 0);
  const totalFacultyDue = data.allTeachers.reduce((acc, t) => acc + t.pendingPayable, 0);

  const teacherLastRow = data.allTeachers.length + 4;
  const teacherDirTotalRow = teacherDirSheet.addRow([
    'TOTAL',
    `${data.allTeachers.length} Faculty Members`,
    '',
    '',
    '',
    '',
    '',
    data.allTeachers.length > 0 ? { formula: `SUM(H5:H${teacherLastRow})`, result: totalClassesCount } : totalClassesCount,
    data.allTeachers.length > 0 ? { formula: `SUM(I5:I${teacherLastRow})`, result: totalFacultyEarned } : totalFacultyEarned,
    data.allTeachers.length > 0 ? { formula: `SUM(J5:J${teacherLastRow})`, result: totalFacultyPaid } : totalFacultyPaid,
    data.allTeachers.length > 0 ? { formula: `SUM(K5:K${teacherLastRow})`, result: totalFacultyDue } : totalFacultyDue,
  ]);
  teacherDirTotalRow.height = 26;
  teacherDirTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF501117' } };
  teacherDirTotalRow.fill = GOLD_ACCENT_FILL;
  teacherDirTotalRow.getCell(9).numFmt = '"৳"#,##0';
  teacherDirTotalRow.getCell(10).numFmt = '"৳"#,##0';
  teacherDirTotalRow.getCell(11).numFmt = '"৳"#,##0';
  teacherDirTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(teacherDirSheet, 12, 38);
  teacherDirSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.allTeachers.length > 0) {
    teacherDirSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: teacherLastRow, column: 11 } };
  }

  // =========================================================================
  // 5. CLASS COUNTING LOGS SHEET
  // =========================================================================
  const classSheet = workbook.addWorksheet('Class Counting Logs');
  classSheet.properties.tabColor = { argb: 'FF0E7490' };
  addTitleHeader(classSheet, 'Academic Faculty Class Counting & Audit Ledger', 'K');

  const classHeader = classSheet.addRow([
    'SL',
    'Date (তারিখ)',
    'Time (সময়)',
    'Teacher Full Name (শিক্ষক)',
    'Subject (বিষয়)',
    'Batch / Group (ব্যাচ)',
    'Topic Covered (অধ্যায় / টপিক)',
    'Duration (Hours)',
    'Attendance (উপস্থিতি)',
    'Honorarium Rate Applied (৳)',
    'Status (অবস্থা)',
  ]);
  formatHeader(classHeader);

  data.classLogs.forEach((c, idx) => {
    const r = classSheet.addRow([
      c.sl,
      c.date,
      c.time,
      c.teacherName,
      c.subject,
      c.batchName,
      c.topic,
      c.durationHours,
      c.studentAttendanceCount,
      c.rateApplied,
      c.status,
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(11).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(8).numFmt = '#,##0.0';
    r.getCell(10).numFmt = '"৳"#,##0';
  });

  const totalClassValue = data.classLogs.reduce((acc, c) => acc + c.rateApplied, 0);
  const totalHours = data.classLogs.reduce((acc, c) => acc + c.durationHours, 0);
  const totalAttendance = data.classLogs.reduce((acc, c) => acc + c.studentAttendanceCount, 0);
  const classLastRow = data.classLogs.length + 4;

  const classTotalRow = classSheet.addRow([
    'TOTAL',
    '',
    '',
    `${data.classLogs.length} Classes`,
    '',
    '',
    '',
    data.classLogs.length > 0 ? { formula: `SUM(H5:H${classLastRow})`, result: totalHours } : totalHours,
    data.classLogs.length > 0 ? { formula: `SUM(I5:I${classLastRow})`, result: totalAttendance } : totalAttendance,
    data.classLogs.length > 0 ? { formula: `SUM(J5:J${classLastRow})`, result: totalClassValue } : totalClassValue,
    'সম্পন্ন ক্লাস',
  ]);
  classTotalRow.height = 26;
  classTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF501117' } };
  classTotalRow.fill = GOLD_ACCENT_FILL;
  classTotalRow.getCell(8).numFmt = '#,##0.0';
  classTotalRow.getCell(10).numFmt = '"৳"#,##0';
  classTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(classSheet, 12, 42);
  classSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.classLogs.length > 0) {
    classSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: classLastRow, column: 11 } };
  }

  // =========================================================================
  // 6. TEACHER PAYOUTS SHEET (Disbursement Vouchers)
  // =========================================================================
  const payoutSheet = workbook.addWorksheet('Teacher Payouts');
  payoutSheet.properties.tabColor = { argb: 'FFBE123C' };
  addTitleHeader(payoutSheet, 'Teacher Honorarium Remuneration Disbursements', 'J');

  const payoutHeader = payoutSheet.addRow([
    'SL',
    'Voucher No (ভাউচার নং)',
    'Teacher Name (শিক্ষকের নাম)',
    'Subject (বিষয়)',
    'Disbursement Date (তারিখ)',
    'Time (সময়)',
    'Payment Method (পদ্ধতি)',
    'Amount Paid (প্রদত্ত সম্মানী ৳)',
    'Disbursed By (অনুমোদনকারী)',
    'Remarks / Particulars',
  ]);
  formatHeader(payoutHeader);

  data.teacherPayouts.forEach((p, idx) => {
    const r = payoutSheet.addRow([
      p.sl,
      p.receiptNo,
      p.teacherName,
      p.subject,
      p.paymentDate,
      p.paymentTime,
      p.method,
      p.amount,
      p.disbursedBy,
      p.note || '',
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(8).numFmt = '"৳"#,##0';
    r.getCell(8).font = { bold: true, color: { argb: 'FFBE123C' } };
  });

  const totalPayout = data.teacherPayouts.reduce((acc, p) => acc + p.amount, 0);
  const payoutLastRow = data.teacherPayouts.length + 4;
  const payoutTotalRow = payoutSheet.addRow([
    'TOTAL',
    `${data.teacherPayouts.length} Disbursements`,
    '',
    '',
    '',
    '',
    '',
    data.teacherPayouts.length > 0 ? { formula: `SUM(H5:H${payoutLastRow})`, result: totalPayout } : totalPayout,
    '',
    'মোট শিক্ষক সম্মানী ব্যয়',
  ]);
  payoutTotalRow.height = 26;
  payoutTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFBE123C' } };
  payoutTotalRow.fill = GOLD_ACCENT_FILL;
  payoutTotalRow.getCell(8).numFmt = '"৳"#,##0';
  payoutTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(payoutSheet, 12, 40);
  payoutSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.teacherPayouts.length > 0) {
    payoutSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: payoutLastRow, column: 10 } };
  }

  // =========================================================================
  // 7. STAFF MEMBERS & PAYROLL REGISTER SHEET
  // =========================================================================
  const staffDirSheet = workbook.addWorksheet('Staff Directory & Payroll');
  staffDirSheet.properties.tabColor = { argb: 'FF6B21A8' };
  addTitleHeader(staffDirSheet, 'Staff Members Master Directory & Monthly Payroll Register', 'K');

  const staffDirHeader = staffDirSheet.addRow([
    'SL',
    'Staff ID (আইডি)',
    'Staff Full Name (কর্মকর্তা/কর্মচারী)',
    'Designation (পদবী)',
    'Department (বিভাগ)',
    'Mobile Contact',
    'Campus',
    'Joining Date',
    'Monthly Basic Salary (মূল বেতন ৳)',
    'Total Salary Paid to Date (৳)',
    'Current Month Status',
  ]);
  formatHeader(staffDirHeader);

  data.allStaff.forEach((st, idx) => {
    const r = staffDirSheet.addRow([
      st.sl,
      st.staffId,
      st.name,
      st.designation,
      st.department,
      st.mobileNumber,
      st.branch,
      st.joiningDate,
      st.monthlySalary,
      st.totalPaidToDate,
      st.currentMonthStatus,
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(11).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(9).numFmt = '"৳"#,##0';
    r.getCell(10).numFmt = '"৳"#,##0';

    if (st.currentMonthStatus === 'Paid / পরিশোধিত') {
      r.getCell(11).font = { bold: true, color: { argb: 'FF15803D' } };
    } else {
      r.getCell(11).font = { bold: true, color: { argb: 'FFB45309' } };
    }
  });

  const totalStaffPayroll = data.allStaff.reduce((acc, st) => acc + st.monthlySalary, 0);
  const totalStaffHistoricalPaid = data.allStaff.reduce((acc, st) => acc + st.totalPaidToDate, 0);
  const staffLastRow = data.allStaff.length + 4;

  const staffDirTotalRow = staffDirSheet.addRow([
    'TOTAL',
    `${data.allStaff.length} Staff Members`,
    '',
    '',
    '',
    '',
    '',
    '',
    data.allStaff.length > 0 ? { formula: `SUM(I5:I${staffLastRow})`, result: totalStaffPayroll } : totalStaffPayroll,
    data.allStaff.length > 0 ? { formula: `SUM(J5:J${staffLastRow})`, result: totalStaffHistoricalPaid } : totalStaffHistoricalPaid,
    'মাসিক পে-রোল বাজেট',
  ]);
  staffDirTotalRow.height = 26;
  staffDirTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF501117' } };
  staffDirTotalRow.fill = GOLD_ACCENT_FILL;
  staffDirTotalRow.getCell(9).numFmt = '"৳"#,##0';
  staffDirTotalRow.getCell(10).numFmt = '"৳"#,##0';
  staffDirTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(staffDirSheet, 12, 38);
  staffDirSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.allStaff.length > 0) {
    staffDirSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: staffLastRow, column: 11 } };
  }

  // =========================================================================
  // 8. STAFF SALARY VOUCHERS SHEET
  // =========================================================================
  const salaryVoucherSheet = workbook.addWorksheet('Staff Salary Vouchers');
  salaryVoucherSheet.properties.tabColor = { argb: 'FF7C3AED' };
  addTitleHeader(salaryVoucherSheet, 'Staff Monthly Salary Disbursement Vouchers Ledger', 'N');

  const salaryVoucherHeader = salaryVoucherSheet.addRow([
    'SL',
    'Voucher No (ভাউচার নং)',
    'Staff ID',
    'Staff Name (কর্মকর্তা)',
    'Designation (পদবী)',
    'Salary Month (মাস)',
    'Disbursement Date (তারিখ)',
    'Basic Salary (মূল বেতন ৳)',
    'Bonus / Allowance (বোনাস ৳)',
    'Deductions (কর্তন ৳)',
    'Net Amount Paid (নিট প্রদেয় ৳)',
    'Payment Method',
    'Transaction ID',
    'Disbursed By (অনুমোদনকারী)',
  ]);
  formatHeader(salaryVoucherHeader);

  data.staffSalaryVouchers.forEach((sv, idx) => {
    const r = salaryVoucherSheet.addRow([
      sv.sl,
      sv.voucherNo,
      sv.staffId,
      sv.staffName,
      sv.designation,
      sv.month,
      sv.date,
      sv.basicSalary,
      sv.bonus,
      sv.deduction,
      sv.netAmount,
      sv.method,
      sv.transactionId || 'N/A',
      sv.disbursedBy,
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(11).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(12).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(13).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(8).numFmt = '"৳"#,##0';
    r.getCell(9).numFmt = '"৳"#,##0';
    r.getCell(10).numFmt = '"৳"#,##0';
    r.getCell(11).numFmt = '"৳"#,##0';
    r.getCell(11).font = { bold: true, color: { argb: 'FFBE123C' } };
  });

  const totalBasicSal = data.staffSalaryVouchers.reduce((acc, sv) => acc + sv.basicSalary, 0);
  const totalBonusSal = data.staffSalaryVouchers.reduce((acc, sv) => acc + sv.bonus, 0);
  const totalDeductSal = data.staffSalaryVouchers.reduce((acc, sv) => acc + sv.deduction, 0);
  const totalNetSal = data.staffSalaryVouchers.reduce((acc, sv) => acc + sv.netAmount, 0);
  const salaryLastRow = data.staffSalaryVouchers.length + 4;

  const salaryTotalRow = salaryVoucherSheet.addRow([
    'TOTAL',
    `${data.staffSalaryVouchers.length} Vouchers`,
    '',
    '',
    '',
    '',
    '',
    data.staffSalaryVouchers.length > 0 ? { formula: `SUM(H5:H${salaryLastRow})`, result: totalBasicSal } : totalBasicSal,
    data.staffSalaryVouchers.length > 0 ? { formula: `SUM(I5:I${salaryLastRow})`, result: totalBonusSal } : totalBonusSal,
    data.staffSalaryVouchers.length > 0 ? { formula: `SUM(J5:J${salaryLastRow})`, result: totalDeductSal } : totalDeductSal,
    data.staffSalaryVouchers.length > 0 ? { formula: `SUM(K5:K${salaryLastRow})`, result: totalNetSal } : totalNetSal,
    '',
    '',
    'মোট স্টাফ বেতন ব্যয়',
  ]);
  salaryTotalRow.height = 26;
  salaryTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFBE123C' } };
  salaryTotalRow.fill = GOLD_ACCENT_FILL;
  salaryTotalRow.getCell(8).numFmt = '"৳"#,##0';
  salaryTotalRow.getCell(9).numFmt = '"৳"#,##0';
  salaryTotalRow.getCell(10).numFmt = '"৳"#,##0';
  salaryTotalRow.getCell(11).numFmt = '"৳"#,##0';
  salaryTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(salaryVoucherSheet, 12, 40);
  salaryVoucherSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.staffSalaryVouchers.length > 0) {
    salaryVoucherSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: salaryLastRow, column: 14 } };
  }

  // =========================================================================
  // 9. INSTITUTIONAL EXPENSES SHEET
  // =========================================================================
  const expenseSheet = workbook.addWorksheet('Institutional Expenses');
  expenseSheet.properties.tabColor = { argb: 'FF991B1B' };
  addTitleHeader(expenseSheet, 'Institutional Overhead & Operational Expenses Ledger', 'I');

  const expenseHeader = expenseSheet.addRow([
    'SL',
    'Voucher No (ভাউচার নং)',
    'Expense Category (ব্যয়ের খাত)',
    'Expense Description / Title (বিবরণ)',
    'Date (তারিখ)',
    'Payment Method (পদ্ধতি)',
    'Amount (খরচ ৳)',
    'Spent / Approved By (অনুমোদনকারী)',
    'Notes / Remarks',
  ]);
  formatHeader(expenseHeader);

  data.expenses.forEach((e, idx) => {
    const r = expenseSheet.addRow([
      e.sl,
      e.voucherNo,
      e.category,
      e.title,
      e.date,
      e.paymentMethod,
      e.amount,
      e.recordedBy,
      e.notes || '',
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(7).numFmt = '"৳"#,##0';
    r.getCell(7).font = { bold: true, color: { argb: 'FFBE123C' } };
  });

  const totalExpense = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  const expenseLastRow = data.expenses.length + 4;
  const expenseTotalRow = expenseSheet.addRow([
    'TOTAL',
    `${data.expenses.length} Records`,
    '',
    '',
    '',
    '',
    data.expenses.length > 0 ? { formula: `SUM(G5:G${expenseLastRow})`, result: totalExpense } : totalExpense,
    '',
    'মোট প্রাতিষ্ঠানিক অফিস ব্যয়',
  ]);
  expenseTotalRow.height = 26;
  expenseTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFBE123C' } };
  expenseTotalRow.fill = GOLD_ACCENT_FILL;
  expenseTotalRow.getCell(7).numFmt = '"৳"#,##0';
  expenseTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(expenseSheet, 12, 42);
  expenseSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.expenses.length > 0) {
    expenseSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: expenseLastRow, column: 9 } };
  }

  // =========================================================================
  // 10. CENTRAL MASTER RECEIPTS & VOUCHERS LEDGER
  // =========================================================================
  const centralSheet = workbook.addWorksheet('Central Receipts Ledger');
  centralSheet.properties.tabColor = { argb: 'FF1D4ED8' };
  addTitleHeader(centralSheet, 'Central Master Receipts & Vouchers Unified Audit Ledger', 'M');

  const centralHeader = centralSheet.addRow([
    'SL',
    'Receipt / Voucher #',
    'Transaction Type (ধরণ)',
    'Date (তারিখ)',
    'Time (সময়)',
    'Target / Payee Name (নাম)',
    'ID (Student / Staff)',
    'Contact Number (মোবাইল)',
    'Course / Purpose / Particulars',
    'Cash Inflow (+) (জমা ৳)',
    'Cash Outflow (-) (ব্যয় ৳)',
    'Payment Method',
    'Authorized By / Receiver',
  ]);
  formatHeader(centralHeader);

  data.centralReceipts.forEach((cr, idx) => {
    const r = centralSheet.addRow([
      cr.sl,
      cr.receiptNo,
      cr.typeLabel,
      cr.date,
      cr.time,
      cr.targetName,
      cr.targetId,
      cr.contactNumber,
      cr.particulars,
      cr.inflowAmount,
      cr.outflowAmount,
      cr.paymentMethod,
      cr.receiverName,
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(11).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(12).alignment = { horizontal: 'center', vertical: 'middle' };

    r.getCell(10).numFmt = '"৳"#,##0;[Red]-"৳"#,##0;"-"';
    r.getCell(11).numFmt = '"৳"#,##0;[Red]-"৳"#,##0;"-"';

    if (cr.inflowAmount > 0) {
      r.getCell(10).font = { bold: true, color: { argb: 'FF15803D' } };
    }
    if (cr.outflowAmount > 0) {
      r.getCell(11).font = { bold: true, color: { argb: 'FFBE123C' } };
    }
  });

  const totalCentralIn = data.centralReceipts.reduce((acc, cr) => acc + cr.inflowAmount, 0);
  const totalCentralOut = data.centralReceipts.reduce((acc, cr) => acc + cr.outflowAmount, 0);
  const centralLastRow = data.centralReceipts.length + 4;

  const centralTotalRow = centralSheet.addRow([
    'TOTAL',
    `${data.centralReceipts.length} Documents`,
    '',
    '',
    '',
    '',
    '',
    '',
    'সর্বমোট ক্যাশ প্রবাহ',
    data.centralReceipts.length > 0 ? { formula: `SUM(J5:J${centralLastRow})`, result: totalCentralIn } : totalCentralIn,
    data.centralReceipts.length > 0 ? { formula: `SUM(K5:K${centralLastRow})`, result: totalCentralOut } : totalCentralOut,
    `Net: ৳ ${(totalCentralIn - totalCentralOut).toLocaleString()}`,
    'কেন্দ্রীয় রসিদ ভল্ট',
  ]);
  centralTotalRow.height = 26;
  centralTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FF501117' } };
  centralTotalRow.fill = GOLD_ACCENT_FILL;
  centralTotalRow.getCell(10).numFmt = '"৳"#,##0';
  centralTotalRow.getCell(11).numFmt = '"৳"#,##0';
  centralTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(centralSheet, 12, 42);
  centralSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];
  if (data.centralReceipts.length > 0) {
    centralSheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: centralLastRow, column: 13 } };
  }

  // =========================================================================
  // 11. EXPENSE CATEGORY ANALYSIS & P&L BREAKDOWN
  // =========================================================================
  const analysisSheet = workbook.addWorksheet('Expense Analysis');
  analysisSheet.properties.tabColor = { argb: 'FFC2410C' };
  addTitleHeader(analysisSheet, 'Categorized Expense Analysis & Allocation Breakdown', 'F');

  const analysisHeader = analysisSheet.addRow([
    'SL',
    'Expense Head / Category (ব্যয়ের খাত)',
    'Official Description',
    'Vouchers Count (ভাউচার)',
    'Total Amount Spent (মোট ব্যয় ৳)',
    'Share of Total Expenses (%)',
  ]);
  formatHeader(analysisHeader);

  data.expenseCategories.forEach((cat, idx) => {
    const r = analysisSheet.addRow([
      cat.sl,
      cat.categoryName,
      cat.category,
      cat.vouchersCount,
      cat.totalAmount,
      cat.percentage / 100, // as decimal for Excel percent formatting
    ]);
    formatDataRow(r, idx);

    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
    r.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };

    r.getCell(5).numFmt = '"৳"#,##0';
    r.getCell(6).numFmt = '0.0%';
    r.getCell(5).font = { bold: true, color: { argb: 'FFBE123C' } };
  });

  const totalCatExpenses = data.expenseCategories.reduce((acc, c) => acc + c.totalAmount, 0);
  const totalCatVouchers = data.expenseCategories.reduce((acc, c) => acc + c.vouchersCount, 0);
  const analysisLastRow = data.expenseCategories.length + 4;

  const analysisTotalRow = analysisSheet.addRow([
    'TOTAL',
    'সর্বমোট সমন্বিত ব্যয় খাতসমূহ',
    '',
    data.expenseCategories.length > 0 ? { formula: `SUM(D5:D${analysisLastRow})`, result: totalCatVouchers } : totalCatVouchers,
    data.expenseCategories.length > 0 ? { formula: `SUM(E5:E${analysisLastRow})`, result: totalCatExpenses } : totalCatExpenses,
    1,
  ]);
  analysisTotalRow.height = 26;
  analysisTotalRow.font = { name: 'Segoe UI', bold: true, size: 11, color: { argb: 'FFBE123C' } };
  analysisTotalRow.fill = GOLD_ACCENT_FILL;
  analysisTotalRow.getCell(5).numFmt = '"৳"#,##0';
  analysisTotalRow.getCell(6).numFmt = '0.0%';
  analysisTotalRow.eachCell((cell) => {
    cell.border = TOTAL_BORDER;
  });

  autoFitColumns(analysisSheet, 14, 45);
  analysisSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4, showGridLines: true }];

  // =========================================================================
  // Generate binary buffer and trigger browser download
  // =========================================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
