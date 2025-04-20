/**
 * معالج البيانات - المسؤول عن البحث واستخراج وتنظيم البيانات
 */

const dataHandler = {
  s: false, // حالة البحث
  c: false, // حالة الإلغاء
  
  /**
   * تنفيذ البحث عن المعاملات
   */
  async search() {
    // التحقق من أن البحث ليس جارياً بالفعل
    if (this.s) {
      this.c = true;
      return;
    }
    
    // تحليل أرقام المعاملات من حقل الإدخال
    let nums = ui.e.inp.value.split(" ").map(n => n.trim()).filter(n => n);
    if (!nums.length) {
      ui.e.res.innerHTML = '<div class="error">⚠️ الرجاء إدخال رقم واحد على الأقل.</div>';
      ui.e.copy.classList.remove("active");
      return;
    }
    
    // تهيئة حالة البحث
    this.s = true;
    this.c = false;
    ui.e.search.classList.add("searching");
    ui.e.search.textContent = "🛑 إيقاف البحث";
    ui.e.res.innerHTML = "";
    ui.e.copy.classList.remove("active");
    ui.e.progressContainer.style.display = "block";
    ui.e.progressBar.style.width = "100%";
    ui.e.progressText.textContent = "جاري البحث ...";
    
    // إحصائيات البحث
    let sc = 0,
        total = nums.length,
        startTime = Date.now();
    
    // البحث عن كل رقم معاملة
    for (let i = 0; i < total; i++) {
      let num = nums[i];
      
      // التحقق من طلب الإلغاء
      if (this.c) {
        ui.e.res.innerHTML += '<div class="error">⚠️ تم إيقاف البحث</div>';
        break;
      }
      
      // إضافة مؤشر تحميل للمعاملة الحالية
      ui.e.res.innerHTML += `
        <div class="transaction-item loading" id="tx-${num}">
          <div class="transaction-header"><span class="animated-hourglass">⏳</span> رقم المعاملة: ${num}</div>
          <div class="transaction-detail">
            <span class="detail-value">جاري البحث...</span>
          </div>
        </div>
      `;
      ui.e.res.scrollTop = ui.e.res.scrollHeight;
      
      try {
        // جلب بيانات المعاملة
        let { responseText } = await fetchTransaction(num);
        
        // التحقق من طلب الإلغاء مرة أخرى بعد الانتظار
        if (this.c) {
          document.getElementById(`tx-${num}`).outerHTML = `
            <div class="transaction-item error">
              <div class="transaction-header">❌ رقم المعاملة: ${num}</div>
              <div class="transaction-detail">
                <span class="detail-value">تم إلغاء البحث</span>
              </div>
            </div>`;
          continue;
        }
        
        // معالجة البيانات المستلمة
        let res = this.process(responseText, num);
        
        // تحديث واجهة المستخدم بالنتائج
        document.getElementById(`tx-${num}`).outerHTML = res.success
          ? `<div class="transaction-item success">
              <div class="transaction-header">
                ${res.data.docIcon} رقم المعاملة: <span class="transaction-number" style="text-decoration: underline; cursor: pointer; color: #0066cc;" onclick="window.open('${res.data.pdfUrl}','_blank')">${res.data.transactionNumber}</span>
              </div>
              <div class="transaction-details">
                <div class="transaction-detail">
                  <span class="detail-label">محالة إلى:</span>
                  <span class="detail-value">${res.data.recipientInfo}</span>
                </div>
                <div class="transaction-detail">
                  <span class="detail-label">التوجيه:</span>
                  <span class="detail-value">${res.data.directionInfo}</span>
                </div>
                <div class="transaction-detail">
                  <span class="detail-label">الإجراء:</span>
                  <span class="detail-value">${res.data.lastProcedureInfo}</span>
                </div>
                <div class="transaction-detail">
                  <span class="detail-label">التاريخ:</span>
                  <span class="detail-value">${res.data.dateInfo}</span>
                </div>
                <div class="transaction-detail">
                  <span class="detail-label">المدة:</span>
                  <span class="detail-value">${res.data.duration === 0 ? 'اليوم' : res.data.duration}</span>
                </div>
              </div>
            </div>`
          : `<div class="transaction-item error">
              <div class="transaction-header">❌ رقم المعاملة: ${num}</div>
              <div class="transaction-detail">
                <span class="detail-value">لم يتم العثور على بيانات كافية</span>
              </div>
            </div>`;
        
        // زيادة عداد النجاح
        if (res.success) sc++;
      } catch (e) {
        // معالجة حالة الخطأ
        let el = document.getElementById(`tx-${num}`);
        el.outerHTML = this.c
          ? `<div class="transaction-item error">
              <div class="transaction-header">❌ رقم المعاملة: ${num}</div>
              <div class="transaction-detail">
                <span class="detail-value">تم إلغاء البحث</span>
              </div>
            </div>`
          : `<div class="transaction-item error">
              <div class="transaction-header">❌ رقم المعاملة: ${num}</div>
              <div class="transaction-detail">
                <span class="detail-value">فشل في جلب البيانات</span>
              </div>
            </div>`;
      }
      
      // تحديث شريط التقدم
      ui.e.res.scrollTop = ui.e.res.scrollHeight;
      let processed = i + 1;
      let percentRemaining = ((total - processed) / total) * 100;
      ui.e.progressBar.style.width = percentRemaining + "%";
      
      // حساب الوقت المتبقي
      let elapsed = Date.now() - startTime;
      let avg = elapsed / processed;
      let remaining = avg * (total - processed);
      let seconds = Math.round(remaining / 1000);
      ui.e.progressText.textContent = seconds > 0
        ? `باقي ~${seconds} ثواني لإنهاء البحث`
        : "جاري إنهاء البحث...";
    }
    
    // إعادة ضبط حالة البحث
    this.s = false;
    ui.e.search.classList.remove("searching");
    ui.e.search.textContent = "🔍 بحث المعاملات";
    ui.e.progressBar.style.width = "0%";
    ui.e.progressContainer.style.display = "none";
    
    // تفعيل زر النسخ إذا كان هناك نتائج ناجحة
    if (sc > 0) ui.e.copy.classList.add("active");
  },
  
  /**
   * معالجة نص HTML للمعاملة واستخراج البيانات
   * @param {string} html - نص HTML المستلم
   * @param {string} num - رقم المعاملة
   * @returns {object} - نتيجة المعالجة
   */
  process(html, num) {
    const d = new DOMParser().parseFromString(html, "text/html"),
      rows = [...d.querySelectorAll('div[style*="border: 1px solid #000000"]')];
    
    if (rows.length < 5) return { success: false, data: { transactionNumber: num } };

    // استخراج البيانات الرئيسية
    let rec = rows[rows.length - 2]?.textContent.trim() || "غير متوفر",
        dir = rows[rows.length - 5]?.textContent.trim() || "-",
        proc = [...d.querySelectorAll('div[style*="left:192px"][style*="border: 1px solid #000000"]')],
        last = proc.length ? proc[proc.length - 1].textContent.trim() : "غير متوفر",
        dt = this.extractDate(d);

    // البحث عن نوع الوثيقة (أصل أو صورة) بناءً على آخر عنصر فقط
    let docType = "غير محدد";
    let docIcon = "✅"; // الأيقونة الافتراضية

    const docIndicators = [...d.querySelectorAll('div[style*="border: 1px solid #000000"]')]
    .filter(div => {
        const t = div.textContent.trim();
        return t === "أصل" || t === "صورة";
    });

    if (docIndicators.length) {
        const last = docIndicators[docIndicators.length - 1].textContent.trim();
        if (last === "أصل") {
            docType = "أصل";
            docIcon = "📜";
        } else if (last === "صورة") {
            docType = "صورة";
            docIcon = "📝";
        }
    }

    // رابط PDF
    const pdf = createPdfLink(num);

    // حساب المدة بناءً على التاريخ الهجري
    let duration = "غير متوفر";
    if (dt !== "غير متوفر") {
      duration = calculateHijriDuration(dt);
    }

    return {
      success: true,
      data: {
        transactionNumber: num,
        recipientInfo: rec,
        directionInfo: dir,
        lastProcedureInfo: last,
        dateInfo: dt,
        duration: duration,
        pdfUrl: pdf,
        docType: docType,
        docIcon: docIcon
      }
    };
  },
  
  /**
   * استخراج التاريخ من نص HTML
   * @param {Document} d - كائن Document المحتوي على HTML المعاملة
   * @returns {string} - التاريخ الهجري المستخرج
   */
  extractDate(d) {
    let dt = "غير متوفر";
    let ds = [...d.querySelectorAll(
      'div[style*="left:672px"][style*="border-left: 1px solid #000000"]' +
      '[style*="border-right: 1px solid #000000"][style*="border-top: 1px solid #000000"]'
    )].filter(el => {
      let s = el.querySelector("span span span");
      return s && s.textContent.includes("-") && !s.textContent.includes(":");
    });
    
    if (ds.length) {
      let full = ds[ds.length - 1].querySelector("span span span")?.textContent.trim() || "غير متوفر";
      let hijriDate = utils.cE(full); // تحويل الأرقام من العربية إلى الإنجليزية
      
      // إعادة التنسيق إلى الشكل المطلوب (YYYY/MM/DD)
      let parts = hijriDate.split(/[-/]/).map(s => s.padStart(2, '0'));
      if (parts.length >= 3) {
        dt = `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
    }
    
    return dt;
  },
  
  /**
   * جمع النتائج بصيغة مناسبة للإكسل
   * @returns {string} - النص المجمع
   */
  collect() {
    // صياغة البيانات بتنسيق يدعم الروابط في الإكسل
    return Array.from(document.querySelectorAll(".transaction-item.success"))
      .map(item => {
        const header = item.querySelector(".transaction-header");
        const num = header.querySelector(".transaction-number").textContent.trim();
        const pdfUrl = header.querySelector(".transaction-number").getAttribute("onclick").match(/'([^']+)'/)[1];
        const d = [...item.querySelectorAll(".transaction-detail")];

        // صيغة رابط الإكسل (HYPERLINK)
        const excelLink = `=HYPERLINK("${pdfUrl}";"${num}")`;

        // التصدير بترتيب محدد للأعمدة
        return `${excelLink}\t${d[0].querySelector(".detail-value").textContent.trim()}\t${utils.cE(d[3].querySelector(".detail-value").textContent.trim())}\t${d[2].querySelector(".detail-value").textContent.trim()}\t${d[1].querySelector(".detail-value").textContent.trim()}\t${d[4].querySelector(".detail-value").textContent.trim()}`;
      })
      .join("\n");
  }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = dataHandler;
}
