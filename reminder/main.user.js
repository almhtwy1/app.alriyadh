// ==UserScript==
// @name         أداة التذكير للمعاملات (متعددة الصفوف) مع حساب المدة
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  إضافة زر تذكير لحفظ بيانات الصفوف المحددة والتذكير بها بعد وقت محدد مع إظهار المدة وحسابها من التاريخ الهجري، وإمكانية تأجيل التذكير وعدم حذفه إلا بإجراء من المستخدم.
// @author       You
// @match        http://rasel/CTS/CTSC*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/core/Storage.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/features/ReminderManager.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/ui/ReminderButton.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/observers/MutationHandler.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/plugins/ReminderSound.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/utils/DOMUtils.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/utils/DateFormatter.js
// ==/UserScript==

(function() {
    'use strict';

    // دوال حساب المدة - من السكريبت الأول (متتبع المعاملات الشامل)
    // تعريف الدوال في النطاق العام للوصول إليها من بقية الملفات
    window.gregorianToHijri = function(gy, gm, gd) {
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
    };

    window.hijriToAbsolute = function(iy, im, id) {
        return id + Math.ceil(29.5 * (im - 1)) + (iy - 1) * 354 + Math.floor((3 + 11 * iy) / 30);
    };

    window.convertToEnglishNumbers = function(s) {
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
    };

    window.calculateDuration = function(hijriDateStr) {
        if (!hijriDateStr || hijriDateStr === "غير متوفر") return "غير متوفر";
        
        // تنظيف وتحويل التاريخ
        let cleanDate = window.convertToEnglishNumbers(hijriDateStr);
        let parts = cleanDate.split(/[\/\-]/);
        
        // التأكد من صحة التنسيق
        if (parts.length < 3) return "تنسيق خاطئ";
        
        // استخراج مكونات التاريخ الهجري
        let hYear = parseInt(parts[0], 10);
        let hMonth = parseInt(parts[1], 10);
        let hDay = parseInt(parts[2], 10);
        
        // تحويل التاريخ الهجري المستخرج إلى عدد أيام مطلق
        let referralAbs = window.hijriToAbsolute(hYear, hMonth, hDay);
        
        // الحصول على التاريخ الميلادي الحالي ثم تحويله إلى هجري
        let today = new Date();
        let currentHijri = window.gregorianToHijri(today.getFullYear(), today.getMonth(), today.getDate());
        let currentAbs = window.hijriToAbsolute(currentHijri.year, currentHijri.month, currentHijri.day);
        
        // حساب الفرق بالأيام
        let diff = currentAbs - referralAbs;
        
        // تنسيق النتيجة
        if (diff === 0) return 'اليوم';
        if (diff === 1) return 'أمس';
        return diff > 0 ? diff + ' يوم' : 'تاريخ مستقبلي';
    };

    // تعديل دالة عرض نافذة التذكير
    window.showUnifiedReminderPopup = function(showAll = false, showButtons = true) {
        try {
            const reminderList = getActiveRemindersList();
            const now = Date.now();
            let remindersToShow = showAll ? reminderList : reminderList.filter(r => now >= r.showAt);
            if (remindersToShow.length === 0) return;

            let popupContainer = document.getElementById('unifiedReminderPopup');
            if (popupContainer) {
                document.body.removeChild(popupContainer);
            }

            popupContainer = document.createElement('div');
            popupContainer.id = 'unifiedReminderPopup';
            popupContainer.className = 'reminderPopupContainer';

            let tableRows = '';
            let headerText = 'تذكيرات المعاملات';
            let subtitleText = `إجمالي المعاملات: ${remindersToShow.reduce((sum, r) => sum + r.count, 0)}`;

            if (remindersToShow.length === 1) {
                const reminderItem = remindersToShow[0];
                const reminder = getReminder(reminderItem.id);
                if (!reminder) return;
                const timePassed = Math.floor((now - reminder.createdAt) / (60 * 1000));

                if (!reminder.data || reminder.data.length === 0) return;

                headerText = 'تذكير بالمعاملات';
                subtitleText = `تم إنشاء هذا التذكير منذ ${timePassed} دقيقة - عدد المعاملات: ${reminder.data.length}`;

                reminder.data.forEach((rowData, index) => {
                    let transactionNumber = rowData.length > 0 ? rowData[0] : '';
                    let subject = rowData.length > 1 ? rowData[1] : '';
                    let date = rowData.length > 3 ? rowData[3] : '';
                    let duration = window.calculateDuration(date); // حساب المدة من التاريخ
                    
                    tableRows += `
                        <tr>
                            <td>
                                <button class="delete-row" data-reminder-id="${reminder.id}" data-index="${index}" title="حذف">×</button>
                            </td>
                            <td>${index + 1}</td>
                            <td>${transactionNumber}</td>
                            <td>${subject}</td>
                            <td>${formatDate(date)}</td>
                            <td>${duration}</td>
                        </tr>
                    `;
                });
            } else {
                remindersToShow.forEach((reminderItem, reminderIndex) => {
                    const reminder = getReminder(reminderItem.id);
                    if (!reminder) return;
                    const timePassed = Math.floor((now - reminder.createdAt) / (60 * 1000));

                    if (!reminder.data || reminder.data.length === 0) return;

                    tableRows += `
                        <tr class="reminder-group-header">
                            <td colspan="6">تذكير ${reminderIndex + 1} (منذ ${timePassed} دقيقة)</td>
                        </tr>
                    `;

                    reminder.data.forEach((rowData, index) => {
                        let transactionNumber = rowData.length > 0 ? rowData[0] : '';
                        let subject = rowData.length > 1 ? rowData[1] : '';
                        let date = rowData.length > 3 ? rowData[3] : '';
                        let duration = window.calculateDuration(date); // حساب المدة من التاريخ
                        
                        tableRows += `
                            <tr>
                                <td>
                                    <button class="delete-row" data-reminder-id="${reminder.id}" data-index="${index}" title="حذف">×</button>
                                </td>
                                <td>${index + 1}</td>
                                <td>${transactionNumber}</td>
                                <td>${subject}</td>
                                <td>${formatDate(date)}</td>
                                <td>${duration}</td>
                            </tr>
                        `;
                    });
                });
            }

            popupContainer.innerHTML = `
                <div class="popup-content">
                    <div class="popup-header">
                        <button class="close-popup-btn" title="إغلاق">×</button>
                        <h2>${headerText}</h2>
                        <div class="subtitle">${subtitleText}</div>
                    </div>
                    <div class="popup-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>حذف</th>
                                    <th>#</th>
                                    <th>رقم المعاملة</th>
                                    <th>الموضوع</th>
                                    <th>تاريخ الإحالة</th>
                                    <th>المدة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                    <div class="popup-footer" style="${showButtons ? '' : 'display: none;'}">
                        <input type="number" min="1" placeholder="دقائق" class="postponeInput" style="width: 60px; margin-right: 10px;" />
                        <button class="postponeBtn">تأجيل الكل</button>
                        <button class="closeAllBtn">إغلاق الكل</button>
                    </div>
                </div>
            `;

            addPopupStyles();
            document.body.appendChild(popupContainer);
            popupContainer.style.top = '50%';
            popupContainer.style.left = '50%';
            popupContainer.style.transform = 'translate(-50%, -50%)';

            popupContainer.addEventListener('mousedown', function(e) {
                bringToFront(popupContainer);
            });

            popupContainer.querySelector('.close-popup-btn').addEventListener('click', () => {
                document.body.removeChild(popupContainer);
            });

            popupContainer.querySelectorAll('.delete-row').forEach(btn => {
                btn.addEventListener('click', () => {
                    const reminderId = btn.dataset.reminderId;
                    const idx = parseInt(btn.dataset.index, 10);
                    const reminder = getReminder(reminderId);
                    if (!reminder) return;
                    reminder.data.splice(idx, 1);
                    let reminderList = getActiveRemindersList();
                    if (reminder.data.length === 0) {
                        deleteReminder(reminderId);
                        reminderList = reminderList.filter(r => r.id !== reminderId);
                        updateReminderList(reminderList);
                    } else {
                        saveReminder(reminderId, reminder);
                        reminderList = reminderList.map(r =>
                            r.id === reminderId
                            ? { id: r.id, count: reminder.data.length, showAt: r.showAt }
                            : r
                        );
                        updateReminderList(reminderList);
                    }
                    updateReminderBadge();
                    document.body.removeChild(popupContainer);
                    if (showAll && reminderList.length > 0) {
                        showUnifiedReminderPopup(true, false);
                    } else {
                        showUnifiedReminderPopup();
                    }
                });
            });

            if (showButtons) {
                popupContainer.querySelector('.postponeBtn').addEventListener('click', () => {
                    const postponeInput = popupContainer.querySelector('.postponeInput').value;
                    let newDelay = parseInt(postponeInput, 10);
                    if (isNaN(newDelay) || newDelay <= 0) {
                        alert("الرجاء إدخال رقم صحيح للدقائق في مربع التأجيل.");
                        return;
                    }
                    remindersToShow.forEach(reminderItem => {
                        const reminder = getReminder(reminderItem.id);
                        if (!reminder) return;
                        reminder.createdAt = Date.now();
                        reminder.showAt = Date.now() + (newDelay * 60 * 1000);
                        saveReminder(reminderItem.id, reminder);
                        let reminderList = getActiveRemindersList().map(r =>
                            r.id === reminderItem.id
                            ? { id: r.id, count: r.count, showAt: reminder.showAt }
                            : r
                        );
                        updateReminderList(reminderList);
                        setTimeout(() => {
                            showUnifiedReminderPopup();
                        }, newDelay * 60 * 1000);
                    });
                    alert("تم تأجيل جميع التذكيرات.");
                    document.body.removeChild(popupContainer);
                });

                popupContainer.querySelector('.closeAllBtn').addEventListener('click', () => {
                    remindersToShow.forEach(reminderItem => {
                        deleteReminder(reminderItem.id);
                    });
                    updateReminderList([]);
                    updateReminderBadge();
                    document.body.removeChild(popupContainer);
                });
            }

            makePopupDraggable(popupContainer);
        } catch (e) {
            console.error('خطأ في عرض التذكيرات:', e);
        }
    };

    // تعريف الدوال المساعدة لنافذة التذكير
    let highestZIndex = 9999;

    function bringToFront(popupElement) {
        highestZIndex++;
        popupElement.style.zIndex = highestZIndex;
    }

    function addPopupStyles() {
        if (document.getElementById('popupStyles')) return;
        const styleElement = document.createElement('style');
        styleElement.id = 'popupStyles';
        styleElement.textContent = `
            .reminderPopupContainer {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                direction: rtl;
                font-family: 'Droid Arabic Kufi', Arial, sans-serif;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                background: white;
                width: 900px;
                max-width: 95vw;
                max-height: 90vh;
                overflow: hidden;
            }
            .popup-content {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .popup-header {
                position: relative;
                padding: 15px 20px;
                border-bottom: 1px solid #e0e0e0;
                cursor: move;
                background: #fafafa;
            }
            .popup-header h2 {
                color: #D32F2F;
                margin: 0 0 5px 0;
                font-size: 22px;
            }
            .popup-header .subtitle {
                color: #555;
                font-size: 14px;
                font-weight: bold;
            }
            .popup-body {
                padding: 20px;
                overflow-y: auto;
                max-height: 70vh;
                flex-grow: 1;
            }
            .popup-footer {
                padding: 15px 20px;
                border-top: 1px solid #e0e0e0;
                text-align: left;
                background: #fafafa;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: right;
            }
            th {
                background-color: #f5f5f5;
                font-weight: bold;
                color: #333;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            tr:hover {
                background-color: #f0f0f0;
            }
            .reminder-group-header td {
                background-color: #e0e0e0;
                font-weight: bold;
                padding: 10px;
                border-top: 2px solid #ccc;
            }
            .closeAllBtn {
                background-color: #D32F2F;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                font-family: 'Droid Arabic Kufi', Arial, sans-serif;
                margin-right: 10px;
            }
            .postponeBtn {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                font-family: 'Droid Arabic Kufi', Arial, sans-serif;
                margin-right: 10px;
            }
            .closeAllBtn:hover {
                background-color: #B71C1C;
            }
            .postponeBtn:hover {
                background-color: #45A049;
            }
            .delete-row {
                color: #D32F2F;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                display: inline-block;
                line-height: 1;
                width: 20px;
                height: 20px;
                text-align: center;
            }
            .delete-row:hover {
                color: #B71C1C;
            }
            .postponeInput {
                padding: 6px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-family: 'Droid Arabic Kufi', Arial, sans-serif;
            }
            .close-popup-btn {
                position: absolute;
                left: 10px;
                top: 10px;
                background: none;
                border: none;
                font-size: 24px;
                color: #D32F2F;
                cursor: pointer;
                padding: 0;
                line-height: 1;
                width: 24px;
                height: 24px;
                text-align: center;
            }
            .close-popup-btn:hover {
                color: #B71C1C;
            }
        `;
        document.head.appendChild(styleElement);
    }

    function makePopupDraggable(popupElement) {
        const headerElement = popupElement.querySelector('.popup-header');
        if (!headerElement) return;
        let isDragging = false;
        let offsetX, offsetY;
        headerElement.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('close-popup-btn')) return;
            isDragging = true;
            offsetX = e.clientX - popupElement.getBoundingClientRect().left;
            offsetY = e.clientY - popupElement.getBoundingClientRect().top;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;
            const maxLeft = window.innerWidth - popupElement.offsetWidth;
            const maxTop = window.innerHeight - popupElement.offsetHeight;
            popupElement.style.left = Math.min(Math.max(0, newLeft), maxLeft) + 'px';
            popupElement.style.top = Math.min(Math.max(0, newTop), maxTop) + 'px';
            popupElement.style.transform = 'none';
        });
        document.addEventListener('mouseup', function() {
            isDragging = false;
            document.body.style.userSelect = '';
        });
    }

    // تهيئة المكونات
    addReminderButton();
    setupRowSelection();
    setupObserver();
    checkForReminders();

    // إضافة الأنماط العامة
    addGlobalStyles();

    // تحديث شارة التذكير بشكل دوري
    setInterval(updateReminderBadge, 3000);

    // التحقق من التذكيرات بشكل دوري
    let lastCheck = Date.now();
    setInterval(() => {
        const now = Date.now();
        if (now - lastCheck < 2000) return;
        lastCheck = now;
        addGlobalStyles();
        if (!findButtonById('6787')) {
            addReminderButton();
        }
        setupRowSelection();
        updateReminderBadge();
    }, 2000);
})();
