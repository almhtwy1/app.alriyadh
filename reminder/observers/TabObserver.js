/**
 * مراقبة الألسنة وإضافة زر التذكير عند التبديل بينها
 */

// تخزين المعلومات عن آخر لسان نشط
let lastActiveTabId = '';
let tabObserver = null;

/**
 * تهيئة مراقب الألسنة
 */
function setupTabObserver() {
    // إذا كان المراقب موجوداً بالفعل، قم بتنظيفه
    if (tabObserver) {
        tabObserver.disconnect();
    }
    
    // العثور على حاوية الألسنة
    const tabContainer = document.querySelector('.chrometabs') || 
                        document.querySelector('.tab-container ul') ||
                        document.querySelector('#home_RightPanel_Menu');
                        
    if (!tabContainer) {
        console.log('لم يتم العثور على حاوية الألسنة');
        return;
    }
    
    // تحديد اللسان النشط الحالي
    const activeTab = tabContainer.querySelector('li.active');
    if (activeTab) {
        lastActiveTabId = activeTab.id;
        console.log('اللسان النشط الحالي:', lastActiveTabId);
    }
    
    // إنشاء مراقب للتغييرات في الألسنة
    tabObserver = new MutationObserver((mutations) => {
        // التحقق من وجود تغييرات في الألسنة النشطة
        const activeTab = tabContainer.querySelector('li.active');
        if (activeTab && activeTab.id !== lastActiveTabId) {
            console.log('تم تغيير اللسان النشط من', lastActiveTabId, 'إلى', activeTab.id);
            lastActiveTabId = activeTab.id;
            
            // تأخير قصير للتأكد من اكتمال تحميل محتوى اللسان
            setTimeout(() => {
                ensureReminderButtonExists();
            }, 300);
        }
        
        // التحقق من وجود تغييرات في عدد الألسنة (فتح أو إغلاق لسان)
        const tabCountChanged = mutations.some(mutation => 
            mutation.type === 'childList' && 
            (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
        );
        
        if (tabCountChanged) {
            console.log('تم تغيير عدد الألسنة');
            setTimeout(() => {
                ensureReminderButtonExists();
            }, 300);
        }
    });
    
    // بدء المراقبة مع تتبع التغييرات في الأبناء والخصائص
    tabObserver.observe(tabContainer, {
        childList: true,      // مراقبة التغييرات في الأبناء (إضافة/إزالة ألسنة)
        subtree: true,        // مراقبة التغييرات في شجرة DOM
        attributes: true,     // مراقبة تغييرات الخصائص مثل تغيير الصنف النشط
        attributeFilter: ['class'] // فقط خاصية الصنف
    });
    
    console.log('تم تهيئة مراقب الألسنة');
}

/**
 * التأكد من وجود زر التذكير في اللسان الحالي
 */
function ensureReminderButtonExists() {
    // التحقق من عرض صفحة المتصفح
    if (document.visibilityState !== 'visible') return;
    
    // العثور على الحاويات المحتملة لزر التذكير
    const containers = [
        // الحاوية الأساسية في الواجهة
        document.querySelector('.ToolbarContainer'),
        document.querySelector('#MenuBar'),
        document.querySelector('.MenuBarContainer'),
        
        // البحث في كل إطار iframe محتمل
        ...Array.from(document.querySelectorAll('iframe')).map(iframe => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                return [
                    doc.querySelector('.ToolbarContainer'),
                    doc.querySelector('#MenuBar'),
                    doc.querySelector('.MenuBarContainer')
                ];
            } catch (e) {
                return [];
            }
        }).flat()
    ].filter(Boolean); // إزالة القيم الفارغة
    
    let buttonFound = false;
    
    // التحقق من وجود الزر في أي من الحاويات
    for (const container of containers) {
        if (container) {
            const reminderButton = container.querySelector('#6787') || 
                                findButtonById('6787', container.ownerDocument);
            
            if (reminderButton) {
                buttonFound = true;
                break;
            }
        }
    }
    
    // إذا لم يتم العثور على الزر، أضفه
    if (!buttonFound) {
        console.log('لم يتم العثور على زر التذكير، جاري إضافته...');
        addReminderButton();
    }
    
    // تحديث شارة عدد التذكيرات بعد إضافة الزر
    updateReminderBadge();
}

/**
 * إعادة تهيئة مراقب الألسنة عند تغيير صفحة
 */
function resetTabObserver() {
    if (tabObserver) {
        tabObserver.disconnect();
        tabObserver = null;
    }
    
    setupTabObserver();
    ensureReminderButtonExists();
}

// تصدير الدوال لاستخدامها في الملفات الأخرى
window.setupTabObserver = setupTabObserver;
window.ensureReminderButtonExists = ensureReminderButtonExists;
window.resetTabObserver = resetTabObserver;
