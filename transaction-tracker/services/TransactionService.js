/**
 * خدمة جلب بيانات المعاملات عبر طلبات HTTP
 */

/**
 * كاش لتخزين السنة الهجرية المناسبة لكل معاملة تم العثور عليها
 * يساعد في تسريع عمليات البحث المتكررة
 */
const transactionYearCache = {};

/**
 * جلب بيانات المعاملة من الخادم
 * @param {string} num - رقم المعاملة
 * @returns {Promise<object>} - كائن يحتوي على بيانات الاستجابة
 */
function fetchTransaction(num) {
  // التحقق من وجود السنة في الكاش لتسريع البحث
  if (transactionYearCache[num]) {
    console.log(`استخدام السنة المخزنة للمعاملة ${num}: ${transactionYearCache[num]}`);
    const url = createTransactionUrl(num, transactionYearCache[num]);
    return sendRequest(url);
  }
  
  // استخدام السنة الأحدث أولاً ثم الانتقال للسنوات الأقدم - نحد من عدد السنوات للتسريع
  return fetchWithYears(num, [1446, 1445, 1444, 1443]);
}

/**
 * محاولة جلب بيانات المعاملة باستخدام عدة سنوات هجرية
 * @param {string} num - رقم المعاملة
 * @param {Array<number>} years - مصفوفة السنوات الهجرية المراد تجربتها
 * @returns {Promise<object>} - كائن يحتوي على بيانات الاستجابة
 */
async function fetchWithYears(num, years) {
  // محاولة إرسال طلبات متوازية للسنوات المختلفة للتسريع
  const requests = years.map(year => {
    return new Promise(async (resolve) => {
      try {
        const url = createTransactionUrl(num, year);
        const response = await sendRequest(url);
        
        // التحقق من وجود بيانات في الاستجابة
        if (response.responseText && 
            (response.responseText.includes("محالة إلى") || 
             response.responseText.includes("div style=\"border: 1px solid #000000"))) {
          // تخزين السنة الصحيحة في الكاش للاستخدام المستقبلي
          transactionYearCache[num] = year;
          console.log(`تم العثور على بيانات المعاملة ${num} في السنة الهجرية ${year}`);
          resolve({ found: true, response, year });
        } else {
          resolve({ found: false, response, year });
        }
      } catch (error) {
        resolve({ found: false, error, year });
      }
    });
  });
  
  // انتظار أول استجابة ناجحة
  const results = await Promise.all(requests);
  const successResult = results.find(r => r.found);
  
  if (successResult) {
    return successResult.response;
  }
  
  // إذا لم يتم العثور على أي نتائج، استخدم أول استجابة
  return results[0].response || { responseText: "" };
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
      timeout: 5000, // إضافة مهلة زمنية لتسريع الفشل
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
  // استخدام السنة المخزنة في الكاش للوصول إلى ملف PDF الصحيح
  const year = transactionYearCache[num] || 1446;
  
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
