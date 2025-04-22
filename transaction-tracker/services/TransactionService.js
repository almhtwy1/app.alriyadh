/**
 * خدمة جلب بيانات المعاملات عبر طلبات HTTP
 */

/**
 * جلب بيانات المعاملة من الخادم
 * @param {string} num - رقم المعاملة
 * @returns {Promise<object>} - كائن يحتوي على بيانات الاستجابة
 */
function fetchTransaction(num) {
  // تجربة عدة سنوات هجرية لدعم المعاملات القديمة
  return fetchWithYears(num, [1446, 1445, 1444, 1443, 1442, 1441, 1440]);
}

/**
 * محاولة جلب بيانات المعاملة باستخدام عدة سنوات هجرية
 * @param {string} num - رقم المعاملة
 * @param {Array<number>} years - مصفوفة السنوات الهجرية المراد تجربتها
 * @returns {Promise<object>} - كائن يحتوي على بيانات الاستجابة
 */
async function fetchWithYears(num, years) {
  // ابدأ بالسنة الأولى
  let year = years[0];
  
  try {
    // محاولة جلب البيانات باستخدام السنة الحالية
    const url = createTransactionUrl(num, year);
    const response = await sendRequest(url);
    
    // إذا كانت هناك بيانات في الاستجابة، قم بإرجاعها
    if (response.responseText && response.responseText.includes("محالة إلى")) {
      console.log(`تم العثور على بيانات المعاملة ${num} في السنة الهجرية ${year}`);
      return response;
    }
    
    // إذا لم يتم العثور على بيانات وهناك سنوات إضافية للتجربة
    if (years.length > 1) {
      console.log(`لا توجد بيانات كافية للمعاملة ${num} في السنة الهجرية ${year}، تجربة السنة التالية...`);
      return fetchWithYears(num, years.slice(1));
    }
    
    // إذا تم تجربة جميع السنوات ولم يتم العثور على بيانات
    return response;
  } catch (error) {
    // إذا حدث خطأ وهناك سنوات إضافية للتجربة
    if (years.length > 1) {
      console.log(`حدث خطأ أثناء جلب بيانات المعاملة ${num} في السنة الهجرية ${year}، تجربة السنة التالية...`);
      return fetchWithYears(num, years.slice(1));
    }
    
    // إذا تم تجربة جميع السنوات وحدث خطأ
    throw error;
  }
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
  // بالنسبة لروابط PDF، سنستخدم سنة 1446 كافتراضية
  // وإذا لم تجد المعاملة، فسيتعين على المستخدم تغيير ذلك يدويًا
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
