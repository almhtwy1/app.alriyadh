function setReminder() {
    const selectedRows = findSelectedRows();
    if (selectedRows.length === 0) {
        const reminderList = getActiveRemindersList();
        if (reminderList.length > 0) {
            showUnifiedReminderPopup(true, false);
            return;
        } else {
            alert('يرجى تحديد صف واحد أو أكثر من الجدول أولاً');
            return;
        }
    }
    let inputMinutes = prompt("أدخل عدد الدقائق للتذكير:");
    let minutesDelay = parseInt(inputMinutes, 10);
    if (isNaN(minutesDelay) || minutesDelay <= 0) {
        alert("الرجاء إدخال رقم صالح بالدقائق.");
        return;
    }
    const allRowsData = [];
    selectedRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const cellArray = Array.from(cells);
        let transactionNumber = '';
        let subject = '';
        let toEmployee = '';  // إضافة متغير للموظف
        let date = '';
        for (let i = 0; i < cellArray.length; i++) {
            const cell = cellArray[i];
            const cellText = cell.getAttribute('title') || cell.textContent.trim();
            if (i === 2) transactionNumber = cellText;
            else if (i === 3) subject = cellText;
            else if (i === 7) toEmployee = cellText;  // استخراج قيمة "إلى الموظف" من الخلية رقم 7
            else if (i === 10) date = cellText;
        }
        const rowData = [transactionNumber, subject, toEmployee, date];  // إضافة toEmployee إلى البيانات
        allRowsData.push(rowData);
    });
    try {
        const reminderCount = incrementReminderCount();
        const reminderId = REMINDER_PREFIX + reminderCount;
        const reminderTime = Date.now() + (minutesDelay * 60 * 1000);
        const reminderData = {
            id: reminderId,
            data: allRowsData,
            createdAt: Date.now(),
            showAt: reminderTime,
            delay: minutesDelay
        };
        saveReminder(reminderId, reminderData);
        let reminderList = getActiveRemindersList();
        reminderList.push({
            id: reminderId,
            count: allRowsData.length,
            showAt: reminderTime
        });
        updateReminderList(reminderList);
        alert(`تم حفظ التذكير لـ ${selectedRows.length} معاملة.\nسيتم التذكير بعد ${minutesDelay} دقائق.`);
        updateReminderBadge();
        setTimeout(() => {
            showUnifiedReminderPopup();
        }, minutesDelay * 60 * 1000);
    } catch (e) {
        console.error('خطأ في حفظ التذكير:', e);
        alert('حدث خطأ أثناء حفظ التذكير. يرجى المحاولة مرة أخرى.');
    }
}

function checkForReminders() {
    try {
        const now = Date.now();
        const reminderList = getActiveRemindersList();
        for (const reminder of reminderList) {
            if (now >= reminder.showAt) {
                showUnifiedReminderPopup();
            } else {
                const timeRemaining = reminder.showAt - now;
                setTimeout(() => {
                    showUnifiedReminderPopup();
                }, timeRemaining);
            }
        }
        updateReminderBadge();
    } catch (e) {
        console.error('خطأ في التحقق من التذكيرات:', e);
    }
}
