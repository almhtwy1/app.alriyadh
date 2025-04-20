// ==UserScript==
// @name         أداة التذكير للمعاملات (متعددة الصفوف)
// @namespace    http://tampermonkey.net/
// @version      2.1
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
        }
    };
    
    // الاستماع إلى تغييرات حالة النافذة لتوفير الموارد
    document.addEventListener('visibilitychange', onVisibilityChange);

    // مراقبة النقر على الألسنة مباشرة
    document.addEventListener('click', (e) => {
        // تحقق مما إذا كان النقر على لسان
        const clickedTab = e.target.closest('.chrometabs li, .tab-container li');
        if (clickedTab) {
            console.log('تم النقر على لسان:', clickedTab.id || clickedTab.textContent);
            
            // تأخير قصير لضمان تحديث DOM
            setTimeout(() => {
                console.log('التحقق من وجود زر التذكير بعد النقر على اللسان');
                if (!findButtonById('6787')) {
                    addReminderButton();
                }
                updateReminderBadge();
            }, 500);
        }
    });

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
    
    // مراقبة تغييرات DOM الخاصة بالألسنة
    const tabsObserverSetup = () => {
        const tabsContainer = document.querySelector('.chrometabs') || 
                             document.querySelector('.tab-container ul') ||
                             document.querySelector('#home_RightPanel_Menu');
        
        if (tabsContainer) {
            console.log('تم إيجاد حاوية الألسنة، إعداد مراقب خاص');
            
            const tabsObserver = new MutationObserver((mutations) => {
                console.log('تم رصد تغييرات في الألسنة');
                // تأخير قصير لضمان اكتمال التغييرات
                setTimeout(() => {
                    if (!findButtonById('6787')) {
                        console.log('زر التذكير غير موجود، جاري إضافته');
                        addReminderButton();
                    }
                }, 300);
            });
            
            tabsObserver.observe(tabsContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        } else {
            // إذا لم يتم إيجاد حاوية الألسنة، حاول مرة أخرى بعد فترة
            setTimeout(tabsObserverSetup, 1000);
        }
    };
    
    // بدء مراقبة الألسنة
    tabsObserverSetup();
})();
