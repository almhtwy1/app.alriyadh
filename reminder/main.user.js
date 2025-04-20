// ==UserScript==
// @name         أداة التذكير للمعاملات (متعددة الصفوف) مع دعم الألسنة
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  إضافة زر تذكير لحفظ بيانات الصفوف المحددة والتذكير بها بعد وقت يتم تحديده بالدقائق من قبل المستخدم، مع دعم الألسنة المتعددة وضمان ظهور الزر عند التبديل بين الألسنة.
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
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/reminder/observers/TabObserver.js
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
            ensureReminderButtonExists();
            
            // التحقق من التذكيرات وتحديث الشارة
            checkForReminders();
            updateReminderBadge();
            setupRowSelection();
            
            // إعادة تهيئة مراقب الألسنة
            resetTabObserver();
        }
    };
    
    // الاستماع إلى تغييرات حالة النافذة لتوفير الموارد
    document.addEventListener('visibilitychange', onVisibilityChange);

    // تهيئة المكونات الأساسية
    function initializeComponents() {
        console.log('تهيئة المكونات الأساسية');
        addReminderButton();
        setupRowSelection();
        setupObserver();
        setupTabObserver(); // إضافة مراقب الألسنة
        checkForReminders();
        addGlobalStyles();
    }

    // استدعاء تهيئة المكونات بعد تأخير قصير لضمان تحميل الصفحة
    setTimeout(initializeComponents, 500);

    // تحديث شارة التذكير بشكل دوري - وقت أطول لتوفير الأداء
    const reminderBadgeInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            updateReminderBadge();
        }
    }, 5000);

    // التحقق من التذكيرات والمكونات بشكل دوري مع تحسين الأداء
    let lastCheck = Date.now();
    const componentCheckInterval = setInterval(() => {
        // التحقق فقط إذا كانت النافذة مرئية ونشطة
        if (document.visibilityState === 'visible') {
            const now = Date.now();
            if (now - lastCheck < 3000) return;
            lastCheck = now;
            
            // فحص وجود زر التذكير في اللسان النشط
            ensureReminderButtonExists();

            // تحديث الأنماط العامة
            addGlobalStyles();
        }
    }, 3000);
    
    // الاستماع إلى نقرات المستخدم للكشف عن تبديل الألسنة
    document.addEventListener('click', (e) => {
        // تأخير قصير لضمان اكتمال تحديث DOM بعد تبديل اللسان
        setTimeout(() => {
            if (e.target.closest('.chrometabs li') || e.target.closest('.tab-container li')) {
                console.log('تم النقر على لسان - التحقق من وجود زر التذكير');
                ensureReminderButtonExists();
            }
        }, 300);
    });
    
    // تنظيف الفواصل الزمنية عند مغادرة الصفحة
    window.addEventListener('beforeunload', () => {
        clearInterval(reminderBadgeInterval);
        clearInterval(componentCheckInterval);
        if (tabObserver) {
            tabObserver.disconnect();
        }
    });
    
    // وظيفة للتحقق من وجود تحديثات للمكونات
    function checkComponentsExistence() {
        if (!document.getElementById('reminder-global-styles')) {
            addGlobalStyles();
        }
        
        ensureReminderButtonExists();
        resetTabObserver();
    }
    
    // التحقق من المكونات بعد تحميل الصفحة
    if (document.readyState === 'complete') {
        checkComponentsExistence();
    } else {
        window.addEventListener('load', checkComponentsExistence);
    }
    
    // مراقبة تحميل الإطارات الفرعية
    function observeIframeLoads() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.addEventListener('load', () => {
                console.log('تم تحميل إطار فرعي - التحقق من وجود زر التذكير');
                setTimeout(() => {
                    ensureReminderButtonExists();
                }, 300);
            });
        });
    }
    
    // تنفيذ مراقبة الإطارات بشكل دوري
    setInterval(observeIframeLoads, 5000);
})();
