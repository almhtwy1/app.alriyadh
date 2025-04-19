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
        } catch (e) {}
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
        } catch (e) {}
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
        } catch (e) {}
    }
    return selectedRows;
}

function findTables() {
    const tables = [];
    const docTables = document.querySelectorAll('table.dataTable');
    if (docTables.length) tables.push(...Array.from(docTables));
    const iframes = document.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
        try {
            const doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            const frameTables = doc.querySelectorAll('table.dataTable');
            if (frameTables.length) tables.push(...Array.from(frameTables));
        } catch (e) {}
    }
    return tables;
}

function setupRowSelection() {
    const tables = findTables();
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            if (!row.hasAttribute('data-row-select')) {
                row.setAttribute('data-row-select', 'true');
                row.addEventListener('click', function (e) {
                    if (e.detail > 1 || ['INPUT', 'A', 'I'].includes(e.target.tagName) || e.target.closest('a')) return;
                    table.querySelectorAll('tr.selected').forEach(r => r.classList.remove('selected'));
                    this.classList.add('selected');
                });
            }
        });
        addStyles(table.ownerDocument);
    });
}

function addStyles(doc) {
    if (doc.getElementById('row-select-styles')) return;
    const style = doc.createElement('style');
    style.id = 'row-select-styles';
    style.textContent = `
        tr.selected { background-color: #e3f2fd !important; }
        table.dataTable tbody tr:hover { cursor: pointer; }
    `;
    doc.head.appendChild(style);
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
    document.querySelectorAll('iframe').forEach(iframe => {
        try {
            const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!frameDoc.getElementById('reminder-global-styles')) {
                const frameStyle = frameDoc.createElement('style');
                frameStyle.id = 'reminder-global-styles';
                frameStyle.innerHTML = styleElem.innerHTML;
                frameDoc.head.appendChild(frameStyle);
            }
        } catch (e) {}
    });
}
