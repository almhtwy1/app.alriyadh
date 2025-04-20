// تخزين مراجع المراقبين للتنظيف لاحقاً
const observers = [];
let lastActiveTabId = '';
let tabsActivationTime = {};

function setupObserver() {
    // تنظيف المراقبين القديمة
    observers.forEach(obs => obs.disconnect());
    observers.length = 0;
    
    let debounceTimer;
    let lastAttempt = 0;
    
    const checkAndAddButton = () => {
        const now = Date.now();
        if (now - lastAttempt < 100) return;
        lastAttempt = now;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (!findButtonById('6787')) {
                addReminderButton();
            }
            setupRowSelection();
        }, 200);
    };

    // مراقبة المناطق المهمة فقط بدلاً من كامل DOM
    const toolbarContainer = document.querySelector('.ToolbarContainer') ||
          document.querySelector('#MenuBar') ||
          document.querySelector('.MenuBarContainer');
    
    if (toolbarContainer) {
        const toolbarObserver = new MutationObserver(checkAndAddButton);
        toolbarObserver.observe(toolbarContainer, {
            childList: true,
            subtree: true,
            attributes: false
        });
        observers.push(toolbarObserver);
    } else {
        // في حالة عدم وجود حاوية شريط الأدوات، نراقب العناصر العليا فقط
        const mainObserver = new MutationObserver(checkAndAddButton);
        mainObserver.observe(document.body, {
            childList: true,
            subtree: false,
            attributes: false
        });
        observers.push(mainObserver);
    }

    // مراقبة الجداول بشكل منفصل للأداء الأفضل
    const tables = findTables();
    tables.forEach(table => {
        const tableObserver = new MutationObserver(() => {
            if (document.visibilityState === 'visible') {
                setupRowSelection();
            }
        });
        tableObserver.observe(table, { 
            childList: true, 
            subtree: false,
            attributes: true,
            attributeFilter: ['class'] 
        });
        observers.push(tableObserver);
    });

    // إضافة مراقب خاص للألسنة
    setupTabsObserver();

    const setupIframeObservers = () => {
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                    if (!findButtonById('6787', iframe.contentDocument)) {
                        addReminderButton();
                    }
                    setupRowSelection();
                    try {
                        const frameDoc = iframe.contentDocument;
                        const frameToolbar = frameDoc.querySelector('.ToolbarContainer') ||
                                            frameDoc.querySelector('#MenuBar') ||
                                            frameDoc.querySelector('.MenuBarContainer');
                        
                        if (frameToolbar) {
                            const frameObserver = new MutationObserver(checkAndAddButton);
                            frameObserver.observe(frameToolbar, {
                                childList: true,
                                subtree: true,
                                attributes: false
                            });
                            observers.push(frameObserver);
                        }
                        
                        // مراقبة الجداول في الإطار
                        const frameTables = Array.from(frameDoc.querySelectorAll('table.dataTable'));
                        frameTables.forEach(table => {
                            const tableObserver = new MutationObserver(() => {
                                if (document.visibilityState === 'visible') {
                                    setupRowSelection();
                                }
                            });
                            tableObserver.observe(table, { 
                                childList: true, 
                                subtree: false,
                                attributes: true,
                                attributeFilter: ['class'] 
                            });
                            observers.push(tableObserver);
                        });
                    } catch (e) {
                        console.error('خطأ في إعداد مراقب الإطار:', e);
                    }
                }
                iframe.addEventListener('load', () => {
                    // تحديث مراقبي الإطارات عند تحميلها
                    if (!findButtonById('6787')) {
                        addReminderButton();
                    }
                    setupRowSelection();
                    
                    try {
                        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const frameToolbar = frameDoc.querySelector('.ToolbarContainer') ||
                                            frameDoc.querySelector('#MenuBar') ||
                                            frameDoc.querySelector('.MenuBarContainer');
                        
                        if (frameToolbar) {
                            const frameObserver = new MutationObserver(checkAndAddButton);
                            frameObserver.observe(frameToolbar, {
                                childList: true,
                                subtree: true,
                                attributes: false
                            });
                            observers.push(frameObserver);
                        }
                    } catch (e) {
                        console.error('خطأ في إعداد مراقب الإطار عند التحميل:', e);
                    }
                });
            } catch (e) {
                console.error('خطأ في الوصول إلى الإطار:', e);
            }
        });
    };
    
    setupIframeObservers();
    
    // استخدام وقت أطول لفحص الإطارات
    const iframeCheckInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            setupIframeObservers();
        }
    }, 3000);
    
    // تنظيف الفاصل الزمني عند الانتقال من الصفحة
    window.addEventListener('beforeunload', () => {
        clearInterval(iframeCheckInterval);
    });
}

