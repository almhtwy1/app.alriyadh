/**
 * وحدة العرض - مسؤولة عن إنشاء وعرض واجهة النتائج
 */
const Renderer = (() => {
    'use strict';
    
    /**
     * إنشاء نافذة عرض النتائج
     * @param {Object} data - بيانات النتائج للعرض
     */
    function createResultWindow(data) {
        // إنشاء نافذة النتائج الرئيسية
        const resultWindow = document.createElement('div');
        resultWindow.style.position = 'fixed';
        resultWindow.style.top = '50%';
        resultWindow.style.left = '50%';
        resultWindow.style.transform = 'translate(-50%, -50%)';
        resultWindow.style.backgroundColor = '#fff';
        resultWindow.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        resultWindow.style.borderRadius = '12px';
        resultWindow.style.padding = '0'; // إزالة البادينغ
        resultWindow.style.zIndex = '9999';
        resultWindow.style.maxWidth = '650px';
        resultWindow.style.width = '90%';
        resultWindow.style.maxHeight = '85vh';
        resultWindow.style.overflow = 'hidden'; // منع السكرول للنافذة الرئيسية
        resultWindow.style.direction = 'rtl';
        resultWindow.style.textAlign = 'right';
        resultWindow.style.fontFamily = 'Arial, sans-serif';
        resultWindow.style.color = '#333';
        resultWindow.style.display = 'flex';
        resultWindow.style.flexDirection = 'column';

        // إنشاء الجزء العلوي الثابت (الهيدر)
        const headerSection = document.createElement('div');
        headerSection.style.padding = '25px 25px 0 25px';
        headerSection.style.backgroundColor = '#fff';
        headerSection.style.position = 'sticky';
        headerSection.style.top = '0';
        headerSection.style.zIndex = '10000';
        headerSection.style.borderTopLeftRadius = '12px';
        headerSection.style.borderTopRightRadius = '12px';

        // إضافة زر الإغلاق X في الزاوية العليا
        const closeX = document.createElement('div');
        closeX.innerHTML = '&times;';
        closeX.style.position = 'absolute';
        closeX.style.top = '15px';
        closeX.style.left = '20px';
        closeX.style.fontSize = '24px';
        closeX.style.fontWeight = 'bold';
        closeX.style.color = '#999';
        closeX.style.cursor = 'pointer';
        closeX.style.transition = 'color 0.2s';

        closeX.addEventListener('mouseover', function() {
            closeX.style.color = '#f44336';
        });

        closeX.addEventListener('mouseout', function() {
            closeX.style.color = '#999';
        });

        closeX.addEventListener('click', function() {
            document.body.removeChild(resultWindow);
            document.body.removeChild(overlay);
        });

        headerSection.appendChild(closeX);

        // إضافة العنوان
        const titleContainer = document.createElement('div');
        titleContainer.style.marginBottom = '20px';
        titleContainer.style.position = 'relative';

        const title = document.createElement('h2');
        title.textContent = 'تقرير الحضور والإجازات';
        title.style.color = '#3f51b5';
        title.style.margin = '0 0 5px 0';
        title.style.fontSize = '22px';
        titleContainer.appendChild(title);

        const subtitle = document.createElement('div');
        subtitle.textContent = `إجمالي الأيام: ${data.totalWorkDays}`;
        subtitle.style.color = '#666';
        subtitle.style.fontSize = '14px';
        titleContainer.appendChild(subtitle);

        const divider = document.createElement('div');
        divider.style.height = '3px';
        divider.style.background = 'linear-gradient(to right, #3f51b5, #e91e63)';
        divider.style.borderRadius = '3px';
        divider.style.margin = '15px 0';
        titleContainer.appendChild(divider);

        headerSection.appendChild(titleContainer);
        resultWindow.appendChild(headerSection);

        // إنشاء جزء المحتوى القابل للتمرير
        const contentSection = document.createElement('div');
        contentSection.style.padding = '0 25px 25px 25px';
        contentSection.style.overflowY = 'auto';
        contentSection.style.maxHeight = 'calc(85vh - 100px)'; // ارتفاع تقريبي مع مراعاة ارتفاع الهيدر
        contentSection.style.boxSizing = 'border-box';

        // إنشاء طريقة عرض بتنسيق البطاقات
        const cardContainer = document.createElement('div');
        cardContainer.style.display = 'grid';
        cardContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
        cardContainer.style.gap = '15px';
        cardContainer.style.marginBottom = '20px';

        // بطاقة الإحصائيات العامة
        const generalStatsCard = createCard('الإحصائيات العامة', '#3f51b5');
        const generalStatsList = document.createElement('ul');
        generalStatsList.style.listStyleType = 'none';
        generalStatsList.style.padding = '0';
        generalStatsList.style.margin = '0';

        const generalStatsItems = [
            {label: 'أيام الحضور', value: data.presentDays},
            {label: 'أيام الإجازات الاعتيادية', value: data.regularLeaveDays},
            {label: 'أيام الإجازات المفردة (أقل من 5 أيام)', value: data.singleLeaveDays},
            {label: 'أيام المهام والاستئذان', value: data.missionsAndPermissionsDays},
            {label: 'أيام الغياب', value: data.absentDays}
        ];

        generalStatsItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.style.padding = '8px 0';
            listItem.style.borderBottom = '1px solid #eee';
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';

            const label = document.createElement('span');
            label.textContent = item.label;

            const value = document.createElement('span');
            value.textContent = item.value;
            value.style.fontWeight = 'bold';

            listItem.appendChild(label);
            listItem.appendChild(value);
            generalStatsList.appendChild(listItem);
        });

        generalStatsCard.appendChild(generalStatsList);
        cardContainer.appendChild(generalStatsCard);

        // بطاقة تحليل أوقات الحضور
        const attendanceCard = createCard('تحليل أوقات الحضور', '#e91e63');
        const attendanceList = document.createElement('ul');
        attendanceList.style.listStyleType = 'none';
        attendanceList.style.padding = '0';
        attendanceList.style.margin = '0';

        const attendanceItems = [
            {label: 'متوسط وقت الحضور', value: data.averageArrivalTime},
            {label: 'متوسط وقت الانصراف', value: data.averageDepartureTime},
            {label: 'متوسط ساعات العمل', value: data.averageWorkHours},
            {label: 'عدد مرات التأخير', value: data.lateArrivalCount},
            {label: 'نسبة التأخير', value: data.latePercentage + '%'}
        ];

        attendanceItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.style.padding = '8px 0';
            listItem.style.borderBottom = '1px solid #eee';
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';

            const label = document.createElement('span');
            label.textContent = item.label;

            const value = document.createElement('span');
            value.textContent = item.value;
            value.style.fontWeight = 'bold';

            listItem.appendChild(label);
            listItem.appendChild(value);
            attendanceList.appendChild(listItem);
        });

        attendanceCard.appendChild(attendanceList);
        cardContainer.appendChild(attendanceCard);

        contentSection.appendChild(cardContainer);

        // قسم أنواع الإجازات المجمعة
        const leaveTypesCard = createCard('أنواع الإجازات والقرارات المجمعة', '#4caf50', '100%');

        // ترتيب أنواع الإجازات المجمعة حسب العدد
        const sortedLeaveTypes = Object.entries(data.leaveTypesSummary)
            .sort((a, b) => b[1] - a[1]);

        // إنشاء جدول لعرض أنواع الإجازات
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '10px';

        // إضافة رأس الجدول
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const typeHeader = document.createElement('th');
        typeHeader.textContent = 'نوع الإجازة أو القرار';
        typeHeader.style.textAlign = 'right';
        typeHeader.style.padding = '8px 5px';
        typeHeader.style.borderBottom = '2px solid #4caf50';

        const countHeader = document.createElement('th');
        countHeader.textContent = 'عدد الأيام';
        countHeader.style.textAlign = 'center';
        countHeader.style.padding = '8px 5px';
        countHeader.style.borderBottom = '2px solid #4caf50';

        const percentHeader = document.createElement('th');
        percentHeader.textContent = 'النسبة المئوية';
        percentHeader.style.textAlign = 'center';
        percentHeader.style.padding = '8px 5px';
        percentHeader.style.borderBottom = '2px solid #4caf50';

        headerRow.appendChild(typeHeader);
        headerRow.appendChild(countHeader);
        headerRow.appendChild(percentHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // إضافة صفوف الجدول
        const tbody = document.createElement('tbody');

        sortedLeaveTypes.forEach(([type, count], index) => {
            const row = document.createElement('tr');
            row.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';

            const typeCell = document.createElement('td');
            typeCell.textContent = type;
            typeCell.style.padding = '8px 5px';
            typeCell.style.borderBottom = '1px solid #ddd';

            const countCell = document.createElement('td');
            countCell.textContent = count;
            countCell.style.textAlign = 'center';
            countCell.style.padding = '8px 5px';
            countCell.style.borderBottom = '1px solid #ddd';
            countCell.style.fontWeight = 'bold';

            const percentCell = document.createElement('td');
            const percentage = ((count / data.totalWorkDays) * 100).toFixed(1);
            percentCell.textContent = percentage + '%';
            percentCell.style.textAlign = 'center';
            percentCell.style.padding = '8px 5px';
            percentCell.style.borderBottom = '1px solid #ddd';

            // إضافة شريط تقدم صغير
            const progressContainer = document.createElement('div');
            progressContainer.style.width = '100%';
            progressContainer.style.backgroundColor = '#f1f1f1';
            progressContainer.style.borderRadius = '4px';
            progressContainer.style.overflow = 'hidden';
            progressContainer.style.height = '4px';
            progressContainer.style.marginTop = '3px';

            const progressBar = document.createElement('div');
            progressBar.style.width = percentage + '%';
            progressBar.style.backgroundColor = '#4caf50';
            progressBar.style.height = '100%';

            progressContainer.appendChild(progressBar);
            percentCell.appendChild(progressContainer);

            row.appendChild(typeCell);
            row.appendChild(countCell);
            row.appendChild(percentCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        leaveTypesCard.appendChild(table);
        contentSection.appendChild(leaveTypesCard);

        // إضافة قسم المحتوى إلى النافذة الرئيسية
        resultWindow.appendChild(contentSection);

        // إضافة الخلفية المعتمة
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '9998';
        overlay.style.backdropFilter = 'blur(3px)';

        // إضافة إمكانية إغلاق النافذة بالنقر على الخلفية
        overlay.addEventListener('click', function() {
            document.body.removeChild(resultWindow);
            document.body.removeChild(overlay);
        });

        // منع إغلاق النافذة عند النقر عليها
        resultWindow.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        // إضافة الخلفية المعتمة والنافذة إلى الصفحة
        document.body.appendChild(overlay);
        document.body.appendChild(resultWindow);
    }

    /**
     * إنشاء بطاقة عرض
     * @param {string} title - عنوان البطاقة
     * @param {string} color - لون عنوان البطاقة
     * @param {string|null} width - عرض البطاقة (اختياري)
     * @returns {HTMLElement} عنصر البطاقة
     */
    function createCard(title, color, width = null) {
        const card = document.createElement('div');
        card.style.backgroundColor = 'white';
        card.style.borderRadius = '8px';
        card.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        card.style.padding = '15px';
        if (width) {
            card.style.width = width;
        }

        const cardTitle = document.createElement('h3');
        cardTitle.textContent = title;
        cardTitle.style.color = color;
        cardTitle.style.margin = '0 0 15px 0';
        cardTitle.style.fontSize = '16px';
        cardTitle.style.fontWeight = 'bold';
        cardTitle.style.paddingBottom = '8px';
        cardTitle.style.borderBottom = `2px solid ${color}`;

        card.appendChild(cardTitle);
        return card;
    }
    
    // كشف الواجهات العامة
    return {
        createResultWindow
    };
})();
