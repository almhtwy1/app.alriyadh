// ==UserScript==
// @name         تحليل الحضور والإجازات
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  إضافة زر لتحليل الحضور والإجازات مع إحصائيات مفصلة
// @author       almhtwy1
// @match        https://intranetapps/Attendance/Search*
// @grant        none
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/refs/heads/main/attendance-analyzer/UI.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/refs/heads/main/attendance-analyzer/analyzer.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/refs/heads/main/attendance-analyzer/helpers.js
// @require      https://raw.githubusercontent.com/almhtwy1/app.alriyadh/refs/heads/main/attendance-analyzer/renderer.js
// ==/UserScript==

(function() {
    'use strict';
    
    // انتظار حتى تحميل صفحة الويب
    window.addEventListener('load', function() {
        // إنشاء الزر عند تحميل الصفحة
        UI.createAnalysisButton();
    });
})();
