export function formatBanglaDate(isoString: string): string {
  const date = new Date(isoString);

  // Bangla numbers mapping
  const banglaDigits: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };

  // Convert English numbers → Bangla numbers
  const toBanglaNumber = (num: number | string): string => {
    return String(num).replace(/[0-9]/g, (d) => banglaDigits[d]);
  };

  // Bangla month names
  const banglaMonths = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];

  const day = toBanglaNumber(date.getDate());
  const month = banglaMonths[date.getMonth()];
  const year = toBanglaNumber(date.getFullYear());

  // ----- 12 hour time formatting -----
  let hours = date.getHours();
  const minutes = toBanglaNumber(date.getMinutes().toString().padStart(2, "0"));

  const period = hours >= 12 ? "বিকাল" : "সকাল";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const banglaHour = toBanglaNumber(hours);

  return `${day} ${month} ${year}, ${banglaHour}:${minutes}`;
}
