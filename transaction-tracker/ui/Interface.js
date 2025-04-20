/**
 * واجهة المستخدم - مسؤولة عن إنشاء وإدارة العناصر المرئية
 */

const ui = {
  m: true, // متغير لتتبع حالة التصغير
  e: {}, // للاحتفاظ بمراجع عناصر الواجهة
  icon: null, // أيقونة التصغير
  
  /**
   * تهيئة واجهة المستخدم
   */
  init() {
    const c = document.createElement("div");
    c.className = "ct-container";
    c.innerHTML = `
      <div class="ct-header">
        <h3 class="ct-title">تتبع أرقام المعاملات الشامل</h3>
        <button class="ct-minimize-btn">—</button>
      </div>
      <input type="text" class="ct-input" placeholder="🔢 أدخل أرقام المعاملات (مفصولة بمسافة)">
      <button class="ct-button">🔍 بحث المعاملات</button>
      <div class="ct-result">⚡️ لم يتم البحث بعد</div>
      <button class="ct-copy-button">📋 نسخ النتائج للإكسل</button>
      <div class="ct-progress-container">
        <div class="ct-progress-bar">
          <span class="ct-progress-text"></span>
        </div>
      </div>
      <div class="copy-feedback">✅ تم نسخ النتائج بنجاح</div>
    `;
    document.body.appendChild(c);
    
    // تخزين مراجع العناصر للوصول السريع لاحقًا
    this.e = {
      cont: c,
      minBtn: c.querySelector(".ct-minimize-btn"),
      inp: c.querySelector(".ct-input"),
      search: c.querySelector(".ct-button"),
      res: c.querySelector(".ct-result"),
      copy: c.querySelector(".ct-copy-button"),
      progressContainer: c.querySelector(".ct-progress-container"),
      progressBar: c.querySelector(".ct-progress-bar"),
      progressText: c.querySelector(".ct-progress-text"),
      fb: c.querySelector(".copy-feedback")
    };
    
    // إنشاء أيقونة التصغير
    let icon = document.createElement("div");
    icon.className = "ct-minimized-icon";
    icon.textContent = "🔍";
    document.body.appendChild(icon);
    this.icon = icon;
    
    // إضافة مستمعات الأحداث
    this.addL();
    
    // تطبيق الحالة الافتراضية (مصغر)
    this.apply();
  },
  
  /**
   * إضافة مستمعات الأحداث للعناصر
   */
  addL() {
    this.e.search.addEventListener("click", () => { dataHandler.search(); });
    this.e.inp.addEventListener("keypress", e => { if (e.key === "Enter") dataHandler.search(); });
    this.e.copy.addEventListener("click", () => {
      let t = dataHandler.collect();
      if (t) utils.copy(t, this.e.fb);
    });
    this.e.minBtn.addEventListener("click", () => { this.toggle(); });
    this.icon.addEventListener("click", () => { this.toggle(); });
  },
  
  /**
   * التبديل بين حالتي التصغير والتكبير
   */
  toggle() {
    if (this.m) {
      this.e.cont.style.display = "block";
      this.icon.style.display = "none";
    } else {
      this.e.cont.style.display = "none";
      this.icon.style.display = "block";
    }
    this.m = !this.m;
  },
  
  /**
   * تكبير النافذة والتركيز على حقل الإدخال
   */
  maximize() {
    if (this.m) this.toggle();
    this.e.inp.focus();
  },
  
  /**
   * تطبيق الحالة الافتراضية
   */
  apply() {
    this.e.cont.style.display = "none";
    this.icon.style.display = "block";
  }
};

// تصدير الكائن للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ui;
}
