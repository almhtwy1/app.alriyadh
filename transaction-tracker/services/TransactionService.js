/**
 * خدمة جلب بيانات المعاملات عبر طلبات HTTP
 */

/**
 * جلب بيانات المعاملة من الخادم
 * @param {string} num - رقم المعاملة
 * @returns {Promise<object>} - كائن يحتوي على بيانات الاستجابة
 */
function fetchTransaction(num) {
  // استخراج السنة من رقم المعاملة
  const year = detectYearFromNumber(num);
  console.log(`تحديد السنة الهجرية ${year} للمعاملة ${num}`);
  
  // استخدم السنة المحددة للبحث
  const url = createTransactionUrl(num, year);
  return sendRequest(url);
}

/**
 * تحديد السنة الهجرية من رقم المعاملة
 * @param {string} num - رقم المعاملة
 * @returns {number} - السنة الهجرية المحددة
 */
function detectYearFromNumber(num) {
  // تنظيف رقم المعاملة للتأكد من أنه رقم فقط
  const cleanNum = String(num).replace(/\D/g, '');
  
  // استخراج أول رقمين من المعاملة (إذا وجد)
  if (cleanNum.length >= 2) {
    const prefix = cleanNum.substring(0, 2);
    
    // تحديد السنة بناءً على البادئة
    if (prefix === "46" || prefix === "47") return 1446;
    if (prefix === "45") return 1445;
    if (prefix === "44") return 1444;
    if (prefix === "43") return 1443;
    if (prefix === "42") return 1442;
    if (prefix === "41") return 1441;
    if (prefix === "40") return 1440;
    if (prefix === "39") return 1439;
    if (prefix === "38") return 1438;
    if (prefix === "37") return 1437;
    if (prefix === "36") return 1436;
    if (prefix === "35") return 1435;
    
    // للأرقام الأخرى التي قد تكون أقدم
    if (parseInt(prefix) < 35) return 1434;
  }
  
  // إذا لم يتم تحديد السنة، استخدم السنة الحالية كافتراضية
  return 1446;
}

/**
 * إنشاء رابط URL للمعاملة باستخدام سنة هجرية محددة
 * @param {string} num - رقم المعاملة
 * @param {number} year - السنة الهجرية
 * @returns {string} - رابط URL الكامل
 */
function createTransactionUrl(num, year) {
  return `http://rasel/CTS/CTSC?C=showreport&UseFM=yes&output=html&SignatureInfo=false&UserInfo=false&ImagePath=false&code=VisualTrackingCorrReport` +
        `&paramNames=P_link,transferIds,folderIds,referenceNumber,folderYear,username,depName,fullName,currentHijriDate` +
        `&paramValues=/u02/oracle/config/applications/prdcts12/MOMRA02,undefined,21220582,${num},${year},95818,` +
        `%D9%88%D9%83%D9%8A%D9%84%20%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9%20%D9%84%D9%84%D8%AA%D8%B9%D9%85%D9%8A%D8%B1%20-` +
        `%D9%88%D9%83%D9%8A%D9%84%20%D8%A7%D9%84%D8%A8%D9%84%D8%AF%D9%8A%D8%A9%20%D8%B4%D9%85%D8%A7%D9%84%20%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6,%D9%85%D8%AD%D9%85%D8%AF%20%D9%85%D8%B7%D9%84%D9%82%20%D8%AD%D9%85%D8%AF%20%D8%A7%D9%84%D9%82%D8%AD%D8%B7%D8%A7%D9%86%D9%8A,04/09/1446`;
}

/**
 * إرسال طلب HTTP وإرجاع وعد (Promise) بالاستجابة
 * @param {string} url - رابط URL للطلب
 * @returns {Promise<object>} - وعد بالاستجابة
 */
function sendRequest(url) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url,
      timeout: 15000, // مهلة زمنية أطول قليلاً (10 ثوانٍ)
      onload: resp => {
        if (resp.status >= 200 && resp.status < 300) {
          resolve({ responseText: resp.responseText });
        } else {
          reject(new Error(`خطأ: ${resp.status}`));
        }
      },
      onerror: () => reject(new Error("فشل الاتصال")),
      ontimeout: () => reject(new Error("انتهت المهلة الزمنية للطلب"))
    });
  });
}

/**
 * إنشاء رابط PDF للمعاملة
 * @param {string} num - رقم المعاملة
 * @returns {string} - رابط ملف PDF للمعاملة
 */
function createPdfLink(num) {
  // تحديد السنة من رقم المعاملة للحصول على PDF
  const year = detectYearFromNumber(num);
  
  return `http://rasel/CTS/CTSC?C=showreport&UseFM=yes&output=pdf&SignatureInfo=false&UserInfo=false&ImagePath=false&code=VisualTrackingCorrReport` +
        `&paramNames=P_link,transferIds,folderIds,referenceNumber,folderYear,username,depName,fullName,currentHijriDate` +
        `&paramValues=/u02/oracle/config/applications/prdcts12/MOMRA02,undefined,21220582,${num},${year},95818,` +
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
