// ==UserScript==
// @name         أداة التذكير للمعاملات (متعددة الصفوف)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  إضافة زر تذكير لحفظ بيانات الصفوف المحددة والتذكير بها بعد وقت يتم تحديده بالدقائق من قبل المستخدم، مع إمكانية تأجيل التذكير بناءً على الرقم المدخل في مربع بجانب زر التأجيل وعدم حذف التذكير إلا عند اتخاذ إجراء من المستخدم. يتيح النقر المزدوج على الصف لفتح المعاملة دون تعطيل، مع إضافة عمود حذف لكل صف في نافذة التذكير يظهر كـ "×" بدون خلفية دائرية.
// @author       محمد بن مطلق القحطاني
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

    // عند الدخول للنافذة
    const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            console.log('التبديل إلى نافذة نشطة - تحديث مكونات التذكير');
            
            // التأكد من وجود الزر
            if (!findButtonById('6787')) {
                addReminderButton();
            }
            
            // التحقق من التذكيرات وتحديث الشارة
            checkForReminders();
            updateReminderBadge();
            setupRowSelection();
            
            // تفعيل نظام الصوت عند العودة للنافذة
            if (typeof enableUserInteraction === 'function') {
                enableUserInteraction();
            }
        }
    };
    
    // الاستماع إلى تغييرات حالة النافذة لتوفير الموارد
    document.addEventListener('visibilitychange', onVisibilityChange);

    // تهيئة المكونات الأساسية
    addReminderButton();
    setupRowSelection();
    setupObserver();
    checkForReminders();

    // إضافة الأنماط العامة
    addGlobalStyles();

    // تحديث شارة التذكير بشكل دوري - وقت أطول لتوفير الأداء
    const reminderBadgeInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            updateReminderBadge();
        }
    }, 5000); // زيادة من 3000 إلى 5000 مللي ثانية

    // التحقق من التذكيرات والمكونات بشكل دوري مع تحسين الأداء
    let lastCheck = Date.now();
    const componentCheckInterval = setInterval(() => {
        // التحقق فقط إذا كانت النافذة مرئية ونشطة
        if (document.visibilityState === 'visible') {
            const now = Date.now();
            if (now - lastCheck < 3000) return;
            lastCheck = now;
            
            // فحص فقط إذا كانت هناك حاجة
            if (!findButtonById('6787')) {
                addReminderButton();
            }

            // تحديث الشارة والأنماط
            updateReminderBadge();
            addGlobalStyles();
        }
    }, 3000); // زيادة من 2000 إلى 3000 مللي ثانية
    
    // تنظيف الفواصل الزمنية عند مغادرة الصفحة
    window.addEventListener('beforeunload', () => {
        clearInterval(reminderBadgeInterval);
        clearInterval(componentCheckInterval);
    });
    
    // وظيفة للتحقق من وجود تحديثات للمكونات
    function checkComponentsExistence() {
        if (!document.getElementById('reminder-global-styles')) {
            addGlobalStyles();
        }
        
        if (!findButtonById('6787')) {
            addReminderButton();
        }
    }
    
    // التحقق من المكونات بعد تحميل الصفحة
    if (document.readyState === 'complete') {
        checkComponentsExistence();
    } else {
        window.addEventListener('load', checkComponentsExistence);
    }
    
    // تهيئة وتفعيل نظام الصوت
    function initSoundSystem() {
        // محاولة تفعيل الصوت بعد تفاعل المستخدم
        document.addEventListener('click', function activateSound() {
            console.log('تم تسجيل نقرة مستخدم، جاري تفعيل نظام الصوت');
            if (typeof enableUserInteraction === 'function') {
                enableUserInteraction();
            }
            // نقوم بإزالة المستمع بعد أول نقرة
            document.removeEventListener('click', activateSound);
        }, { once: true });
        
        // إضافة زر الصوت إلى واجهة المستخدم بعد 3 ثوان من تحميل الصفحة
        setTimeout(() => {
            if (typeof addSoundToggleButton === 'function') {
                addSoundToggleButton();
            }
        }, 3000);
    }
    
    // استدعاء تهيئة نظام الصوت
    initSoundSystem();
})();
