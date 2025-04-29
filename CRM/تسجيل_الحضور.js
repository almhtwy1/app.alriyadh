// ==UserScript==
// @name         تسجيل الحضور مع الكتابة والضغط مع دعم اختصار Alt+3
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  تسجيل حضور مع الضغط على الزر وإنهاء إجراءات التسجيل + دعم ذكي لاختصار Alt+3 للتعامل مع الحالات المختلفة تلقائيًا
// @author       أنت
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
            button.style.padding = '8px 16px';
            button.style.fontSize = '14px';
            button.style.marginRight = '-4px';

            const text = document.createElement('span');
            text.className = 'bo aq ce cf cg ch ci av cj';
            text.textContent = 'تسجيل حضور';
            text.style.color = 'black';

            button.appendChild(text);
            button.onclick = clickAttendButton;

            divInner.appendChild(button);
            divOuter.appendChild(divInner);
            li.appendChild(divOuter);
            ulList.appendChild(li);
        }
    }

    function clickAttendButton() {
        waitForElement('button[data-id="ldv_appointmentrequest|NoRelationship|Form|ldv.ldv_appointmentrequest.Attend.Button"]', (attendButton) => {
            attendButton.click();
            waitForElementToDisappear('button[data-id="ldv_appointmentrequest|NoRelationship|Form|ldv.ldv_appointmentrequest.Attend.Button"]', clickOfficialButton);
        });
    }

    function clickOfficialButton() {
        waitForElement('label[data-id="MscrmControls.Containers.ProcessBreadCrumb-processHeaderStageName_d7e33b7f-abc2-4e28-818f-d7931f7919a3"]', (officialButton) => {
            officialButton.click();
            waitForElement('select[data-id="header_process_ldv_officialdecision_1.fieldControl-option-set-select"]', selectOfficialDecision);
        });
    }

    function selectOfficialDecision() {
        waitForElement('select[data-id="header_process_ldv_officialdecision_1.fieldControl-option-set-select"]', (decisionSelect) => {
            decisionSelect.value = "100000000";
            decisionSelect.dispatchEvent(new Event('change', { bubbles: true }));

            waitForElement('input[id="header_process_ldv_officialstatement_1-header_process_ldv_officialstatement_1-header_process_ldv_officialstatement_1.fieldControl-text-box-text"]', focusOnOfficialStatement);
        });
    }

    function focusOnOfficialStatement() {
        waitForElement('input[id="header_process_ldv_officialstatement_1-header_process_ldv_officialstatement_1-header_process_ldv_officialstatement_1.fieldControl-text-box-text"]', (officialStatementInput) => {
            officialStatementInput.focus();
            officialStatementInput.scrollIntoView({ behavior: "smooth", block: "center" });
            setNativeValue(officialStatementInput, '...');
            officialStatementInput.dispatchEvent(new Event('input', { bubbles: true }));
            officialStatementInput.setSelectionRange(officialStatementInput.value.length, officialStatementInput.value.length);
            officialStatementInput.dispatchEvent(new Event('change', { bubbles: true }));
            focusOnOfficialComments();
        });
    }

    function focusOnOfficialComments() {
        waitForElement('textarea[id="header_process_ldv_officialcomments_1-header_process_ldv_officialcomments_1-header_process_ldv_officialcomments_1.fieldControl-text-box-text"]', (officialCommentsTextarea) => {
            officialCommentsTextarea.focus();
            officialCommentsTextarea.scrollIntoView({ behavior: "smooth", block: "center" });
            setNativeValue(officialCommentsTextarea, '...');
            officialCommentsTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            officialCommentsTextarea.setSelectionRange(officialCommentsTextarea.value.length, officialCommentsTextarea.value.length);
            officialCommentsTextarea.dispatchEvent(new Event('change', { bubbles: true }));

            waitForElement('label[data-id="MscrmControls.Containers.ProcessStageControl-المرحلة التالية"]', (nextStageButton) => {
                nextStageButton.click();
            });
        });
    }

    function setNativeValue(element, value) {
        const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, 'value') || {};
        const prototype = Object.getPrototypeOf(element);
        const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {};

        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else if (valueSetter) {
            valueSetter.call(element, value);
        } else {
            throw new Error('The given element does not have a value setter');
        }
    }

    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            const observer = new MutationObserver((mutations, me) => {
                const element = document.querySelector(selector);
                if (element) {
                    callback(element);
                    me.disconnect();
                }
            });
            observer.observe(document, { childList: true, subtree: true });
        }
    }

    function waitForElementToDisappear(selector, callback) {
        const observer = new MutationObserver((mutations, me) => {
            const element = document.querySelector(selector);
            if (!element) {
                callback();
                me.disconnect();
            }
        });
        observer.observe(document, { childList: true, subtree: true });
    }

    // دالة تنفيذ حركة Alt+3 الذكية
    function handleAlt3() {
        let workingOnItemsElement = document.querySelector('h1[data-id^="ViewSelector_"][aria-label="العناصر التي أعمل عليها"]');
        if (workingOnItemsElement) {
            let firstTableItem = document.querySelector('a[title^="DMV-"]');
            if (firstTableItem) {
                firstTableItem.click();
                return;
            }
        }

        let attendButton = document.querySelector('button[aria-label="تسجيل الحضور"]');
        let customAttendButton = document.getElementById('custom-attend-button');
        let caseReason = document.querySelector('div[aria-label="قيد مراجعة المسؤول"]');
        let queueItem = document.getElementById('sitemap-entity-QueueItems_SubArea');

        if (attendButton && caseReason) {
            if (customAttendButton) {
                customAttendButton.click();
            } else {
                console.error('Button with id "custom-attend-button" not found.');
            }
        } else if (attendButton) {
            if (!caseReason) {
                if (queueItem) {
                    queueItem.click();
                } else {
                    console.error('Queue item not found.');
                }
            }
        } else if (queueItem) {
            queueItem.click();
        } else {
            console.error('No applicable item found.');
        }
    }

    // حدث الاستماع للوحة المفاتيح
    document.addEventListener('keydown', function(event) {
        if (event.altKey && event.key === '3') {
            event.preventDefault();
            handleAlt3();
        }
    });

    setInterval(addButton, 500);
})();
