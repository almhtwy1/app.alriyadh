/**
 * وظائف تحويل التاريخ بين الميلادي والهجري
 * مهمة لحساب المدة الزمنية بين التواريخ
 */

// تحويل التاريخ الميلادي إلى هجري (معادلة تقريبية موثقة)
function gregorianToHijri(gy, gm, gd) {
  // gm هنا من 0 إلى 11 لذا نضيف 1
  let m = gm + 1;
  let a = Math.floor((14 - m) / 12);
  let y = gy + 4800 - a;
  m = m + 12 * a - 3;
  let jdn = gd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  let l = jdn - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  let month = Math.floor((24 * l) / 709);
  let day = l - Math.floor((709 * month) / 24);
  let year = 30 * n + j - 30;
  return { year, month, day };
}

// تحويل التاريخ الهجري إلى عدد أيام مطلق (كوسيلة للمقارنة)
function hijriToAbsolute(iy, im, id) {
  return id + Math.ceil(29.5 * (im - 1)) + (iy - 1) * 354 + Math.floor((3 + 11 * iy) / 30);
}

/**
 * حساب المدة بين تاريخين هجريين بشكل صحيح
 * @param {string} dateStr - التاريخ الهجري بصيغة YYYY/MM/DD
 * @returns {number|string} - المدة بالأيام
 */
function calculateHijriDuration(dateStr) {
  if (dateStr === "غير متوفر") return "غير متوفر";
  
  let parts = dateStr.split('/');
  if (parts.length >= 3) {
    let hYear = parseInt(parts[0], 10);
    let hMonth = parseInt(parts[1], 10);
    let hDay = parseInt(parts[2], 10);
    
    // الحصول على التاريخ الميلادي الحالي ثم تحويله إلى هجري
    let today = new Date();
    let currentHijri = gregorianToHijri(today.getFullYear(), today.getMonth(), today.getDate());
    
    // تحويل التاريخين إلى أرقام أيام مطلقة
    let transactionDays = hijriToAbsolute(hYear, hMonth, hDay);
    let currentDays = hijriToAbsolute(currentHijri.year, currentHijri.month, currentHijri.day);
    
    // حساب الفرق بين التاريخين
    // نستخدم الآن: التاريخ الحالي - تاريخ المعاملة
    let diff = currentDays - transactionDays;
    
    // قيمة موجبة تعني أن المعاملة أقدم من اليوم، قيمة سالبة تعني أنها في المستقبل
    // هنا نلتزم بالقواعد المطلوبة:
    // 0 = نفس اليوم (الفرق = 0)
    // 1 = مضى يوم واحد (الفرق = 1)
    // 2 = مضى يومان (الفرق = 2)
    // وهكذا...
    
    return diff >= 0 ? diff : 0; // لا نسمح بقيم سالبة (المستقبل يعتبر اليوم)
  }
  
  return "غير متوفر";
}

// تصدير الدوال للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    gregorianToHijri,
    hijriToAbsolute,
    calculateHijriDuration
  };
}
