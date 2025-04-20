// ==UserScript==
// @name         متتبع المعاملات الشامل - معلومات المعاملة والتوجيه والتاريخ وآخر الإجراءات
// @namespace    http://tampermonkey.net/
// @version      5.7.9
// @description  تحسين عرض البيانات بشكل احترافي مع ترتيبها وعرض مدة المعاملة بحيث إذا كانت 0 تُستبدل بكلمة "اليوم"، 1 تُستبدل بـ"أمس"، وأي رقم آخر يظهر كما هو، مع ترتيب بيانات النسخ للإكسل. كما تم تعديل حساب الأيام بحيث يتجاوز مشكلة اختلاف التوقيت. يمكن فتح المعاملة بالضغط على رقمها في الإكسل.
// @author       You
// @match        http://rasel/CTS/CTSC*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @compatible   chrome,firefox,edge
// @require      https://raw.githubusercontent.com/almhtwy1/transaction-tracker/main/core/DateConverter.js
// @require      https://raw.githubusercontent.com/almhtwy1/transaction-tracker/main/utils/StringUtils.js
// @require      https://raw.githubusercontent.com/almhtwy1/transaction-tracker/main/ui/Interface.js
// @require      https://raw.githubusercontent.com/almhtwy1/transaction-tracker/main/ui/Styles.js
// @require      https://raw.githubusercontent.com/almhtwy1/transaction-tracker/main/features/DataHandler.js
// @require      https://raw.githubusercontent.com/almhtwy1/transaction-tracker/main/services/TransactionService.js
// ==/UserScript==

(function () {
  "use strict";
  
  // تهيئة الأنماط
  addGlobalStyles();
  
  // تهيئة واجهة المستخدم
  ui.init();
  
  // استدعاء الوظائف عند تحميل الصفحة
  window.addEventListener("keydown", e => {
    if (e.altKey && (e.code === "KeyF" || e.key.toLowerCase() === "f")) {
      ui.maximize();
      e.preventDefault();
    }
    if ((e.key === "Escape" || e.key === "Esc") && !ui.m) {
      ui.toggle();
      e.preventDefault();
    }
  }, true);
})();
