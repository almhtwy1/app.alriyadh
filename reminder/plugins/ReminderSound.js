// المتغيرات العامة للصوت
let reminderAudio = null;
let isSoundEnabled = true;
let hasUserInteraction = false;

/**
 * تهيئة صوت التذكير
 */
function initReminderSound() {
    try {
        if (!reminderAudio) {
            console.log('جاري تهيئة صوت التذكير...');
            reminderAudio = new Audio();
            
            // استخدام صوت تنبيه أكثر وضوحاً
            reminderAudio.src = 'https://www.soundjay.com/button/sounds/beep-07.mp3';
            // صوت احتياطي مضمن في حالة فشل تحميل الصوت من الإنترنت
            reminderAudio.onerror = function() {
                console.log('فشل تحميل الصوت من الإنترنت، جاري استخدام الصوت الاحتياطي...');
                reminderAudio.src = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADgnABGiAAQBCqgCRMAAgEAH///////////////7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq//////////////////uQxEaAHsABLAAAAQAAACXAAAAE//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8=';
            };
            
            // تعيين حجم الصوت لمستوى أعلى
            reminderAudio.volume = 1.0;
            
            // تحميل الصوت مسبقاً
            reminderAudio.load();
            
            // إضافة مستمع لتفاعل المستخدم مع الصفحة
            document.addEventListener('click', enableUserInteraction);
            document.addEventListener('keydown', enableUserInteraction);
            
            console.log('تم تهيئة صوت التذكير بنجاح');
        }
    } catch (e) {
        console.error('خطأ في تهيئة صوت التذكير:', e);
    }
}

/**
 * تمكين تشغيل الصوت بعد تفاعل المستخدم
 */
function enableUserInteraction() {
    hasUserInteraction = true;
    console.log('تم تمكين تشغيل الصوت بعد تفاعل المستخدم');
    
    // تشغيل صوت صامت لتفعيل إمكانية تشغيل الصوت لاحقاً
    try {
        const silentAudio = new Audio();
        silentAudio.volume = 0.01;
        silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAQMAIEBgYGBgYGBgYGBgYGBgYGBgkJCQkJCQkJCQkJCQkJCQkMDAwMDAwMDAwMDAwMDAwMD/////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCkAAAAAAAAAEDIEV/q3cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
        silentAudio.play().catch(e => console.log('تم رفض تشغيل الصوت الصامت، سيتم المحاولة لاحقاً'));
    } catch (e) {
        console.error('خطأ في تشغيل الصوت الصامت:', e);
    }
    
    // إزالة المستمعين بعد التفعيل
    document.removeEventListener('click', enableUserInteraction);
    document.removeEventListener('keydown', enableUserInteraction);
}

/**
 * تشغيل صوت التذكير
 * @param {number} times - عدد مرات تكرار الصوت (افتراضياً 3)
 */
function playReminderSound(times = 3) {
    if (!isSoundEnabled) {
        console.log('الصوت معطل، لن يتم تشغيله');
        return;
    }
    
    if (!hasUserInteraction) {
        console.log('لم يتم تسجيل تفاعل المستخدم بعد، لن يتم تشغيل الصوت');
        
        // محاولة تشغيل صوت بعد 1 ثانية
        setTimeout(() => {
            if (hasUserInteraction) {
                console.log('تم تسجيل تفاعل المستخدم، محاولة تشغيل الصوت مرة أخرى');
                playReminderSound(times);
            }
        }, 1000);
        
        return;
    }
    
    try {
        // التأكد من تهيئة الصوت
        if (!reminderAudio) {
            console.log('جاري تهيئة الصوت قبل التشغيل...');
            initReminderSound();
        }
        
        console.log('محاولة تشغيل صوت التذكير...');
        
        // إعادة ضبط الصوت إذا كان قيد التشغيل
        reminderAudio.pause();
        reminderAudio.currentTime = 0;
        
        // تشغيل الصوت باستخدام Promise
        reminderAudio.play().then(() => {
            console.log('تم تشغيل الصوت بنجاح');
            
            // تكرار الصوت إذا طلب المستخدم أكثر من مرة
            if (times > 1) {
                let playCount = 1;
                const audioInterval = setInterval(() => {
                    if (playCount >= times) {
                        clearInterval(audioInterval);
                        return;
                    }
                    
                    console.log(`تشغيل الصوت مرة ${playCount + 1} من ${times}`);
                    reminderAudio.pause();
                    reminderAudio.currentTime = 0;
                    reminderAudio.play().catch(e => {
                        console.error(`فشل في تشغيل الصوت (محاولة ${playCount + 1}):`, e);
                        clearInterval(audioInterval);
                    });
                    
                    playCount++;
                }, 1500);
            }
        }).catch(e => {
            console.error('فشل في تشغيل الصوت:', e);
            
            // محاولة تشغيل الصوت الاحتياطي البسيط
            try {
                // إنشاء صوت بسيط باستخدام Web Audio API كبديل
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.3;
                
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                }, 300);
                
                console.log('تم تشغيل صوت بديل باستخدام Web Audio API');
            } catch (webAudioError) {
                console.error('فشل في تشغيل الصوت البديل:', webAudioError);
            }
        });
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

// إضافة زر تفعيل الصوت إلى واجهة المستخدم
function addSoundToggleButton() {
    try {
        // التحقق من عدم وجود الزر مسبقًا
        if (document.getElementById('sound-toggle-button')) {
            return;
        }
        
        // إنشاء زر تفعيل/تعطيل الصوت
        const soundButton = document.createElement('button');
        soundButton.id = 'sound-toggle-button';
        soundButton.innerHTML = isSoundEnabled ? '🔊' : '🔇';
        soundButton.title = isSoundEnabled ? 'انقر لإيقاف الصوت' : 'انقر لتفعيل الصوت';
        soundButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #fff;
            border: 2px solid #ddd;
            font-size: 20px;
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        
        // إضافة معالج النقر
        soundButton.addEventListener('click', () => {
            const newState = toggleReminderSound();
            soundButton.innerHTML = newState ? '🔊' : '🔇';
            soundButton.title = newState ? 'انقر لإيقاف الصوت' : 'انقر لتفعيل الصوت';
            
            // تفعيل تفاعل المستخدم
            enableUserInteraction();
            
            // تشغيل صوت تجريبي إذا تم تفعيل الصوت
            if (newState) {
                playReminderSound(1);
            }
        });
        
        // إضافة الزر إلى الصفحة
        document.body.appendChild(soundButton);
        
    } catch (e) {
        console.error('خطأ في إضافة زر تفعيل/تعطيل الصوت:', e);
    }
}

// إضافة زر تفعيل الصوت بعد تحميل الصفحة
if (document.readyState === 'complete') {
    addSoundToggleButton();
} else {
    window.addEventListener('load', addSoundToggleButton);
}
