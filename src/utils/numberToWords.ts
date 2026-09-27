/**
 * Authentic Bengali number words 0-99 used in institutional banking and money receipts
 */
const BENGALI_NUM_WORDS: string[] = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
  'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
  'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
  'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
  'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
  'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
  'একাত্তর', 'বাহাত্তর', 'তিহাত্তর', 'চৌহাত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
  'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই',
  'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

/**
 * Converts a numeric amount into standard Bengali words (e.g. 5200 -> পাঁচ হাজার দুই শত টাকা মাত্র)
 */
export function numberToWordsBengali(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'শূন্য টাকা মাত্র';

  let num = Math.floor(Math.abs(amount));
  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = Math.floor(num / 100);
  num %= 100;

  if (crore > 0) {
    result += `${BENGALI_NUM_WORDS[crore] || crore} কোটি `;
  }
  if (lakh > 0) {
    result += `${BENGALI_NUM_WORDS[lakh] || lakh} লাখ `;
  }
  if (thousand > 0) {
    result += `${BENGALI_NUM_WORDS[thousand] || thousand} হাজার `;
  }
  if (hundred > 0) {
    result += `${BENGALI_NUM_WORDS[hundred] || hundred} শত `;
  }
  if (num > 0) {
    result += `${BENGALI_NUM_WORDS[num] || num} `;
  }

  return `${result.trim()} টাকা মাত্র`;
}

/**
 * Converts a numeric amount into English words (e.g. 5200 -> Five Thousand Two Hundred Taka Only)
 */
export function numberToWordsEnglish(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Zero Taka Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(num: number): string {
    if (num < 20) return a[num];
    const digit = num % 10;
    return `${b[Math.floor(num / 10)]}${digit ? ' ' + a[digit] : ''}`;
  }

  let n = Math.floor(Math.abs(amount));
  let str = '';

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = Math.floor(n / 100);
  n %= 100;

  if (crore > 0) str += `${inWords(crore)} Crore `;
  if (lakh > 0) str += `${inWords(lakh)} Lakh `;
  if (thousand > 0) str += `${inWords(thousand)} Thousand `;
  if (hundred > 0) str += `${a[hundred]} Hundred `;
  if (n > 0) str += `${inWords(n)} `;

  return `${str.trim()} Taka Only`;
}
