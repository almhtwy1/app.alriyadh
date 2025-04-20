// تخزين مراجع المراقبين للتنظيف لاحقاً
const observers = [];

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
