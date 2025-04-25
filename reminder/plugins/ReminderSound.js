// تعديلات على ملف ReminderPopup.js لتحسين استدعاء الصوت

// في نهاية دالة showUnifiedReminderPopup، تعديل استدعاء الصوت كالتالي:
try {
    // تشغيل صوت التذكير مع إعطاء الأولوية لتفاعل المستخدم
    if (hasUserInteraction) {
        playReminderSound(3); // تشغيل الصوت 3 مرات
    } else {
        // إذا لم يكن هناك تفاعل مستخدم، ننتظر قليلاً ثم نحاول مرة أخرى
        console.log('جاري انتظار تفاعل المستخدم قبل تشغيل الصوت...');
        setTimeout(() => {
            if (hasUserInteraction) {
                playReminderSound(3);
            } else {
                console.log('لم يتم تسجيل تفاعل مستخدم، لن يتم تشغيل الصوت');
            }
        }, 2000);
    }
} catch (e) {
    console.error('خطأ في تشغيل صوت التذكير:', e);
}

// تعديلات على ملف main.user.js لتشغيل الصوت عند بدء التطبيق

// إضافة الكود التالي في نهاية الدالة الرئيسية (function() { ... })
// في الجزء الأخير من السكريبت، قبل الإغلاق })();

// تهيئة وتفعيل الصوت عند بدء التطبيق
function initSoundSystem() {
    // محاولة تفعيل الصوت بعد تفاعل المستخدم
    document.addEventListener('click', function activateSound() {
        console.log('تم تسجيل نقرة مستخدم، جاري تفعيل نظام الصوت');
        enableUserInteraction();
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
