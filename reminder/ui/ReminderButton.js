function addReminderButton() {
    if (findButtonById('6787')) return;
    const toolbarContainer = document.querySelector('.ToolbarContainer') ||
          document.querySelector('#MenuBar') ||
          document.querySelector('.MenuBarContainer');
    if (!toolbarContainer) {
        const barcodeBtn = findButton('طباعة الباركود') || document.getElementById('6786');
        if (!barcodeBtn) return;
        const doc = barcodeBtn.ownerDocument;
        const newBtn = doc.createElement('li');
        newBtn.id = '6787';
        newBtn.innerHTML = `
            <a id="Anchor_6787" style="cursor: pointer;">
                <object data="apps/ctsc/images/Resources/Complete.svg" class="iconNoFloat" type="image/svg+xml">
                    <i id="imgli_6787" style="background-image:url('apps/ctsc/images/Resources/Complete.svg')" class="icon"></i>
                </object>
                <span>تذكير</span>
            </a>
        `;
        newBtn.addEventListener('click', function() {
            setReminder();
        });
        barcodeBtn.parentNode.insertBefore(newBtn, barcodeBtn.nextSibling);
        return;
    }
    const doc = toolbarContainer.ownerDocument;
    const menuList = toolbarContainer.querySelector('ul') || toolbarContainer;
    const newBtn = doc.createElement('li');
    newBtn.id = '6787';
    newBtn.className = 'ReminderButton';
    newBtn.style.display = 'inline-block';
    newBtn.innerHTML = `
        <a id="Anchor_6787" style="cursor: pointer;">
            <object data="apps/ctsc/images/Resources/Complete.svg" class="iconNoFloat" type="image/svg+xml">
                <i id="imgli_6787" style="background-image:url('apps/ctsc/images/Resources/Complete.svg')" class="icon"></i>
            </object>
            <span>تذكير</span>
        </a>
    `;
    newBtn.addEventListener('click', function() {
        setReminder();
    });
    const printBtn = findButton('طباعة') || findButton('طباعة الباركود');
    if (printBtn && printBtn.parentNode === menuList) {
        menuList.insertBefore(newBtn, printBtn.nextSibling);
    } else {
        menuList.appendChild(newBtn);
    }
    updateReminderBadge();
}

function updateReminderBadge() {
    let reminderList = getActiveRemindersList();
    let totalTransactions = reminderList.reduce((sum, reminder) => sum + reminder.count, 0);
    let btn = findButtonById('6787');
    if (btn) {
        let anchor = btn.querySelector('#Anchor_6787');
        if (anchor) {
            let textSpan = anchor.querySelector('span');
            if (textSpan) {
                let badge = textSpan.querySelector('.reminder-badge');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'reminder-badge';
                    textSpan.appendChild(badge);
                }
                if (totalTransactions > 0) {
                    badge.textContent = totalTransactions;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    }
}