// مراقبة خاصة لعنصر الألسنة
function setupTabsObserver() {
    const tabsContainer = document.querySelector('.chrometabs') || 
                         document.querySelector('.tab-container ul') ||
                         document.querySelector('#home_RightPanel_Menu');
    
    if (!tabsContainer) {
        console.log('لم يتم العثور على حاوية الألسنة');
        setTimeout(setupTabsObserver, 1000);
        return;
    }
    
    console.log('تم العثور على حاوية الألسنة:', tabsContainer);
    
    // احصل على اللسان النشط الحالي
    const activeTab = tabsContainer.querySelector('li.active');
    if (activeTab) {
        lastActiveTabId = activeTab.id || '';
        tabsActivationTime[lastActiveTabId] = Date.now();
        console.log('اللسان النشط الحالي:', lastActiveTabId);
    }
    
    // إنشاء مراقب لتغييرات الألسنة
    const tabsObserver = new MutationObserver((mutations) => {
        // تحقق من وجود تغييرات في الألسنة
        const hasTabChanges = mutations.some(mutation => {
            // تحقق من تغيير الصنف للمفاتيح (تبديل النشط)
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                mutation.target.nodeName === 'LI') {
                return true;
            }
            
            // تحقق من إضافة أو إزالة ألسنة
            if (mutation.type === 'childList' && 
                (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                return true;
            }
            
            return false;
        });
        
        if (hasTabChanges) {
            // تحقق من اللسان النشط الجديد
            const activeTab = tabsContainer.querySelector('li.active');
            if (activeTab && activeTab.id !== lastActiveTabId) {
                console.log('تم تغيير اللسان النشط من', lastActiveTabId, 'إلى', activeTab.id);
                lastActiveTabId = activeTab.id || '';
                tabsActivationTime[lastActiveTabId] = Date.now();
                
                // تأخير قصير لضمان اكتمال تحميل واجهة اللسان
                setTimeout(() => {
                    console.log('إضافة زر التذكير للسان الجديد');
                    if (!findButtonById('6787')) {
                        addReminderButton();
                    }
                    updateReminderBadge();
                }, 500);
            } else {
                // قد يكون هناك تغيير في عدد الألسنة
                console.log('تم العثور على تغييرات في الألسنة، جاري التحقق من وجود زر التذكير');
                setTimeout(() => {
                    if (!findButtonById('6787')) {
                        addReminderButton();
                    }
                    updateReminderBadge();
                }, 500);
            }
        }
    });
    
    // بدء المراقبة
    tabsObserver.observe(tabsContainer, {
        childList: true,      // مراقبة التغييرات في عدد الألسنة
        subtree: true,        // مراقبة العناصر الفرعية
        attributes: true,     // مراقبة تغييرات الخصائص
        attributeFilter: ['class']  // فقط مراقبة تغييرات الصنف
    });
    
    observers.push(tabsObserver);
    
    // مراقبة النقر على الألسنة
    tabsContainer.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('li');
        if (clickedTab) {
            console.log('تم النقر على لسان:', clickedTab.id);
            setTimeout(() => {
                if (!findButtonById('6787')) {
                    addReminderButton();
                }
                updateReminderBadge();
            }, 500);
        }
    });
    
    console.log('تم إعداد مراقب الألسنة بنجاح');
}

// إيجاد أزرار شريط الأدوات في اللسان النشط حالياً
function findActiveTabToolbar() {
    const activeTabId = document.querySelector('.chrometabs li.active')?.id;
    if (!activeTabId) return null;
    
    // البحث في الوثيقة الرئيسية
    let toolbar = document.querySelector('.ToolbarContainer') || 
                 document.querySelector('#MenuBar') ||
                 document.querySelector('.MenuBarContainer');
    
    if (toolbar) return toolbar;
    
    // البحث في الإطارات المرتبطة باللسان النشط
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
        try {
            const frameDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            toolbar = frameDoc.querySelector('.ToolbarContainer') || 
                     frameDoc.querySelector('#MenuBar') ||
                     frameDoc.querySelector('.MenuBarContainer');
            
            if (toolbar) return toolbar;
        } catch (e) {}
    }
    
    return null;
}
