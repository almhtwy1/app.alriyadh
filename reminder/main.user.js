// ==UserScript==
// @name         أداة التذكير للمعاملات (متعددة الصفوف)
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  إضافة زر تذكير لحفظ بيانات الصفوف المحددة والتذكير بها بعد وقت يتم تحديده بالدقائق من قبل المستخدم، مع إمكانية تأجيل التذكير بناءً على الرقم المدخل في مربع بجانب زر التأجيل وعدم حذف التذكير إلا عند اتخاذ إجراء من المستخدم. يتيح النقر المزدوج على الصف لفتح المعاملة دون تعطيل، مع إضافة عمود حذف لكل صف في نافذة التذكير يظهر كـ "×" بدون خلفية دائرية.
// @author       You
// @match        http://rasel/CTS/CTSC*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/core/Storage.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/features/ReminderManager.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/ui/ReminderButton.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/ui/ReminderPopup.js
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
