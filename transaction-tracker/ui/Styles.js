/**
 * مجموعة دوال مساعدة للتعامل مع النصوص
 */

const utils = {
  /**
   * تحويل الأرقام من العربية والفارسية إلى الإنجليزية
   * @param {string} s - النص المراد تحويله
   * @returns {string} - النص بعد التحويل
   */
  cE: s => {
    if (!s || s === "غير متوفر") return s;
    return s.replace(/[٠-٩۰-۹]/g, m => {
      const map = {
        "٠": "0", "۰": "0", "١": "1", "۱": "1", "٢": "2", "۲": "2",
        "٣": "3", "۳": "3", "٤": "4", "۴": "4", "٥": "5", "۵": "5",
        "٦": "6", "۶": "6", "٧": "7", "۷": "7", "٨": "8", "۸": "8",
        "٩": "9", "۹": "9"
      };
      return map[m] || m;
    });
  },
  
  /**
   * نسخ النص إلى الحافظة
   * @param {string} t - النص المراد نسخه
   * @param {HTMLElement} fb - عنصر لإظهار تأكيد النسخ
   */
  copy: (t, fb) => {
    try {
      let ta = document.createElement("textarea");
      ta.value = t;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      fb.style.display = "block";
      setTimeout(() => { fb.style.display = "none"; }, 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = utils;
}
