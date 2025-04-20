// المتغيرات العامة للصوت
let reminderAudio = null;
let isSoundEnabled = true;

/**
 * تهيئة صوت التذكير
 */
function initReminderSound() {
    try {
        if (!reminderAudio) {
            reminderAudio = new Audio();
            // استخدام صوت بسيط من البيانات المضمنة
            reminderAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAQMAIEBgYGBgYGBgYGBgYGBgYGBgkJCQkJCQkJCQkJCQkJCQkMDAwMDAwMDAwMDAwMDAwMD/////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCkAAAAAAAAAEDIEV/q3cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
            
            // تعيين حجم الصوت للمستوى المناسب
            reminderAudio.volume = 0.7;
            
            // تحميل الصوت مسبقاً
            reminderAudio.load();
        }
    } catch (e) {
        console.error('خطأ في تهيئة صوت التذكير:', e);
    }
}

/**
 * تشغيل صوت التذكير
 * @param {number} times - عدد مرات تكرار الصوت (افتراضياً 3)
 */
function playReminderSound(times = 3) {
    if (!isSoundEnabled) return;
    
    try {
        // التأكد من تهيئة الصوت
        if (!reminderAudio) {
            initReminderSound();
        }
        
        // إعادة ضبط الصوت إذا كان قيد التشغيل
        reminderAudio.pause();
        reminderAudio.currentTime = 0;
        
        // تشغيل الصوت
        reminderAudio.play().catch(e => {
            // معالجة خطأ عدم تفاعل المستخدم
            console.warn('تعذر تشغيل الصوت تلقائياً. قد يتطلب تفاعل المستخدم أولاً.');
        });
        
        // تكرار الصوت إذا طلب المستخدم أكثر من مرة
        let playCount = 1;
        const audioInterval = setInterval(() => {
            if (playCount >= times) {
                clearInterval(audioInterval);
                return;
            }
            
            reminderAudio.pause();
            reminderAudio.currentTime = 0;
            reminderAudio.play().catch(e => {
                console.warn('تعذر تشغيل الصوت في التكرار.');
            });
            playCount++;
        }, 1500);
    } catch (e) {
        console.error('خطأ في تشغيل صوت التذكير:', e);
    }
}

/**
 * تبديل حالة تفعيل الصوت
 * @returns {boolean} - الحالة الجديدة للصوت
 */
function toggleReminderSound() {
    isSoundEnabled = !isSoundEnabled;
    return isSoundEnabled;
}

/**
 * ضبط حالة تفعيل الصوت
 * @param {boolean} enabled - حالة تفعيل الصوت
 */
function setReminderSoundEnabled(enabled) {
    isSoundEnabled = enabled;
}

// تهيئة الصوت عند تحميل السكريبت
initReminderSound();
