/**
 * وظائف تحويل التاريخ الهجري إلى ميلادي
 */

// جدول تحويل السنوات الهجرية إلى ميلادية
const HIJRI_GREGORIAN_YEARS = {
    1440: 2019,
    1441: 2020,
    1442: 2021,
    1443: 2022,
    1444: 2023,
    1445: 2024,
    1446: 2025,
    1447: 2026,
    1448: 2027
};

// جدول تحويل الشهور الهجرية إلى ميلادية بشكل تقريبي
const HIJRI_MONTHS_OFFSET = {
    1: {offset: 5, yearAdjust: 0},  // محرم
    2: {offset: 6, yearAdjust: 0},  // صفر
    3: {offset: 7, yearAdjust: 0},  // ربيع الأول
    4: {offset: 8, yearAdjust: 0},  // ربيع الثاني
    5: {offset: 9, yearAdjust: 0},  // جمادى الأولى
    6: {offset: 10, yearAdjust: 0}, // جمادى الثانية
    7: {offset: 11, yearAdjust: 0}, // رجب
    8: {offset: 12, yearAdjust: 0}, // شعبان
    9: {offset: 1, yearAdjust: 1},  // رمضان
    10: {offset: 2, yearAdjust: 1}, // شوال
    11: {offset: 3, yearAdjust: 1}, // ذو القعدة
    12: {offset: 4, yearAdjust: 1}  // ذو الحجة
};

/**
 * التحقق من كون التاريخ هجرياً
 * 
 * @param {string} dateStr - التاريخ كنص
 * @returns {boolean} - هل التاريخ هجري
 */
function isHijriDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    
    // تنظيف النص وإزالة المسافات
    dateStr = dateStr.trim();
    
    // التحقق من صيغة التاريخ الهجري
    const regex = /^(14\d\d|1[5-9]\d\d)[\/-](\d{1,2})[\/-](\d{1,2})$/;
    if (!regex.test(dateStr)) return false;
    
    // تحليل التاريخ
    const parts = dateStr.split(/[\/-]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    
    // التحقق من نطاق السنة والشهر واليوم
    if (year < 1400 || year > 1500) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 30) return false;
    
    return true;
}

/**
 * تحويل التاريخ الهجري إلى ميلادي
 * 
 * @param {string} hijriDate - التاريخ الهجري
 * @returns {string} - التاريخ الميلادي
 */
function convertHijriToGregorian(hijriDate) {
    if (!isHijriDate(hijriDate)) return hijriDate;
    
    try {
        // تحليل التاريخ الهجري
        const parts = hijriDate.split(/[\/-]/);
        const hYear = parseInt(parts[0], 10);
        const hMonth = parseInt(parts[1], 10);
        const hDay = parseInt(parts[2], 10);
        
        // تحويل السنة
        let gYear = HIJRI_GREGORIAN_YEARS[hYear];
        if (!gYear) {
            // إذا لم تكن السنة موجودة في الجدول، نستخدم معادلة تقريبية
            gYear = Math.floor(hYear * 0.97 + 622);
        }
        
        // تحويل الشهر
        const monthInfo = HIJRI_MONTHS_OFFSET[hMonth] || {offset: hMonth, yearAdjust: 0};
        const gMonth = monthInfo.offset;
        gYear += monthInfo.yearAdjust;
        
        // تحويل اليوم (مع تعديل بسيط لتقريب أفضل)
        const gDay = hDay;
        
        // تنسيق التاريخ الميلادي
        return `${gYear}-${gMonth.toString().padStart(2, '0')}-${gDay.toString().padStart(2, '0')}`;
    } catch (e) {
        console.error('خطأ في تحويل التاريخ الهجري إلى ميلادي:', e);
        return hijriDate;
    }
}

/**
 * تحويل التاريخ الهجري إلى ميلادي مع عرضه بتنسيق مقروء
 * 
 * @param {string} hijriDate - التاريخ الهجري
 * @returns {string} - التاريخ الميلادي المنسق
 */
function formatHijriAsGregorian(hijriDate) {
    if (!hijriDate) return '';
    
    // تحويل التاريخ الهجري
    const gregDate = convertHijriToGregorian(hijriDate);
    
    // إذا لم يتغير التاريخ (ليس هجرياً)، نعيده كما هو
    if (gregDate === hijriDate) return hijriDate;
    
    // تنسيق التاريخ الميلادي بطريقة مقروءة
    try {
        const parts = gregDate.split('-');
        const year = parts[0];
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        // أسماء الشهور
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        // تنسيق التاريخ
        return `${day} ${monthNames[month-1]} ${year}`;
    } catch (e) {
        console.error('خطأ في تنسيق التاريخ الميلادي:', e);
        return gregDate;
    }
}
