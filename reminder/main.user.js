// ==UserScript==
// @name         أداة التذكير للمعاملات (متعددة الصفوف)
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  أداة تذكير تحفظ الصفوف المختارة وتذكّرك بها بعد وقت محدد
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

    // تعريفات للمحرر فقط لتجنب التحذيرات
    let addReminderButton, setupRowSelection, setupObserver, checkForReminders;
    let addGlobalStyles, updateReminderBadge, findButtonById;

    // التهيئة
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
