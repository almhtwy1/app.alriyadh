let highestZIndex = 9999;
let popupOverlay = null;

function bringToFront(popupElement) {
    highestZIndex++;
    popupElement.style.zIndex = highestZIndex;
    
    // Si hay un overlay, también actualizamos su z-index
    if (popupOverlay) {
        popupOverlay.style.zIndex = highestZIndex - 1;
    }
}

function createOverlay() {
    if (popupOverlay) {
        document.body.removeChild(popupOverlay);
    }
    
    popupOverlay = document.createElement('div');
    popupOverlay.id = 'reminderPopupOverlay';
    popupOverlay.style.position = 'fixed';
    popupOverlay.style.top = '0';
    popupOverlay.style.left = '0';
    popupOverlay.style.width = '100%';
    popupOverlay.style.height = '100%';
    popupOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popupOverlay.style.zIndex = highestZIndex;
    popupOverlay.style.backdropFilter = 'blur(3px)';
    
    document.body.appendChild(popupOverlay);
    return popupOverlay;
}

function removeOverlay() {
    if (popupOverlay && popupOverlay.parentNode) {
        document.body.removeChild(popupOverlay);
        popupOverlay = null;
    }
}

function showUnifiedReminderPopup(showAll = false, showButtons = true) {
    try {
        const reminderList = getActiveRemindersList();
        const now = Date.now();
        let remindersToShow = showAll ? reminderList : reminderList.filter(r => now >= r.showAt);
        if (remindersToShow.length === 0) return;

        // Crear overlay antes de mostrar la ventana emergente
        createOverlay();
        highestZIndex++;

        let popupContainer = document.getElementById('unifiedReminderPopup');
        if (popupContainer) {
            document.body.removeChild(popupContainer);
        }

        popupContainer = document.createElement('div');
        popupContainer.id = 'unifiedReminderPopup';
        popupContainer.className = 'reminderPopupContainer';

        let tableRows = '';
        let headerText = 'تذكيرات المعاملات';
        let subtitleText = `إجمالي المعاملات: ${remindersToShow.reduce((sum, r) => sum + r.count, 0)}`;

        if (remindersToShow.length === 1) {
            const reminderItem = remindersToShow[0];
            const reminder = getReminder(reminderItem.id);
            if (!reminder) return;
            // تحويل الوقت المنقضي من مللي ثانية إلى أيام
            const daysPassed = Math.floor((now - reminder.createdAt) / (24 * 60 * 60 * 1000));
            const hoursPassed = Math.floor(((now - reminder.createdAt) % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

            if (!reminder.data || reminder.data.length === 0) return;

            headerText = 'تذكير بالمعاملات';
            subtitleText = `تم إنشاء هذا التذكير منذ ${daysPassed} يوم و ${hoursPassed} ساعة - عدد المعاملات: ${reminder.data.length}`;

            reminder.data.forEach((rowData, index) => {
                let transactionNumber = rowData.length > 0 ? rowData[0] : '';
                let subject = rowData.length > 1 ? rowData[1] : '';
                let toEmployee = rowData.length > 2 ? rowData[2] : '';  // بيانات الموظف
                let date = rowData.length > 3 ? rowData[3] : '';
                tableRows += `
                    <tr>
                        <td>
                            <button class="delete-row" data-reminder-id="${reminder.id}" data-index="${index}" title="حذف">×</button>
                        </td>
                        <td>${index + 1}</td>
                        <td>${transactionNumber}</td>
                        <td>${subject}</td>
                        <td>${toEmployee}</td>  <!-- عمود الموظف -->
                        <td>${formatDate(date)}</td>
                    </tr>
                `;
            });
        } else {
            remindersToShow.forEach((reminderItem, reminderIndex) => {
                const reminder = getReminder(reminderItem.id);
                if (!reminder) return;
                // تحويل الوقت المنقضي من مللي ثانية إلى أيام
                const daysPassed = Math.floor((now - reminder.createdAt) / (24 * 60 * 60 * 1000));
                const hoursPassed = Math.floor(((now - reminder.createdAt) % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

                if (!reminder.data || reminder.data.length === 0) return;

                tableRows += `
                    <tr class="reminder-group-header">
                        <td colspan="6">تذكير ${reminderIndex + 1} (منذ ${daysPassed} يوم و ${hoursPassed} ساعة)</td>  <!-- تعديل colspan إلى 6 -->
                    </tr>
                `;

                reminder.data.forEach((rowData, index) => {
                    let transactionNumber = rowData.length > 0 ? rowData[0] : '';
                    let subject = rowData.length > 1 ? rowData[1] : '';
                    let toEmployee = rowData.length > 2 ? rowData[2] : '';  // بيانات الموظف
                    let date = rowData.length > 3 ? rowData[3] : '';
                    tableRows += `
                        <tr>
                            <td>
                                <button class="delete-row" data-reminder-id="${reminder.id}" data-index="${index}" title="حذف">×</button>
                            </td>
                            <td>${index + 1}</td>
                            <td>${transactionNumber}</td>
                            <td>${subject}</td>
                            <td>${toEmployee}</td>  <!-- عمود الموظف -->
                            <td>${formatDate(date)}</td>
                        </tr>
                    `;
                });
            });
        }

        popupContainer.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <button class="close-popup-btn" title="إغلاق">×</button>
                    <h2>${headerText}</h2>
                    <div class="subtitle">${subtitleText}</div>
                </div>
                <div class="popup-body">
                    <table>
                        <thead>
                            <tr>
                                <th>حذف</th>
                                <th>#</th>
                                <th>المعاملة</th>
                                <th>الموضوع</th>
                                <th>الموظف</th>  <!-- عنوان عمود الموظف -->
                                <th>تاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
                <div class="popup-footer" style="${showButtons ? '' : 'display: none;'}">
                    <input type="number" min="1" placeholder="أيام" class="postponeInput" style="width: 60px; margin-right: 10px;" />
                    <button class="postponeBtn">تأجيل الكل</button>
                    <button class="closeAllBtn">إغلاق الكل</button>
                </div>
            </div>
        `;

        addPopupStyles();
        document.body.appendChild(popupContainer);
        popupContainer.style.top = '50%';
        popupContainer.style.left = '50%';
        popupContainer.style.transform = 'translate(-50%, -50%)';
        popupContainer.style.zIndex = highestZIndex;

        popupContainer.addEventListener('mousedown', function(e) {
            bringToFront(popupContainer);
        });

        popupContainer.querySelector('.close-popup-btn').addEventListener('click', () => {
            document.body.removeChild(popupContainer);
            removeOverlay();
        });

        popupContainer.querySelectorAll('.delete-row').forEach(btn => {
            btn.addEventListener('click', () => {
                const reminderId = btn.dataset.reminderId;
                const idx = parseInt(btn.dataset.index, 10);
                const reminder = getReminder(reminderId);
                if (!reminder) return;
                reminder.data.splice(idx, 1);
                let reminderList = getActiveRemindersList();
                if (reminder.data.length === 0) {
                    deleteReminder(reminderId);
                    reminderList = reminderList.filter(r => r.id !== reminderId);
                    updateReminderList(reminderList);
                } else {
                    saveReminder(reminderId, reminder);
                    reminderList = reminderList.map(r =>
                        r.id === reminderId
                        ? { id: r.id, count: reminder.data.length, showAt: r.showAt }
                        : r
                    );
                    updateReminderList(reminderList);
                }
                updateReminderBadge();
                document.body.removeChild(popupContainer);
                removeOverlay();
                if (showAll && reminderList.length > 0) {
                    showUnifiedReminderPopup(true, false);
                } else {
                    showUnifiedReminderPopup();
                }
            });
        });

        if (showButtons) {
            popupContainer.querySelector('.postponeBtn').addEventListener('click', () => {
                const postponeInput = popupContainer.querySelector('.postponeInput').value;
                let newDelay = parseInt(postponeInput, 10);
                if (isNaN(newDelay) || newDelay <= 0) {
                    alert("الرجاء إدخال رقم صحيح للأيام في مربع التأجيل.");
                    return;
                }
                remindersToShow.forEach(reminderItem => {
                    const reminder = getReminder(reminderItem.id);
                    if (!reminder) return;
                    reminder.createdAt = Date.now();
                    // تحويل الأيام إلى مللي ثانية
                    reminder.showAt = Date.now() + (newDelay * 24 * 60 * 60 * 1000);
                    saveReminder(reminderItem.id, reminder);
                    let reminderList = getActiveRemindersList().map(r =>
                        r.id === reminderItem.id
                        ? { id: r.id, count: r.count, showAt: reminder.showAt }
                        : r
                    );
                    updateReminderList(reminderList);
                    setTimeout(() => {
                        showUnifiedReminderPopup();
                    }, newDelay * 24 * 60 * 60 * 1000);
                });
                alert("تم تأجيل جميع التذكيرات.");
                document.body.removeChild(popupContainer);
                removeOverlay();
            });

            popupContainer.querySelector('.closeAllBtn').addEventListener('click', () => {
                remindersToShow.forEach(reminderItem => {
                    deleteReminder(reminderItem.id);
                });
                updateReminderList([]);
                updateReminderBadge();
                document.body.removeChild(popupContainer);
                removeOverlay();
            });
        }
        
        // Añadir evento de clic en el overlay para cerrar la ventana
        popupOverlay.addEventListener('click', function(e) {
            // Solo cerrar si se hace clic directamente en el overlay (no en sus hijos)
            if (e.target === popupOverlay) {
                document.body.removeChild(popupContainer);
                removeOverlay();
            }
        });
        
    } catch (e) {
        console.error('خطأ في عرض التذكيرات:', e);
        // Asegurar que se elimine el overlay en caso de error
        removeOverlay();
    }
}

function addPopupStyles() {
    if (document.getElementById('popupStyles')) return;
    const styleElement = document.createElement('style');
    styleElement.id = 'popupStyles';
    styleElement.textContent = `
        .reminderPopupContainer {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            direction: rtl;
            font-family: 'Droid Arabic Kufi', Arial, sans-serif;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            background: white;
            width: 900px;
            max-width: 95vw;
            max-height: 90vh;
            overflow: hidden;
        }
        .popup-content {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .popup-header {
            position: relative;
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            background: #fafafa;
        }
        .popup-header h2 {
            color: #D32F2F;
            margin: 0 0 5px 0;
            font-size: 22px;
        }
        .popup-header .subtitle {
            color: #555;
            font-size: 14px;
            font-weight: bold;
        }
        .popup-body {
            padding: 20px;
            overflow-y: auto;
            max-height: 70vh;
            flex-grow: 1;
        }
        .popup-footer {
            padding: 15px 20px;
            border-top: 1px solid #e0e0e0;
            text-align: left;
            background: #fafafa;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
            color: #333;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f0f0f0;
        }
        .reminder-group-header td {
            background-color: #e0e0e0;
            font-weight: bold;
            padding: 10px;
            border-top: 2px solid #ccc;
        }
        .closeAllBtn {
            background-color: #D32F2F;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-family: 'Droid Arabic Kufi', Arial, sans-serif;
            margin-right: 10px;
        }
        .postponeBtn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-family: 'Droid Arabic Kufi', Arial, sans-serif;
            margin-right: 10px;
        }
        .closeAllBtn:hover {
            background-color: #B71C1C;
        }
        .postponeBtn:hover {
            background-color: #45A049;
        }
        .delete-row {
            color: #D32F2F;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            display: inline-block;
            line-height: 1;
            width: 20px;
            height: 20px;
            text-align: center;
        }
        .delete-row:hover {
            color: #B71C1C;
        }
        .postponeInput {
            padding: 6px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-family: 'Droid Arabic Kufi', Arial, sans-serif;
        }
        .close-popup-btn {
            position: absolute;
            left: 10px;
            top: 10px;
            background: none;
            border: none;
            font-size: 24px;
            color: #D32F2F;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            width: 24px;
            height: 24px;
            text-align: center;
        }
        .close-popup-btn:hover {
            color: #B71C1C;
        }
    `;
    document.head.appendChild(styleElement);
}
