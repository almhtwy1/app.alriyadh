// ==UserScript==
// @name         تحليل الحضور والإجازات
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  إضافة زر لتحليل الحضور والإجازات مع إحصائيات مفصلة
// @author       محمد مطلق القحطاني
// @match        https://intranetapps/Attendance/Search*
// @grant        none
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/attendance-analyzer/ui.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/attendance-analyzer/analyzer.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/attendance-analyzer/helpers.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/main/attendance-analyzer/renderer.js
// ==/UserScript==

(function() {
    'use strict';
    
    // انتظار حتى تحميل صفحة الويب
    window.addEventListener('load', function() {
        // إنشاء الزر عند تحميل الصفحة
        UI.createAnalysisButton();
    });
})();
