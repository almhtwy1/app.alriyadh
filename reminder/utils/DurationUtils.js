// دوال حساب المدة المضمنة في السكريبت الرئيسي

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

// دالة تحويل الأرقام من العربية إلى الإنجليزية
function convertToEnglishNumbers(s) {
    if (!s || s === "غير متوفر") return s;
    return s.replace(/[٠-٩۰-۹]/g, m => {
        const map = {
            "٠": "0", "۰": "0", "١": "1", "۱": "1", "٢": "2", "۲": "2",
            "٣": "3", "۳": "3", "٤": "4", "۴": "4", "٥": "5", "۵": "5",
            "٦": "6", "۶": "6", "٧": "7", "۷": "7", "٨": "8", "۸": "8",
            "٩": "9", "۹": "9"
        };
        return map[m] || m;
    });
}

// دالة حساب المدة بناءً على التاريخ الهجري
function calculateDuration(hijriDateStr) {
    if (!hijriDateStr || hijriDateStr === "غير متوفر") return "غير متوفر";
    
    // تنظيف وتحويل التاريخ
    let cleanDate = convertToEnglishNumbers(hijriDateStr);
    let parts = cleanDate.split(/[\/\-]/);
    
    // التأكد من صحة التنسيق
    if (parts.length < 3) return "تنسيق خاطئ";
    
    // استخراج مكونات التاريخ الهجري
    let hYear = parseInt(parts[0], 10);
    let hMonth = parseInt(parts[1], 10);
    let hDay = parseInt(parts[2], 10);
    
    // تحويل التاريخ الهجري المستخرج إلى عدد أيام مطلق
    let referralAbs = hijriToAbsolute(hYear, hMonth, hDay);
    
    // الحصول على التاريخ الميلادي الحالي ثم تحويله إلى هجري
    let today = new Date();
    let currentHijri = gregorianToHijri(today.getFullYear(), today.getMonth(), today.getDate());
    let currentAbs = hijriToAbsolute(currentHijri.year, currentHijri.month, currentHijri.day);
    
    // حساب الفرق بالأيام
    let diff = currentAbs - referralAbs;
    
    // تنسيق النتيجة
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'أمس';
    return diff > 0 ? diff + ' يوم' : 'تاريخ مستقبلي';
}
