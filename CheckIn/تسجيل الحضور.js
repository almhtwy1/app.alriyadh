// ==UserScript==
// @name         تسجيل الحضور واختصار Alt+3 المدمج
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  تسجيل حضور بضغطة زر أو اختصار Alt+3، مع تعبئة البيانات والتنقل التلقائي حسب الشروط.
// @author       محمد
// @match        https://crm.alriyadh.gov.sa/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function addButton() {
        const ulList = document.querySelector('ul[aria-label="العملاء"]');
        if (!ulList) return;

        if (!document.querySelector('#custom-attend-button')) {
            const li = document.createElement('li');
            li.className = 'ae az a aq ag ba ah b bb bc bd';
            const divOuter = document.createElement('div');
            divOuter.className = 'a ae be bf ba i bg bh bi bj bk fl fm flexbox';
            const divInner = document.createElement('div');
            divInner.className = 'aw e aq bx flexbox';

            const button = document.createElement('button');
            button.id = 'custom-attend-button';
            button.style.all = 'unset';
            button.style.color = 'inherit';
            button.style.display = 'inline-flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.padding = '8px 8px';
            button.style.fontSize = '14px';
            button.style.marginRight = '-4px';

            const text = document.createElement('span');
            text.className = 'bo aq ce cf cg ch ci av cj';
            text.textContent = 'تسجيل الحضور';
            text.style.color = 'black';

            button.appendChild(text);
            button.onclick = fullAttendanceFlow;

            divInner.appendChild(button);
            divOuter.appendChild(divInner);
            li.appendChild(divOuter);
            ulList.appendChild(li);
        }
    }

    function fullAttendanceFlow() {
        waitForElement('button[data-id="ldv_appointmentrequest|NoRelationship|Form|ldv.ldv_appointmentrequest.Attend.Button"]', (attendButton) => {
            attendButton.click();
            waitForElementToDisappear('button[data-id="ldv_appointmentrequest|NoRelationship|Form|ldv.ldv_appointmentrequest.Attend.Button"]', () => {
                waitForElement('label[data-id^="MscrmControls.Containers.ProcessBreadCrumb-processHeaderStageName"]', (officialButton) => {
                    officialButton.click();
                    waitForElement('select[data-id="header_process_ldv_officialdecision_1.fieldControl-option-set-select"]', (decisionSelect) => {
                        decisionSelect.value = "100000000";
                        decisionSelect.dispatchEvent(new Event('change', { bubbles: true }));

                        waitForElement('input[id^="header_process_ldv_officialstatement_1"]', (officialStatementInput) => {
                            setFieldValue(officialStatementInput, getRandomText());

                            waitForElement('textarea[id^="header_process_ldv_officialcomments_1"]', (officialCommentsTextarea) => {
                                setFieldValue(officialCommentsTextarea, getRandomText());

                                waitForElement('label[data-id="MscrmControls.Containers.ProcessStageControl-المرحلة التالية"]', (nextStageButton) => {
                                    nextStageButton.click();
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    function setFieldValue(element, value) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
        setter?.call(element, value);

        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.setSelectionRange(value.length, value.length);
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function getRandomText() {
        const options = ["...", "تم", "تم الحل", "مكتمل", "تم التنفيذ", "تم الإنجاز", "مغلق", "تم التحديث", "تم الرد", "معالج"];
        return options[Math.floor(Math.random() * options.length)];
    }

    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) return callback(element);
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                callback(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function waitForElementToDisappear(selector, callback) {
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (!element) {
                observer.disconnect();
                callback();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // اختصار Alt+3
    document.addEventListener('keydown', function (event) {
        if ((event.altKey || event.altRight) && event.key === '3') {
            event.preventDefault();
            let attendButton = document.querySelector('button[aria-label="تسجيل الحضور"]');
            let caseReason = document.querySelector('div[aria-label="قيد مراجعة المسؤول"]');

            if (attendButton && caseReason) {
                fullAttendanceFlow(); // تنفيذ كامل الإجراءات
            } else {
                let queueItem = document.getElementById('sitemap-entity-QueueItems_SubArea');
                if (queueItem) {
                    queueItem.click();
                } else {
                    console.error('لم يتم العثور على زر الحضور ولا قائمة الانتظار');
                }
            }
        }
    });

    setInterval(addButton, 500);
})();
