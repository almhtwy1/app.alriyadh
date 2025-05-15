/**
 * وحدة المساعدات - تحتوي على دوال مساعدة لمعالجة البيانات
 */
const Helpers = (() => {
    'use strict';
    
    /**
     * حساب متوسط الوقت وتحويله إلى تنسيق ساعة:دقيقة
     * @param {number[]} timesInMinutes - مصفوفة تحتوي على أوقات بالدقائق
     * @returns {string} متوسط الوقت بتنسيق ساعة:دقيقة
     */
    function calculateAverageTime(timesInMinutes) {
        if (timesInMinutes.length === 0) return "لا توجد بيانات";

        const sum = timesInMinutes.reduce((total, time) => total + time, 0);
        const average = sum / timesInMinutes.length;

        const hours = Math.floor(average / 60);
        const minutes = Math.floor(average % 60);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * حساب متوسط ساعات العمل
     * @param {number[]} arrivalTimes - مصفوفة تحتوي على أوقات الحضور بالدقائق
     * @param {number[]} departureTimes - مصفوفة تحتوي على أوقات الانصراف بالدقائق
     * @returns {string} متوسط ساعات العمل بتنسيق ساعة:دقيقة
     */
    function calculateAverageWorkHours(arrivalTimes, departureTimes) {
        if (arrivalTimes.length === 0 || departureTimes.length === 0 || arrivalTimes.length !== departureTimes.length) {
            return "لا توجد بيانات كافية";
        }

        let totalWorkMinutes = 0;
        const validPairs = Math.min(arrivalTimes.length, departureTimes.length);

        for (let i = 0; i < validPairs; i++) {
            const workMinutes = departureTimes[i] - arrivalTimes[i];
            if (workMinutes > 0) {
                totalWorkMinutes += workMinutes;
            }
        }

        const averageMinutes = totalWorkMinutes / validPairs;
        const hours = Math.floor(averageMinutes / 60);
        const minutes = Math.floor(averageMinutes % 60);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // كشف الواجهات العامة
    return {
        calculateAverageTime,
        calculateAverageWorkHours
    };
})();
