// دالة لتقليل عدد مرات تنفيذ الدالة
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

// دالة لتأخير تنفيذ الدالة حتى يتوقف المستخدم عن الاستدعاء
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function findButton(text) {
    const elements = document.querySelectorAll('li a span');
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].textContent.trim() === text) {
            return elements[i].closest('li');
        }
    }
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
        try {
            const doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            const frameElements = doc.querySelectorAll('li a span');
            for (let j = 0; j < frameElements.length; j++) {
                if (frameElements[j].textContent.trim() === text) {
                    return frameElements[j].closest('li');
                }
            }
        } catch (e) {
            console.error('خطأ في الوصول إلى الإطار:', e);
        }
    }
    return null;
}

function findButtonById(id, specificDoc) {
    if (specificDoc) {
        return specificDoc.getElementById(id);
    }
    const btnInDoc = document.getElementById(id);
    if (btnInDoc) return btnInDoc;
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
        try {
            const doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            const btnInFrame = doc.getElementById(id);
            if (btnInFrame) return btnInFrame;
        } catch (e) {
            console.error('خطأ في الوصول إلى الإطار:', e);
        }
    }
    return null;
}

function findSelectedRows() {
    const selectedRows = [];
    document.querySelectorAll('tr.selected').forEach(row => {
        selectedRows.push(row);
    });
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
        try {
            const doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            doc.querySelectorAll('tr.selected').forEach(row => {
                selectedRows.push(row);
            });
        } catch (e) {
            console.error('خطأ في الوصول إلى الإطار للصفوف المحددة:', e);
        }
    }
    return selectedRows;
}

// استخدام ذاكرة التخزين المؤقت للجداول
let cachedTables = null;
let lastTableCheck = 0;
const TABLE_CACHE_TTL = 5000; // مدة صلاحية الذاكرة المؤقتة بالمللي ثانية

function findTables() {
    const now = Date.now();
    if (cachedTables && now - lastTableCheck < TABLE_CACHE_TTL) {
        return cachedTables;
    }
    
    const tables = [];
    const docTables = document.querySelectorAll('table.dataTable');
    if (docTables.length) tables.push(...Array.from(docTables));
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
        try {
            const doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            const frameTables = doc.querySelectorAll('table.dataTable');
            if (frameTables.length) tables.push(...Array.from(frameTables));
        } catch (e) {
            console.error('خطأ في الوصول إلى جداول الإطار:', e);
        }
    }
    
    // تحديث الذاكرة المؤقتة
    cachedTables = tables;
    lastTableCheck = now;
    return tables;
}

function setupRowSelection() {
    // استخدام الذاكرة المؤقتة للحصول على الجداول
    const tables = findTables();
    let rowsSetup = 0;
    
    tables.forEach(table => {
        // تحسين الأداء عبر استخدام تقنية الكتلة
        const fragment = document.createDocumentFragment();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            if (!row.hasAttribute('data-row-select')) {
                row.setAttribute('data-row-select', 'true');
                row.addEventListener('click', function (e) {
                    if (e.detail > 1 || ['INPUT', 'A', 'I'].includes(e.target.tagName) || e.target.closest('a')) return;
                    // استخدام روابط أسرع للمتصفح
                    const allSelectedRows = table.querySelectorAll('tr.selected');
                    for (let i = 0; i < allSelectedRows.length; i++) {
                        allSelectedRows[i].classList.remove('selected');
                    }
                    this.classList.add('selected');
                });
                rowsSetup++;
            }
        });
        
        addStyles(table.ownerDocument);
    });
    
    // تحسين الأداء: نسجل فقط عدد الصفوف التي تم إعدادها للتتبع
    if (rowsSetup > 0) {
        console.log(`تم إعداد ${rowsSetup} صف للتحديد`);
    }
}

let stylesAdded = new WeakMap();

function addStyles(doc) {
    if (stylesAdded.has(doc)) return;
    
    const style = doc.createElement('style');
    style.id = 'row-select-styles';
    style.textContent = `
        tr.selected { background-color: #e3f2fd !important; }
        table.dataTable tbody tr:hover { cursor: pointer; }
    `;
    doc.head.appendChild(style);
    stylesAdded.set(doc, true);
}

function addGlobalStyles() {
    if (document.getElementById('reminder-global-styles')) return;
    
    const styleElem = document.createElement('style');
    styleElem.id = 'reminder-global-styles';
    styleElem.innerHTML = `
        #6787, .ReminderButton {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
        }
        tr.selected {
            background-color: #e3f2fd !important;
            border: 1px solid #2196F3 !important;
        }
        table.dataTable tbody tr:hover {
            background-color: #f1f8e9 !important;
            cursor: pointer;
        }
        .reminder-badge {
            margin-left: 5px;
            font-size: 12px;
            font-weight: bold;
            color: red;
            background-color: #ffebee;
            border-radius: 10px;
            padding: 2px 6px;
        }
    `;
    document.head.appendChild(styleElem);
    
    // استخدام WeakMap للإطارات المضافة
    const frameStylesAdded = new WeakMap();
    
    document.querySelectorAll('iframe').forEach(iframe => {
        try {
            const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!frameStylesAdded.has(frameDoc) && !frameDoc.getElementById('reminder-global-styles')) {
                const frameStyle = frameDoc.createElement('style');
                frameStyle.id = 'reminder-global-styles';
                frameStyle.innerHTML = styleElem.innerHTML;
                frameDoc.head.appendChild(frameStyle);
                frameStylesAdded.set(frameDoc, true);
            }
        } catch (e) {
            console.error('خطأ في إضافة الأنماط العامة للإطار:', e);
        }
    });
}
