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
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/features/ReminderManager-Updated.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/ui/ReminderButton.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/utils/DurationUtils.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/ui/ReminderPopup-Updated.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/observers/MutationHandler.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/plugins/ReminderSound.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/utils/DOMUtils.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/utils/DateFormatter.js
// ==/UserScript==

(function() {
    'use strict';

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
