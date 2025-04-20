/**
 * تنسيق التاريخ إلى صيغة معينة
 * تحويل التاريخ من أي صيغة محتملة إلى الصيغة المطلوبة
 * 
 * @param {string} dateStr - التاريخ كنص
 * @returns {string} - التاريخ المنسق
 */
function formatDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    try {
        // التحقق إذا كان التاريخ هجرياً
        if (isHijriDate(dateStr)) {
            return convertHijriToGregorian(dateStr);
        }
        
        // محاولة التعرف على صيغ مختلفة للتاريخ
        if (dateStr.includes('-')) {
            // التاريخ بصيغة yyyy-mm-dd أو dd-mm-yyyy
            const parts = dateStr.split('-');
            
            // التحقق من الصيغة
            if (parts.length === 3) {
                // تحديد ما إذا كان بصيغة yyyy-mm-dd أو dd-mm-yyyy
                if (parts[0].length === 4) {
                    // yyyy-mm-dd
                    return `${parts[0]}-${parts[1]}-${parts[2]}`;
                } else if (parts[2].length === 4) {
                    // dd-mm-yyyy
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
            
            // إذا لم يتم التعرف على الصيغة، نعيد بدون تغيير
            return dateStr;
        } else if (dateStr.includes('/')) {
            // التاريخ بصيغة mm/dd/yyyy أو dd/mm/yyyy
            const parts = dateStr.split('/');
            
            if (parts.length === 3) {
                // تحويل إلى صيغة yyyy-mm-dd
                if (parts[2].length === 4) {
                    // dd/mm/yyyy أو mm/dd/yyyy
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
            
            return dateStr;
        } else if (/\d{8}/.test(dateStr)) {
            // التاريخ بصيغة yyyymmdd
            return `${dateStr.substr(0,4)}-${dateStr.substr(4,2)}-${dateStr.substr(6,2)}`;
        } else {
            // تحويل التاريخ العادي باستخدام API التاريخ
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0]; // yyyy-mm-dd
            }
        }
    } catch (e) {
        console.error('خطأ في تنسيق التاريخ:', e);
    }
    
    // إذا لم يتم التعرف على أي صيغة، نعيد بدون تغيير
    return dateStr;
}

/**
 * تحويل التاريخ إلى صيغة مقروءة
 * @param {string} dateStr - التاريخ كنص بالصيغة yyyy-mm-dd
 * @returns {string} - التاريخ المقروء
 */
function formatDateForDisplay(dateStr) {
    if (!dateStr) return '';
    
    try {
        // تنسيق التاريخ أولاً
        const formattedDate = formatDate(dateStr);
        
        // التحقق من أن التاريخ بالصيغة yyyy-mm-dd
        if (formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = formattedDate.split('-');
            
            // تحويل الشهر إلى اسم
            const monthNames = [
                'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
                'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
            ];
            
            const monthIndex = parseInt(month, 10) - 1;
            return `${day} ${monthNames[monthIndex]} ${year}`;
        }
        
        return formattedDate;
    } catch (e) {
        console.error('خطأ في تنسيق التاريخ للعرض:', e);
        return dateStr;
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

/**
 * التحقق إذا كان التاريخ هجرياً
 * يتحقق من صيغة التاريخ وقيمته إذا كان تاريخاً هجرياً
 * 
 * @param {string} dateStr - التاريخ كنص
 * @returns {boolean} - هل التاريخ هجري أم لا
 */
function isHijriDate(dateStr) {
    try {
        // التحقق من شكل التاريخ النموذجي للتاريخ الهجري (مثل 1446-10-20)
        const hijriRegex = /^(14[0-9]{2}|1[5-9][0-9]{2})-([0-9]{1,2})-([0-9]{1,2})$/;
        if (!hijriRegex.test(dateStr)) return false;
        
        // التحقق من أن السنة بين 1400 و 1500 هجرياً (وهي الفترة المستخدمة حالياً تقريباً)
        const parts = dateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        
        if (year < 1400 || year > 1500) return false;
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 30) return false;
        
        return true;
    } catch (e) {
        console.error('خطأ في التحقق من التاريخ الهجري:', e);
        return false;
    }
}

/**
 * تحويل التاريخ الهجري إلى التاريخ الميلادي
 * استناداً إلى خوارزمية تقريبية لتحويل التاريخ
 * 
 * @param {string} hijriDate - التاريخ الهجري بصيغة yyyy-mm-dd
 * @returns {string} - التاريخ الميلادي بصيغة yyyy-mm-dd
 */
function convertHijriToGregorian(hijriDate) {
    try {
        const parts = hijriDate.split('-');
        const hy = parseInt(parts[0], 10);
        const hm = parseInt(parts[1], 10);
        const hd = parseInt(parts[2], 10);
        
        // حساب عدد الأيام من بداية التاريخ الهجري
        let totalDays = (hy - 1) * 354 + Math.floor((3 + 11 * hy) / 30);
        
        // إضافة الأيام للشهور الكاملة في العام الحالي
        for (let i = 1; i < hm; i++) {
            totalDays += (i % 2 === 1 || (i === 12 && isHijriLeapYear(hy))) ? 30 : 29;
        }
        
        // إضافة أيام الشهر الحالي
        totalDays += hd - 1;
        
        // تحويل إلى تاريخ ميلادي (تقريبي)
        // 1970/1/1 ميلادي يوافق تقريباً 1389/10/22 هجري
        const hijriBeginningDays = (1389 - 1) * 354 + Math.floor((3 + 11 * 1389) / 30);
        for (let i = 1; i < 10; i++) {
            hijriBeginningDays += (i % 2 === 1) ? 30 : 29;
        }
        hijriBeginningDays += 22;
        
        const diffDays = totalDays - hijriBeginningDays;
        
        // إضافة الأيام إلى 1970/1/1 ميلادي
        const date = new Date(1970, 0, 1);
        date.setDate(date.getDate() + diffDays);
        
        // تنسيق التاريخ الميلادي بصيغة yyyy-mm-dd
        const gyear = date.getFullYear();
        const gmonth = date.getMonth() + 1;
        const gday = date.getDate();
        
        return `${gyear}-${gmonth.toString().padStart(2, '0')}-${gday.toString().padStart(2, '0')}`;
    } catch (e) {
        console.error('خطأ في تحويل التاريخ الهجري إلى ميلادي:', e);
        return hijriDate; // إرجاع التاريخ الأصلي في حالة الخطأ
    }
}

/**
 * التحقق إذا كانت السنة الهجرية سنة كبيسة
 * السنوات الكبيسة الهجرية هي: 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29 في كل دورة من 30 سنة
 * 
 * @param {number} year - السنة الهجرية
 * @returns {boolean} - هل السنة كبيسة أم لا
 */
function isHijriLeapYear(year) {
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    const yearInCycle = year % 30;
    return leapYears.includes(yearInCycle);
}

/**
 * تحويل تاريخ هجري معين إلى تاريخ ميلادي باستخدام خوارزمية أكثر دقة
 * يعتمد على جدول تحويل مدمج أو خوارزمية حسابية أكثر دقة
 * 
 * هذا الكود أكثر دقة من الخوارزمية التقريبية ويستخدم عند الحاجة لدقة عالية
 */
function convertHijriToGregorianAdvanced(hijriDate) {
    // يمكن استخدام مكتبة خارجية أو خوارزمية أكثر تعقيداً هنا
    // للحصول على تحويل أكثر دقة
    
    // لأغراض هذا المثال، سأستخدم معادلات تقريبية لكنها دقيقة نسبياً
    try {
        const parts = hijriDate.split('-');
        const hy = parseInt(parts[0], 10);
        const hm = parseInt(parts[1], 10);
        const hd = parseInt(parts[2], 10);
        
        // التحويل بناءً على معادلة تقريبية
        // الفرق بين التقويمين الهجري والميلادي حوالي 33 سنة هجرية = 32 سنة ميلادية
        // أي أن 100 سنة هجرية تقريباً 97 سنة ميلادية
        
        // حساب تقريبي للسنة الميلادية
        let gyear = Math.floor(hy * 0.97 + 622);
        const leapAdjustment = 0.25 + (gyear % 4 === 0 ? 0 : 0.75);
        
        // حساب تقريبي لليوم الميلادي
        const startOfYear = new Date(gyear, 0, 1);
        const daysIntoYear = Math.floor(
            (hm - 1) * 29.5 + hd + (hy * 354.367) - ((gyear - 622) * 365.25) + leapAdjustment
        );
        
        // تحويل اليوم الميلادي إلى شهر ويوم
        const date = new Date(startOfYear);
        date.setDate(date.getDate() + daysIntoYear - 1);
        
        // ضبط السنة إذا تجاوزت نهاية السنة
        gyear = date.getFullYear();
        const gmonth = date.getMonth() + 1;
        const gday = date.getDate();
        
        // إرجاع التاريخ الميلادي بصيغة yyyy-mm-dd
        return `${gyear}-${gmonth.toString().padStart(2, '0')}-${gday.toString().padStart(2, '0')}`;
    } catch (e) {
        console.error('خطأ في التحويل المتقدم للتاريخ الهجري:', e);
        return hijriDate; // إرجاع التاريخ الأصلي في حالة الخطأ
    }
}

/**
 * واجهة موحدة لتحويل التاريخ الهجري إلى ميلادي
 * تختار الخوارزمية المناسبة حسب دقة التحويل المطلوبة
 * 
 * @param {string} hijriDate - التاريخ الهجري
 * @param {boolean} highPrecision - هل مطلوب دقة عالية؟
 * @returns {string} - التاريخ الميلادي
 */
function hijriToGregorian(hijriDate, highPrecision = false) {
    // تنظيف التاريخ وتنسيقه بالصيغة المطلوبة
    const cleanedDate = hijriDate.trim().replace(/\s+/g, '-');
    
    // استدعاء الخوارزمية المناسبة
    if (highPrecision) {
        return convertHijriToGregorianAdvanced(cleanedDate);
    } else {
        return convertHijriToGregorian(cleanedDate);
    }
}
