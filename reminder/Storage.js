const REMINDER_PREFIX = 'transaction_reminder_';
const REMINDER_LIST_KEY = 'reminder_list';
const REMINDER_COUNT_KEY = 'reminder_count';

function getActiveRemindersList() {
    try {
        const listJson = GM_getValue(REMINDER_LIST_KEY);
        if (listJson) {
            return JSON.parse(listJson);
        }
    } catch (e) {
        console.error('خطأ في قراءة قائمة التذكيرات:', e);
    }
    return [];
}

function saveReminder(reminderId, reminderData) {
    try {
        GM_setValue(reminderId, JSON.stringify(reminderData));
    } catch (e) {
        console.error('خطأ في حفظ التذكير:', e);
        throw e;
    }
}

function deleteReminder(reminderId) {
    try {
        GM_deleteValue(reminderId);
    } catch (e) {
        console.error('خطأ في حذف التذكير:', e);
    }
}

function updateReminderList(reminderList) {
    try {
        GM_setValue(REMINDER_LIST_KEY, JSON.stringify(reminderList));
    } catch (e) {
        console.error('خطأ في تحديث قائمة التذكيرات:', e);
    }
}

function incrementReminderCount() {
    try {
        let reminderCount = GM_getValue(REMINDER_COUNT_KEY, 0);
        reminderCount++;
        GM_setValue(REMINDER_COUNT_KEY, reminderCount);
        return reminderCount;
    } catch (e) {
        console.error('خطأ في زيادة عداد التذكيرات:', e);
        throw e;
    }
}

function getReminder(reminderId) {
    try {
        const reminderJson = GM_getValue(reminderId);
        if (reminderJson) {
            return JSON.parse(reminderJson);
        }
    } catch (e) {
        console.error('خطأ في قراءة التذكير:', e);
    }
    return null;
}
