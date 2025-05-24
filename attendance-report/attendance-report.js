// ==UserScript==
// @name         تحليل الحضور والإجازات
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  إضافة زر لتحليل الحضور والإجازات مع إحصائيات مفصلة
// @author       محمد بن مطلق القحطاني
// @match        https://intranetapps/Attendance/Search*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', function() {
        createAnalysisButton();
    });

    function createAnalysisButton() {
        const buttonContainer = document.querySelector('.d-flex.justify-content-center.align-items-center.gap-2');
        if (!buttonContainer) return;

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

        const tooltip = document.createElement('span');
        tooltip.className = 'v-tooltip v-tooltip--bottom';

        const tooltipInner = document.createElement('div');
        tooltipInner.className = 'v-tooltip__content';
        tooltipInner.textContent = 'تحليل الحضور والإجازات';
        tooltipInner.style.display = 'none';
        tooltip.appendChild(tooltipInner);

        buttonContainer.appendChild(analyzeButton);
        buttonContainer.appendChild(tooltip);

        analyzeButton.addEventListener('click', function() {
            analyzeAttendance();
        });

        analyzeButton.addEventListener('mouseenter', function() {
            tooltipInner.style.display = 'block';
        });
        analyzeButton.addEventListener('mouseleave', function() {
            tooltipInner.style.display = 'none';
        });
    }

    function analyzeAttendance() {
        console.clear();
        console.log("جاري تحليل البيانات...");

        const rows = document.querySelectorAll('table tr.data-label');
        const leavePeriodsMap = new Map();
        const processedLeaves = new Set();
        const leaveTypesDurationMap = new Map();

        let totalWorkDays = 0;
        let totalLeaveDays = 0;
        let totalAllLeavesDays = 0; // إجمالي عدد أيام جميع الإجازات والقرارات
        let regularLeaveDays = 0;
        let missionsDays = 0; // أيام المهام
        let permissionsDays = 0; // أيام الاستئذان
        let singleLeaveDays = 0;
        let presentDays = 0;
        let absentDays = 0;

        const arrivalTimes = [];
        const departureTimes = [];
        let lateArrivalCount = 0;

        function extractMainLeaveType(note) {
            let mainType = note.replace(/\s+مـــن\s+[\d\/-]+\s+الي\s+[\d\/-]+/g, "");
            mainType = mainType.replace(/\s+من\s+[\d\/-]+\s+الى\s+[\d\/-]+/g, "");
            mainType = mainType.replace(/\d+[-\/]\d+[-\/]\d+/g, "").trim();
            mainType = mainType.replace(/\s+/g, " ").trim();
            return mainType;
        }

        function extractLeavePeriod(note) {
            const periodRegex = /مـــن\s+(\d+[-\/]\d+[-\/]\d+)\s+الي\s+(\d+[-\/]\d+[-\/]\d+)/;
            const periodMatch = note.match(periodRegex);

            const altPeriodRegex = /من\s+(\d+[-\/]\d+[-\/]\d+)\s+الى\s+(\d+[-\/]\d+[-\/]\d+)/;
            const altPeriodMatch = note.match(altPeriodRegex);

            const match = periodMatch || altPeriodMatch;

            if (match) {
                return {
                    startDate: match[1],
                    endDate: match[2],
                };
            }

            return null;
        }

        function calculateLeaveDuration(periodKey) {
            if (!periodKey) return 1;

            const [startDate, endDate] = periodKey.split('_');
            const [startDay, startMonth, startYear] = startDate.split('-').map(Number);
            const [endDay, endMonth, endYear] = endDate.split('-').map(Number);

            let totalDays = 0;

            if (startYear !== endYear) {
                const daysInYear = 354;
                const daysInMonthAvg = 29.5;

                let daysLeftInStartMonth = Math.ceil(daysInMonthAvg) - startDay + 1;
                let daysInRemainingMonths = (12 - startMonth) * daysInMonthAvg;
                let daysInEndYearMonths = (endMonth - 1) * daysInMonthAvg;
                let daysInEndMonth = endDay;

                totalDays = daysLeftInStartMonth + daysInRemainingMonths + daysInEndYearMonths + daysInEndMonth;

                if (endYear - startYear > 1) {
                    totalDays += (endYear - startYear - 1) * daysInYear;
                }
            } else if (startMonth !== endMonth) {
                const daysInMonthAvg = 29.5;

                let daysLeftInStartMonth = Math.ceil(daysInMonthAvg) - startDay + 1;
                let daysInFullMonths = (endMonth - startMonth - 1) * daysInMonthAvg;
                let daysInEndMonth = endDay;

                totalDays = daysLeftInStartMonth + daysInFullMonths + daysInEndMonth;
            } else {
                totalDays = endDay - startDay + 1;
            }

            return Math.round(totalDays);
        }

        function isSingleLeave(duration) {
            return duration < 5;
        }

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const note = cells[4].textContent.trim();

            if (note) {
                const mainLeaveType = extractMainLeaveType(note);
                const leavePeriod = extractLeavePeriod(note);

                if (leavePeriod) {
                    const periodKey = `${leavePeriod.startDate}_${leavePeriod.endDate}`;

                    if (!leavePeriodsMap.has(periodKey)) {
                        const duration = calculateLeaveDuration(periodKey);
                        leavePeriodsMap.set(periodKey, {
                            type: mainLeaveType,
                            duration: duration,
                            isSingle: isSingleLeave(duration)
                        });
                    }
                }
            }
        });

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const date = cells[1].textContent.trim();
            const arrivalTime = cells[2].textContent.trim();
            const departureTime = cells[3].textContent.trim();
            const note = cells[4].textContent.trim();
            const isRamadan = date && date.split('/')[1] === '9';

            if (note) {
                const mainLeaveType = extractMainLeaveType(note);
                const leavePeriod = extractLeavePeriod(note);

                // تعامل مع الإجازات ذات الفترات المحددة
                if (leavePeriod) {
                    const periodKey = `${leavePeriod.startDate}_${leavePeriod.endDate}`;

                    if (!processedLeaves.has(periodKey)) {
                        const periodInfo = leavePeriodsMap.get(periodKey);

                        // إضافة عدد أيام الإجازة لنوع الإجازة المقابل في الخريطة
                        if (!leaveTypesDurationMap.has(mainLeaveType)) {
                            leaveTypesDurationMap.set(mainLeaveType, 0);
                        }
                        leaveTypesDurationMap.set(
                            mainLeaveType,
                            leaveTypesDurationMap.get(mainLeaveType) + periodInfo.duration
                        );

                        // زيادة إجمالي عدد أيام جميع الإجازات
                        totalAllLeavesDays += periodInfo.duration;

                        if (!mainLeaveType.includes("الاجازة الاسبوعية")) {
                            if (mainLeaveType.includes("مهمة")) {
                                missionsDays += periodInfo.duration;
                            }
                            else if (mainLeaveType.includes("استئذان")) {
                                permissionsDays += periodInfo.duration;
                            }
                            else if (mainLeaveType.includes("إجـازة إعتيادية")) {
                                regularLeaveDays += periodInfo.duration;

                                if (periodInfo.isSingle) {
                                    singleLeaveDays += periodInfo.duration;
                                }
                            }
                            else {
                                totalLeaveDays += periodInfo.duration;
                            }
                        }

                        processedLeaves.add(periodKey);
                    }
                } else {
                    // تعامل مع الإجازات دون فترات محددة (يوم واحد)
                    if (!leaveTypesDurationMap.has(mainLeaveType)) {
                        leaveTypesDurationMap.set(mainLeaveType, 0);
                    }
                    leaveTypesDurationMap.set(
                        mainLeaveType,
                        leaveTypesDurationMap.get(mainLeaveType) + 1
                    );

                    // زيادة إجمالي عدد أيام جميع الإجازات
                    totalAllLeavesDays += 1;

                    if (!mainLeaveType.includes("الاجازة الاسبوعية")) {
                        if (mainLeaveType.includes("مهمة")) {
                            missionsDays++;
                        } else if (mainLeaveType.includes("استئذان")) {
                            permissionsDays++;
                        } else if (mainLeaveType.includes("إجـازة إعتيادية")) {
                            regularLeaveDays++;
                            singleLeaveDays++;
                        } else {
                            totalLeaveDays++;
                        }
                    }
                }
            } else {
                if (arrivalTime && departureTime) {
                    presentDays++;

                    const [hour, minute] = arrivalTime.split(':').map(Number);
                    const timeInMinutes = hour * 60 + minute;
                    arrivalTimes.push(timeInMinutes);

                    if (isRamadan) {
                        if (timeInMinutes > 10 * 60) {
                            lateArrivalCount++;
                        }
                    } else {
                        if (timeInMinutes > 8 * 60 + 30) {
                            lateArrivalCount++;
                        }
                    }

                    const [depHour, depMinute] = departureTime.split(':').map(Number);
                    const depTimeInMinutes = depHour * 60 + depMinute;
                    departureTimes.push(depTimeInMinutes);
                } else if (arrivalTime && !departureTime) {
                    presentDays++;
                } else {
                    absentDays++;
                }
            }

            totalWorkDays++;
        });

        const averageArrivalTime = arrivalTimes.length > 0
            ? calculateAverageTime(arrivalTimes)
            : "لا توجد بيانات";

        const averageDepartureTime = departureTimes.length > 0
            ? calculateAverageTime(departureTimes)
            : "لا توجد بيانات";

        const averageWorkHours = calculateAverageWorkHours(arrivalTimes, departureTimes);

        createResultWindow({
            totalWorkDays,
            presentDays,
            totalLeaveDays,
            regularLeaveDays,
            missionsDays,
            permissionsDays,
            singleLeaveDays,
            absentDays,
            leaveTypesDuration: leaveTypesDurationMap,
            totalAllLeavesDays,
            averageArrivalTime,
            averageDepartureTime,
            averageWorkHours,
            lateArrivalCount,
            latePercentage: ((lateArrivalCount / presentDays) * 100).toFixed(2)
        });
    }

    function createResultWindow(data) {
        const resultWindow = document.createElement('div');
        resultWindow.style.position = 'fixed';
        resultWindow.style.top = '50%';
        resultWindow.style.left = '50%';
        resultWindow.style.transform = 'translate(-50%, -50%)';
        resultWindow.style.backgroundColor = '#fff';
        resultWindow.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        resultWindow.style.borderRadius = '12px';
        resultWindow.style.padding = '0';
        resultWindow.style.zIndex = '9999';
        resultWindow.style.maxWidth = '650px';
        resultWindow.style.width = '90%';
        resultWindow.style.maxHeight = '85vh';
        resultWindow.style.overflow = 'hidden';
        resultWindow.style.direction = 'rtl';
        resultWindow.style.textAlign = 'right';
        resultWindow.style.fontFamily = 'Arial, sans-serif';
        resultWindow.style.color = '#333';
        resultWindow.style.display = 'flex';
        resultWindow.style.flexDirection = 'column';

        const headerSection = document.createElement('div');
        headerSection.style.padding = '25px 25px 0 25px';
        headerSection.style.backgroundColor = '#fff';
        headerSection.style.position = 'sticky';
        headerSection.style.top = '0';
        headerSection.style.zIndex = '10000';
        headerSection.style.borderTopLeftRadius = '12px';
        headerSection.style.borderTopRightRadius = '12px';

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
        subtitle.textContent = `أيام الحضور: ${data.presentDays}`;
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

        const contentSection = document.createElement('div');
        contentSection.style.padding = '0 25px 25px 25px';
        contentSection.style.overflowY = 'auto';
        contentSection.style.maxHeight = 'calc(85vh - 100px)';
        contentSection.style.boxSizing = 'border-box';

        const cardContainer = document.createElement('div');
        cardContainer.style.display = 'grid';
        cardContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
        cardContainer.style.gap = '15px';
        cardContainer.style.marginBottom = '20px';

        const generalStatsCard = createCard('الإحصائيات العامة', '#3f51b5');
        const generalStatsList = document.createElement('ul');
        generalStatsList.style.listStyleType = 'none';
        generalStatsList.style.padding = '0';
        generalStatsList.style.margin = '0';

        const generalStatsItems = [
            {label: 'الإجازات الاعتيادية', value: data.regularLeaveDays, tooltip: null},
            {label: 'الإجازات المفردة', value: data.singleLeaveDays, tooltip: 'يُحتسب عدد الأيام المفردة المُستخدمة خلال الفترة المحددة من أصل 10 أيام تُمنح سنويًا، بهدف تحديد الرصيد المتبقي.'},
            {label: 'المهام', value: data.missionsDays, tooltip: null},
            {label: 'الاستئذان', value: data.permissionsDays, tooltip: 'يُحتسب عدد أيام الاستئذان المُستخدمة خلال السنة الميلادية من أصل 12 يومًا تُمنح سنويًا، بهدف تحديد الرصيد المتبقي.'},
            {label: 'الغياب', value: data.absentDays, tooltip: null}
        ];

        generalStatsItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.style.padding = '8px 0';
            listItem.style.borderBottom = '1px solid #eee';
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';

            const labelContainer = document.createElement('div');
            labelContainer.style.display = 'flex';
            labelContainer.style.alignItems = 'center';
            labelContainer.style.gap = '5px';

            const label = document.createElement('span');
            label.textContent = item.label;
            labelContainer.appendChild(label);

            if (item.tooltip) {
                const infoIcon = document.createElement('span');
                infoIcon.textContent = '🛈';
                infoIcon.style.cursor = 'help';
                infoIcon.style.fontSize = '12px';
                infoIcon.style.color = '#666';
                infoIcon.style.position = 'relative';

                const tooltipDiv = document.createElement('div');
                tooltipDiv.textContent = item.tooltip;
                tooltipDiv.style.position = 'fixed';
                tooltipDiv.style.background = '#000000';
                tooltipDiv.style.color = 'white';
                tooltipDiv.style.padding = '10px 15px';
                tooltipDiv.style.borderRadius = '8px';
                tooltipDiv.style.fontSize = '13px';
                tooltipDiv.style.lineHeight = '1.5';
                tooltipDiv.style.zIndex = '20000';
                tooltipDiv.style.visibility = 'hidden';
                tooltipDiv.style.opacity = '0';
                tooltipDiv.style.transition = 'opacity 0.2s ease';
                tooltipDiv.style.pointerEvents = 'none';
                tooltipDiv.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
                tooltipDiv.style.maxWidth = '280px';
                tooltipDiv.style.wordWrap = 'break-word';
                tooltipDiv.style.fontFamily = 'Arial, sans-serif';
                tooltipDiv.style.border = '1px solid #333333';

                document.body.appendChild(tooltipDiv);

                function showTooltip(e) {
                    const rect = tooltipDiv.getBoundingClientRect();
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;

                    // حساب الموقع المناسب للتلميح
                    let left = mouseX + 15;
                    let top = mouseY - rect.height - 10;

                    // التأكد من أن التلميح لا يخرج من حدود الشاشة
                    if (left + rect.width > window.innerWidth) {
                        left = mouseX - rect.width - 15;
                    }
                    if (top < 10) {
                        top = mouseY + 15;
                    }

                    tooltipDiv.style.left = left + 'px';
                    tooltipDiv.style.top = top + 'px';
                    tooltipDiv.style.visibility = 'visible';
                    tooltipDiv.style.opacity = '1';
                }

                function hideTooltip() {
                    tooltipDiv.style.visibility = 'hidden';
                    tooltipDiv.style.opacity = '0';
                }

                function updateTooltipPosition(e) {
                    if (tooltipDiv.style.visibility === 'visible') {
                        showTooltip(e);
                    }
                }

                infoIcon.addEventListener('mouseenter', showTooltip);
                infoIcon.addEventListener('mouseleave', hideTooltip);
                infoIcon.addEventListener('mousemove', updateTooltipPosition);

                labelContainer.appendChild(infoIcon);
            }

            const value = document.createElement('span');
            value.textContent = item.value;
            value.style.fontWeight = 'bold';

            listItem.appendChild(labelContainer);
            listItem.appendChild(value);
            generalStatsList.appendChild(listItem);
        });

        generalStatsCard.appendChild(generalStatsList);
        cardContainer.appendChild(generalStatsCard);

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

        const leaveTypesCard = createCard('أنواع الإجازات والقرارات المجمعة', '#4caf50', '100%');

        const sortedLeaveTypes = Array.from(data.leaveTypesDuration.entries())
            .sort((a, b) => b[1] - a[1]);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '10px';

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
            const percentage = ((count / data.totalAllLeavesDays) * 100).toFixed(1);
            percentCell.textContent = percentage + '%';
            percentCell.style.textAlign = 'center';
            percentCell.style.padding = '8px 5px';
            percentCell.style.borderBottom = '1px solid #ddd';

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

        resultWindow.appendChild(contentSection);

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

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '9998';
        overlay.style.backdropFilter = 'blur(3px)';

        overlay.addEventListener('click', function() {
            document.body.removeChild(resultWindow);
            document.body.removeChild(overlay);
        });

        resultWindow.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        document.body.appendChild(overlay);
        document.body.appendChild(resultWindow);
    }

    function calculateAverageTime(timesInMinutes) {
        if (timesInMinutes.length === 0) return "لا توجد بيانات";

        const sum = timesInMinutes.reduce((total, time) => total + time, 0);
        const average = sum / timesInMinutes.length;

        const hours = Math.floor(average / 60);
        const minutes = Math.floor(average % 60);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    function calculateAverageWorkHours(arrivalTimes, departureTimes) {
        if (arrivalTimes.length === 0 || departureTimes.length === 0 || arrivalTimes.length !== departureTimes.length) {
            return "لا توجد بيانات كافية";
        }

        let totalWorkMinutes = 0;
        const validPairs = Math.min(arrivalTimes.length, departureTimes.length);

        for (let i = 0; i < validPairs; i++) {
            const workMinutes = departureTimes[i] - arrivalTimes[i];
            if (workMinutes > 0) {
                totalWorkMinutes += workMinutes;
            }
        }

        const averageMinutes = totalWorkMinutes / validPairs;
        const hours = Math.floor(averageMinutes / 60);
        const minutes = Math.floor(averageMinutes % 60);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
})();
