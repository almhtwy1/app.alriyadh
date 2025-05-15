// ==UserScript==
// @name         تحليل الحضور والإجازات
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  إضافة زر لتحليل الحضور والإجازات مع إحصائيات مفصلة
// @author       almhtwy1
// @match        https://intranetapps/Attendance/Search*
// @grant        none
// @require      https://raw.githubusercontent.com/almhtwy1/attendance-analyzer/main/ui.js
// @require      https://raw.githubusercontent.com/almhtwy1/attendance-analyzer/main/analyzer.js
// @require      https://raw.githubusercontent.com/almhtwy1/attendance-analyzer/main/helpers.js
// @require      https://raw.githubusercontent.com/almhtwy1/attendance-analyzer/main/renderer.js
// ==/UserScript==

(function() {
    'use strict';
    
    // انتظار حتى تحميل صفحة الويب
    window.addEventListener('load', function() {
        // إنشاء الزر عند تحميل الصفحة
        UI.createAnalysisButton();
    });
})();
