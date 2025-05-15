/**
 * وحدة واجهة المستخدم - مسؤولة عن إنشاء وإدارة عناصر واجهة المستخدم
 */
const UI = (() => {
    'use strict';
    
    /**
     * إنشاء زر التحليل في واجهة المستخدم
     */
    function createAnalysisButton() {
        // التحقق من وجود شريط الأزرار
        const buttonContainer = document.querySelector('.d-flex.justify-content-center.align-items-center.gap-2');
        if (!buttonContainer) return;

        // إنشاء الزر الجديد
        const analyzeButton = document.createElement('button');
        analyzeButton.type = 'button';
        analyzeButton.className = 'mx-2 v-btn v-btn--is-elevated v-btn--fab v-btn--has-bg v-btn--round theme--dark v-size--small primary';
        analyzeButton.setAttribute('aria-haspopup', 'true');
        analyzeButton.setAttribute('aria-expanded', 'false');
        analyzeButton.innerHTML = `
            <span class="v-btn__content">
                <i aria-hidden="true" class="v-icon notranslate mdi mdi-chart-bar theme--dark"></i>
            </span>
        `;

        // إضافة أداة تلميح (tooltip) للزر
        const tooltip = document.createElement('span');
        tooltip.className = 'v-tooltip v-tooltip--bottom';

        // إضافة التلميح النصي (سيظهر عند التمرير بالماوس فوق الزر)
        const tooltipInner = document.createElement('div');
        tooltipInner.className = 'v-tooltip__content';
        tooltipInner.textContent = 'تحليل الحضور والإجازات';
        tooltipInner.style.display = 'none';
        tooltip.appendChild(tooltipInner);

        // إضافة الزر إلى شريط الأزرار
        buttonContainer.appendChild(analyzeButton);
        buttonContainer.appendChild(tooltip);

        // إضافة حدث النقر للزر
        analyzeButton.addEventListener('click', function() {
            // تنفيذ التحليل عند النقر على الزر
            Analyzer.analyzeAttendance();
        });

        // إظهار وإخفاء التلميح عند التمرير بالماوس
        analyzeButton.addEventListener('mouseenter', function() {
            tooltipInner.style.display = 'block';
        });
        analyzeButton.addEventListener('mouseleave', function() {
            tooltipInner.style.display = 'none';
        });
    }
    
    // كشف الواجهات العامة
    return {
        createAnalysisButton
    };
})();
