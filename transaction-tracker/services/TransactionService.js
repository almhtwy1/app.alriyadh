/**
 * خدمة جلب بيانات المعاملات عبر طلبات HTTP
 */

/**
 * جلب بيانات المعاملة من الخادم
 * @param {string} num - رقم المعاملة
 * @returns {Promise<object>} - كائن يحتوي على بيانات الاستجابة
 */
function fetchTransaction(num) {
  const url =
    `http://rasel/CTS/CTSC?C=showreport&UseFM=yes&output=html&SignatureInfo=false&UserInfo=false&ImagePath=false&code=VisualTrackingCorrReport` +
    `&paramNames=P_link,transferIds,folderIds,referenceNumber,folderYear,username,depName,fullName,currentHijriDate` +
    `&paramValues=/u02/oracle/config/applications/prdcts12/MOMRA02,undefined,21220582,${num},1446,95818,` +
    `%D9%88%D9%83%D9%8A%D9%84%20%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9%20%D9%84%D9%84%D8%AA%D8%B9%D9%85%D9%8A%D8%B1%20-` +
    `%D9%88%D9%83%D9%8A%D9%84%20%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9%20%D8%B4%D9%85%D8%A7%D9%84%20%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6,%D9%85%D8%AD%D9%85%D8%AF%20%D9%85%D8%B7%D9%84%D9%82%20%D8%AD%D9%85%D8%AF%20%D8%A7%D9%84%D9%82%D8%AD%D8%B7%D8%A7%D9%86%D9%8A,04/09/1446`;
  
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url,
      onload: resp => {
        if (resp.status >= 200 && resp.status < 300) {
          resolve({ responseText: resp.responseText });
        } else {
          reject(new Error(`خطأ: ${resp.status}`));
        }
      },
      onerror: () => reject(new Error("فشل الاتصال"))
    });
  });
}

/**
 * إنشاء رابط PDF للمعاملة
 * @param {string} num - رقم المعاملة
 * @returns {string} - رابط ملف PDF للمعاملة
 */
function createPdfLink(num) {
  return `http://rasel/CTS/CTSC?C=showreport&UseFM=yes&output=pdf&SignatureInfo=false&UserInfo=false&ImagePath=false&code=VisualTrackingCorrReport` +
        `&paramNames=P_link,transferIds,folderIds,referenceNumber,folderYear,username,depName,fullName,currentHijriDate` +
        `&paramValues=/u02/oracle/config/applications/prdcts12/MOMRA02,undefined,21220582,${num},1446,95818,` +
        `%D9%88%D9%83%D9%8A%D9%84%20%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9%20%D9%84%D9%84%D8%AA%D8%B9%D9%85%D9%8A%D8%B1%20-` +
        `%D9%88%D9%83%D9%8A%D9%84%20%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9%20%D8%B4%D9%85%D8%A7%D9%84%20%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6,%D9%85%D8%AD%D9%85%D8%AF%20%D9%85%D8%B7%D9%84%D9%82%20%D8%AD%D9%85%D8%AF%20%D8%A7%D9%84%D9%82%D8%AD%D8%B7%D8%A7%D9%86%D9%8A,04/09/1446`;
}

// تصدير الدوال للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchTransaction,
    createPdfLink
  };
}
