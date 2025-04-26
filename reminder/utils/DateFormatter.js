/**
 * تنسيق التاريخ إلى صيغة معينة
 * تحويل التاريخ من أي صيغة محتملة إلى الصيغة المطلوبة
 * 
 * @param {string} dateStr - التاريخ كنص
 * @returns {string} - التاريخ المنسق
 */
function formatDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    
    // محاولة استخراج تاريخ من النص بدون تنسيق محدد
    try {
        // محاولة التعرف على صيغ مختلفة للتاريخ واليوم والشهر والسنة
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
 * تم تعديل الدالة للتعامل مع الأيام بدلاً من الدقائق
 * @param {number} timestamp - الطابع الزمني بالمللي ثانية
 * @returns {string} - المدة المنقضية كنص
 */
function getElapsedTime(timestamp) {
    try {
        const now = Date.now();
        const diff = now - timestamp;
        
        // تحويل المدة إلى أيام
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        
        if (days === 0) {
            if (hours === 0) {
                const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
                return `منذ ${minutes} دقيقة`;
            }
            return `منذ ${hours} ساعة`;
        } else if (days < 30) {
            return `منذ ${days} يوم و ${hours} ساعة`;
        } else {
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            return `منذ ${months} شهر و ${remainingDays} يوم`;
        }
    } catch (e) {
        console.error('خطأ في حساب المدة الزمنية:', e);
        return '';
    }
}
