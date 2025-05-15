/**
 * وحدة تحليل البيانات - مسؤولة عن معالجة وتحليل البيانات
 */
const Analyzer = (() => {
    'use strict';
    
    /**
     * استخراج النوع الرئيسي للإجازة (بدون تفاصيل الفترة)
     * @param {string} note - نص الملاحظة
     * @returns {string} النوع الرئيسي للإجازة بعد التنظيف
     */
    function extractMainLeaveType(note) {
        // إزالة التفاصيل مثل "من xx إلى xx"
        let mainType = note.replace(/\s+مـــن\s+[\d\/-]+\s+الي\s+[\d\/-]+/g, "");
        mainType = mainType.replace(/\s+من\s+[\d\/-]+\s+الى\s+[\d\/-]+/g, "");

        // إزالة الأرقام والرموز غير الضرورية
        mainType = mainType.replace(/\d+[-\/]\d+[-\/]\d+/g, "").trim();

        // تنظيف أي فراغات زائدة
        mainType = mainType.replace(/\s+/g, " ").trim();

        return mainType;
    }
    
    /**
     * دالة للعثور على فترة الإجازة
     * @param {string} note - نص الملاحظة
     * @returns {Object|null} كائن يحتوي على تاريخ البداية والنهاية أو null
     */
    function extractLeavePeriod(note) {
        // البحث عن تاريخ البداية والنهاية في النمط "مـــن xx-xx-xxxx الي xx-xx-xxxx"
        const periodRegex = /مـــن\s+(\d+[-\/]\d+[-\/]\d+)\s+الي\s+(\d+[-\/]\d+[-\/]\d+)/;
        const periodMatch = note.match(periodRegex);
        
        // أو في النمط "من xx-xx-xxxx الى xx-xx-xxxx"
        const altPeriodRegex = /من\s+(\d+[-\/]\d+[-\/]\d+)\s+الى\s+(\d+[-\/]\d+[-\/]\d+)/;
        const altPeriodMatch = note.match(altPeriodRegex);
        
        const match = periodMatch || altPeriodMatch;
        
        if (match) {
            return {
                startDate: match[1],
                endDate: match[2],
            };
        }
        
        return null;
    }
    
    /**
     * دالة لحساب عدد الأيام في فترة الإجازة
     * @param {string} periodKey - مفتاح الفترة بتنسيق "startDate_endDate"
     * @returns {number} عدد الأيام في الفترة
     */
    function calculateLeaveDuration(periodKey) {
        if (!periodKey) return 1; // إذا لم يتم العثور على فترة، افترض يوم واحد
        
        // تقسيم المفتاح للحصول على تاريخي البداية والنهاية
        const [startDate, endDate] = periodKey.split('_');
        
        // تحويل التاريخ من التنسيق "xx-xx-xxxx" إلى مكونات
        const [startDay, startMonth, startYear] = startDate.split('-').map(Number);
        const [endDay, endMonth, endYear] = endDate.split('-').map(Number);
        
        // حساب الفرق بالأيام (تقريبي، لا يأخذ في الاعتبار الشهور المختلفة بدقة)
        // لحساب دقيق نحتاج تحويل التاريخ الهجري إلى ميلادي وهو أمر معقد
        // هذا التقدير البسيط يعمل بشكل جيد للفترات القصيرة
        
        if (startYear !== endYear) {
            // تقدير تقريبي لعدد الأيام عبر سنوات مختلفة
            const daysInYear = 355; // تقريب لعدد أيام السنة الهجرية
            return (endYear - startYear) * daysInYear + (endDay - startDay + 1) + 
                   (endMonth - startMonth) * 30; // تقريب متوسط أيام الشهر الهجري
        } else if (startMonth !== endMonth) {
            // تقدير عدد الأيام عبر شهور مختلفة
            return (endMonth - startMonth) * 30 + (endDay - startDay + 1); // تقريب متوسط أيام الشهر الهجري
        } else {
            // نفس الشهر والسنة
            return endDay - startDay + 1;
        }
    }
    
    /**
     * دالة لتحديد ما إذا كانت الإجازة مفردة (أقل من 5 أيام)
     * @param {string} periodKey - مفتاح الفترة
     * @param {string} leaveType - نوع الإجازة
     * @returns {boolean} هل الإجازة مفردة
     */
    function isSingleLeave(periodKey, leaveType) {
        // لا نعتبر الإجازات الأسبوعية أو المهام والاستئذانات كإجازات مفردة
        if (leaveType.includes("الاجازة الاسبوعية") || 
            leaveType.includes("مهمة") || 
            leaveType.includes("استئذان")) {
            return false;
        }
        
        const duration = calculateLeaveDuration(periodKey);
        return duration < 5; // أقل من 5 أيام
    }
    
    /**
     * تحليل بيانات الحضور والإجازات
     */
    function analyzeAttendance() {
        // مسح وحدة التحكم قبل البدء
        console.clear();
        console.log("جاري تحليل البيانات...");

        // جمع كل صفوف الجدول
        const rows = document.querySelectorAll('table tr.data-label');

        // تهيئة متغيرات لحساب أنواع الإجازات
        const leaveTypesSummary = {}; // ملخص الإجازات المجمعة
        const leavePeriodsMap = new Map(); // تخزين فترات الإجازة لتحديد مدتها

        let totalWorkDays = 0;
        let totalLeaveDays = 0;
        let regularLeaveDays = 0; // عدد أيام الإجازات الاعتيادية
        let missionsAndPermissionsDays = 0; // عدد أيام المهام والاستئذان
        let singleLeaveDays = 0; // عدد أيام الإجازات المفردة (أقل من 5 أيام)
        let presentDays = 0;
        let absentDays = 0;

        // متغيرات لتحليل أوقات الحضور
        const arrivalTimes = [];
        const departureTimes = [];
        let lateArrivalCount = 0;

        // فحص كل صف في الجدول
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');

            // التاريخ في الخلية الثانية
            const date = cells[1].textContent.trim();

            // وقت الحضور في الخلية الثالثة
            const arrivalTime = cells[2].textContent.trim();

            // وقت الانصراف في الخلية الرابعة
            const departureTime = cells[3].textContent.trim();

            // ملاحظات في الخلية الخامسة
            const note = cells[4].textContent.trim();

            // تحديد إذا كان اليوم في شهر رمضان (الشهر 9 في التقويم الهجري)
            const isRamadan = date && date.split('/')[1] === '9';

            // إذا كانت هناك ملاحظة فهي تشير إلى نوع الإجازة
            if (note) {
                // استخراج النوع الرئيسي للإجازة
                const mainLeaveType = extractMainLeaveType(note);
                
                // استخراج فترة الإجازة إن وجدت
                const leavePeriod = extractLeavePeriod(note);
                let periodKey = null;
                
                if (leavePeriod) {
                    periodKey = `${leavePeriod.startDate}_${leavePeriod.endDate}`;
                    // تخزين فترة الإجازة ونوعها إذا لم تكن مخزنة من قبل
                    if (!leavePeriodsMap.has(periodKey)) {
                        leavePeriodsMap.set(periodKey, {
                            type: mainLeaveType,
                            duration: calculateLeaveDuration(periodKey),
                            counted: false
                        });
                    }
                }
                
                // إضافة الإجازة إلى إحصائيات أنواع الإجازات المجمعة (بما في ذلك الإجازة الأسبوعية)
                if (!leaveTypesSummary[mainLeaveType]) {
                    leaveTypesSummary[mainLeaveType] = 0;
                }
                leaveTypesSummary[mainLeaveType]++;
                
                // استبعاد الإجازات الأسبوعية من الإحصائيات العامة
                if (!mainLeaveType.includes("الاجازة الاسبوعية")) {
                    // حساب إجازات الاعتيادية
                    if (mainLeaveType.includes("إجـازة إعتيادية")) {
                        regularLeaveDays++;
                        
                        // التحقق من الإجازات المفردة (أقل من 5 أيام) وحسابها فقط مرة واحدة لكل فترة
                        if (leavePeriod && isSingleLeave(periodKey, mainLeaveType)) {
                            const periodInfo = leavePeriodsMap.get(periodKey);
                            if (!periodInfo.counted) {
                                singleLeaveDays += periodInfo.duration;
                                periodInfo.counted = true;
                            }
                        }
                    }
                    
                    // حساب أيام المهام والاستئذان
                    if (mainLeaveType.includes("مهمة") || mainLeaveType.includes("استئذان")) {
                        missionsAndPermissionsDays++;
                    } else {
                        // إضافة اليوم إلى إجمالي الإجازات باستثناء المهام والاستئذان
                        totalLeaveDays++;
                    }
                }
            } else {
                // إذا لم تكن هناك ملاحظة، فنتحقق مما إذا كان هناك حضور
                if (arrivalTime && departureTime) {
                    presentDays++;

                    // تحويل وقت الحضور إلى دقائق لتسهيل الحساب
                    const [hour, minute] = arrivalTime.split(':').map(Number);
                    const timeInMinutes = hour * 60 + minute;
                    arrivalTimes.push(timeInMinutes);

                    // تحديد التأخير حسب الشهر (10:00 في رمضان، 8:30 في غيره)
                    // لكن نجمعها في إحصائية واحدة
                    if (isRamadan) {
                        if (timeInMinutes > 10 * 60) {
                            lateArrivalCount++;
                        }
                    } else {
                        if (timeInMinutes > 8 * 60 + 30) {
                            lateArrivalCount++;
                        }
                    }

                    // تحويل وقت الانصراف إلى دقائق
                    const [depHour, depMinute] = departureTime.split(':').map(Number);
                    const depTimeInMinutes = depHour * 60 + depMinute;
                    departureTimes.push(depTimeInMinutes);
                } else if (arrivalTime && !departureTime) {
                    // حاضر ولكن لم يسجل مغادرة
                    presentDays++;
                } else {
                    // غائب بدون ملاحظة
                    absentDays++;
                }
            }

            totalWorkDays++;
        });

        // حساب متوسط وقت الحضور
        const averageArrivalTime = arrivalTimes.length > 0
            ? Helpers.calculateAverageTime(arrivalTimes)
            : "لا توجد بيانات";

        // حساب متوسط وقت الانصراف
        const averageDepartureTime = departureTimes.length > 0
            ? Helpers.calculateAverageTime(departureTimes)
            : "لا توجد بيانات";

        // حساب متوسط ساعات العمل
        const averageWorkHours = Helpers.calculateAverageWorkHours(arrivalTimes, departureTimes);

        // إعداد البيانات للعرض
        const resultData = {
            totalWorkDays,
            presentDays,
            totalLeaveDays,
            regularLeaveDays,
            missionsAndPermissionsDays,
            singleLeaveDays,
            absentDays,
            leaveTypesSummary,
            averageArrivalTime,
            averageDepartureTime,
            averageWorkHours,
            lateArrivalCount,
            latePercentage: ((lateArrivalCount / presentDays) * 100).toFixed(2)
        };

        // إظهار النتائج
        Renderer.createResultWindow(resultData);
    }
    
    // كشف الواجهات العامة
    return {
        analyzeAttendance
    };
})();
