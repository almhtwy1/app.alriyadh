/**
 * جدول تقريبي للتحويل من هجري إلى ميلادي
 * لسنوات محددة مع إمكانية الإضافة
 */
const HIJRI_GREGORIAN_MAP = {
    1440: 2019,
    1441: 2020,
    1442: 2021,
    1443: 2022,
    1444: 2023,
    1445: 2024,
    1446: 2025,
    1447: 2026,
    1448: 2027,
    1449: 2028,
    1450: 2029
};

/**
 * تحويل التاريخ الهجري إلى ميلادي باستخدام طريقة مباشرة
 * 
 * @param {string} dateStr - التاريخ كنص (قد يكون هجري أو ميلادي)
 * @returns {string} - التاريخ الميلادي أو النص الأصلي إذا كان غير هجري
 */
function formatDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    // تنظيف النص من المسافات الزائدة
    dateStr = dateStr.trim();
    
    // التحقق من نمط التاريخ الهجري: YYYY-MM-DD أو YYYY/MM/DD
    const hijriRegex = /^(14\d{2}|1[5-9]\d{2})[\-\/](\d{1,2})[\-\/](\d{1,2})$/;
    const match = dateStr.match(hijriRegex);
    
    if (match) {
        // التاريخ هجري، نقوم بالتحويل
        const hijriYear = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        
        // تحويل من هجري إلى ميلادي
        try {
            // استخدام الجدول إذا كانت السنة موجودة فيه
            if (HIJRI_GREGORIAN_MAP[hijriYear]) {
                const gregorianYear = HIJRI_GREGORIAN_MAP[hijriYear];
                
                // تعديل بسيط للشهر (شهور الهجري والميلادي غير متطابقة)
                // هذا تقريب بسيط، يمكن تحسينه مستقبلاً
                let gregorianMonth = month;
                let gregorianDay = day;
                
                // تعديل الشهر واليوم بناءً على مقاربة تقريبية
                // للتحويل من هجري إلى ميلادي
                gregorianMonth = ((month + 2) % 12);
                if (gregorianMonth === 0) gregorianMonth = 12;
                
                // معالجة تغيير السنة عند انتقال الشهر
                let yearAdjustment = 0;
                if (month >= 11) yearAdjustment = 1;
                
                // تنسيق التاريخ الميلادي
                return `${gregorianYear + yearAdjustment}-${gregorianMonth.toString().padStart(2, '0')}-${gregorianDay.toString().padStart(2, '0')}`;
            } else {
                // طريقة تقريبية إذا لم تكن السنة موجودة في الجدول
                const gregorianYear = Math.floor(hijriYear * 0.97 + 622);
                return `${gregorianYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
        } catch (e) {
            console.error('خطأ في تحويل التاريخ الهجري:', e);
            return dateStr; // إرجاع التاريخ الأصلي في حالة الخطأ
        }
    }
    
    // إذا لم يكن هجرياً، نتعامل معه كتاريخ عادي
    try {
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            }
        } else if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            }
        }
    } catch (e) {
        console.error('خطأ في تنسيق التاريخ:', e);
    }
    
    // إرجاع التاريخ الأصلي إذا لم يتم التعرف عليه
    return dateStr;
}

/**
 * عرض التاريخ بصيغة مقروءة (مثل: 20 أبريل 2025)
 * 
 * @param {string} dateStr - التاريخ كنص
 * @returns {string} - التاريخ بصيغة مقروءة
 */
function formatDateForDisplay(dateStr) {
    if (!dateStr) return '';
    
    try {
        // تحويل التاريخ أولاً باستخدام formatDate
        const formattedDate = formatDate(dateStr);
        
        // محاولة فصل التاريخ إلى أجزاء
        const parts = formattedDate.split(/[\-\/]/);
        if (parts.length !== 3) return formattedDate;
        
        // تحديد ما إذا كان التاريخ بتنسيق سنة-شهر-يوم أو يوم-شهر-سنة
        let year, month, day;
        
        if (parts[0].length === 4) {
            // سنة-شهر-يوم
            year = parts[0];
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
        } else if (parts[2].length === 4) {
            // يوم-شهر-سنة
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            year = parts[2];
        } else {
            // تنسيق غير معروف
            return formattedDate;
        }
        
        // تحويل الشهر إلى اسم
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        const monthName = monthNames[month - 1] || '';
        return `${day} ${monthName} ${year}`;
    } catch (e) {
        console.error('خطأ في تنسيق التاريخ للعرض:', e);
        return dateStr;
    }
}

/**
 * تنسيق خاص للتاريخ الهجري ليظهر في واجهة المستخدم
 * يعرض التاريخ الهجري مع ما يقابله بالميلادي
 * 
 * @param {string} hijriDate - التاريخ الهجري
 * @returns {string} - التاريخ الهجري والميلادي معاً
 */
function formatHijriWithGregorian(hijriDate) {
    if (!hijriDate) return '';
    
    try {
        const gregorianDate = formatDate(hijriDate);
        // إذا كان التاريخ لم يتغير، فهو ليس هجرياً
        if (gregorianDate === hijriDate) return hijriDate;
        
        // تنسيق التاريخ الميلادي
        const formattedGregorian = formatDateForDisplay(gregorianDate);
        
        // إرجاع التاريخ الميلادي فقط
        return formattedGregorian;
        
        // أو يمكن إرجاع الهجري والميلادي معاً 
        // return `${hijriDate} (${formattedGregorian})`;
    } catch (e) {
        console.error('خطأ في تنسيق التاريخ الهجري مع الميلادي:', e);
        return hijriDate;
    }
}

/**
 * حساب المدة الزمنية المنقضية منذ تاريخ معين
 * @param {number} timestamp - الطابع الزمني بالمللي ثانية
 * @returns {string} - المدة المنقضية كنص
 */
function getElapsedTime(timestamp) {
    try {
        const now = Date.now();
        const diff = now - timestamp;
        
        // تحويل المدة إلى دقائق
        const minutes = Math.floor(diff / (60 * 1000));
        
        if (minutes < 60) {
            return `منذ ${minutes} دقيقة`;
        } else if (minutes < 24 * 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `منذ ${hours} ساعة و ${remainingMinutes} دقيقة`;
        } else {
            const days = Math.floor(minutes / (24 * 60));
            const remainingHours = Math.floor((minutes % (24 * 60)) / 60);
            return `منذ ${days} يوم و ${remainingHours} ساعة`;
        }
    } catch (e) {
        console.error('خطأ في حساب المدة الزمنية:', e);
        return '';
    }
}
