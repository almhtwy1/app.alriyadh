// ==UserScript==
// @name         تسجيل المواعيد
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  اسرع وافضل حتى عندما يتأخر المستخدم في ادخال الارقام او يعدل لا يوجد مشكلة، مع دعم اختصارات Alt+N و Alt+S
// @author       محمد بن مطلق القحطاني
// @match        https://crm.alriyadh.gov.sa/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) return resolve(element);
            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    return resolve(el);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found`));
            }, timeout);
        });
    }

    function simulateInput(inputField, value) {
        inputField.focus();
        setNativeValue(inputField, value);
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function setNativeValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
        const protoSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
        (protoSetter || valueSetter)?.call(element, value);
    }

    async function selectApplicantType() {
        const el = await waitForElement("#id-0a9526e2-60b7-41ff-884a-c6dc6dd997b0-2-ldv_requestertypecodes-ldv_requestertypecodes\\.fieldControl-option-set-select");
        el.value = "1";
        el.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(500);
    }

    async function selectService() {
        const name = "مقابلة مسؤول البلدية للتعمير";
        const input = await waitForElement("input[aria-label='الخدمة, بحث']");
        simulateInput(input, name);
        await findAndClickOption("div#ldv_servicetypeid\\.fieldControl\\|__flyoutRootNode_SimpleLookupControlFlyout", name);
    }

    async function selectVisitOption() {
        const el = await waitForElement("#id-0a9526e2-60b7-41ff-884a-c6dc6dd997b0-25-ldv_requesttypecode-ldv_requesttypecode\\.fieldControl-option-set-select");
        el.value = "3";
        el.dispatchEvent(new Event('change', { bubbles: true }));
        await delay(500);
    }

    async function selectSubService() {
        const options = ["ادراة الأراضي", "تخطيط عمراني", "تراخيص بناء", "رقابة مباني", "صيانة طرق"];
        const chosen = options[Math.floor(Math.random() * options.length)];
        const input = await waitForElement("input[aria-label='الخدمة الفرعية, بحث']");
        simulateInput(input, chosen);
        await findAndClickOption("div#ldv_subservicetypeid\\.fieldControl\\|__flyoutRootNode_SimpleLookupControlFlyout", chosen);
    }

    async function setAppointmentSubject() {
        const textarea = await waitForElement('#id-0a9526e2-60b7-41ff-884a-c6dc6dd997b0-32-ldv_appointmentsubject-ldv_appointmentsubject\\.fieldControl-text-box-text');
        const subjects = ["...", "استفسار", "مقابلة الوكيل", "مشكلة", "توضيح", "مقابلة", "اقتراح", "طلب", "مراجعة", "شكوى", "استشارة", "توصية", "مناقشة", "اجتماع", "استفسار إضافي"];
        const text = subjects[Math.floor(Math.random() * subjects.length)];
        setNativeValue(textarea, text);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async function enterIndividualSearchValue() {
        const input = await waitForElement("input[aria-label='الفرد, بحث']");
        simulateInput(input, "123456789");
        const observer = new MutationObserver(() => {
            const options = document.querySelectorAll("div#ldv_fullname\\.fieldControl\\|__flyoutRootNode_SimpleLookupControlFlyout ul li");
            if (options.length === 1) {
                options[0].click();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        input.focus();
    }

    function findAndClickOption(selector, value, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                const options = document.querySelectorAll(selector + " li");
                for (let option of options) {
                    if (option.textContent.includes(value)) {
                        option.click();
                        clearInterval(interval);
                        return resolve();
                    }
                }
                if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    reject(new Error(`Option ${value} not found`));
                }
            }, 100);
        });
    }

    function delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    function addButton() {
        const ul = document.querySelector('ul[aria-label="العملاء"]');
        if (!ul || document.querySelector('#custom-register-button')) return;
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="a ae be bf ba i bg bh bi bj bk fl fm flexbox">
                <div class="aw e aq bx flexbox">
                    <button id="custom-register-button" style="all:unset;color:inherit;display:inline-flex;align-items:center;justify-content:center;padding:8px 16px;font-size:14px;margin-right:1px;">
                        تسجيل موعد
                    </button>
                </div>
            </div>`;
        ul.appendChild(li);
        document.getElementById('custom-register-button').onclick = () => {
            window.location.href = 'https://crm.alriyadh.gov.sa/main.aspx?appid=98e24583-b0e0-4ff0-a795-f2223d144e0c&forceUCI=1&pagetype=entityrecord&etn=ldv_appointmentrequest&process=04720dc1-8673-4c28-b7b9-7fc8d6194dc7';
        };
    }

    async function executeAppointmentProcess() {
        try {
            await selectApplicantType();
            await selectService();
            await selectVisitOption();
            await selectSubService();
            await setAppointmentSubject();
            await enterIndividualSearchValue();
            console.log("✅ تم إكمال تسجيل الموعد بنجاح");
        } catch (e) {
            console.error("❌ خطأ أثناء تنفيذ العملية:", e);
        }
    }

    function executeSaveOrBook() {
        const bookBtn = document.getElementById('ldv_appointmentrequest|NoRelationship|Form|ldv.ldv_appointmentrequest.BookingAppointment.Command20');
        const saveBtn = document.getElementById('ldv_appointmentrequest|NoRelationship|Form|Mscrm.SavePrimary00');
        if (bookBtn) bookBtn.click();
        else if (saveBtn) saveBtn.click();
        else console.error("لم يتم العثور على زر الحجز أو الحفظ");
    }

    function executeIfHijriDayExists() {
        const hijriField = document.querySelector('input[data-id="ldv_appointmentdayhijri.fieldControl-text-box-text"]');
        if (hijriField && hijriField.value !== "---") {
            waitForElement('label[data-id*="ProcessBreadCrumb-processHeaderStageName"]', (el) => {
                el.click();
                waitForElement('div[data-id*="header_process_ldv_issubmit"]', (chk) => {
                    chk.click();
                    waitForElement('label[data-id*="المرحلة التالية"]', (nextBtn) => {
                        nextBtn.click();
                    });
                });
            });
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.altKey) {
            if (e.code === 'KeyN') {
                e.preventDefault();
                window.location.href = 'https://crm.alriyadh.gov.sa/main.aspx?appid=98e24583-b0e0-4ff0-a795-f2223d144e0c&forceUCI=1&pagetype=entityrecord&etn=ldv_appointmentrequest&process=04720dc1-8673-4c28-b7b9-7fc8d6194dc7';
            } else if (e.key.toLowerCase() === 's' || e.key === 'س') {
                e.preventDefault();
                executeSaveOrBook();
                executeIfHijriDayExists();
            }
        }
    });

    window.addEventListener('load', () => {
        if (window.location.href.includes('ldv_appointmentrequest') && window.location.href.includes('process=04720dc1-8673-4c28-b7b9-7fc8d6194dc7')) {
            waitForElement('label#MscrmControls\\.Containers\\.ProcessBreadCrumb-processHeaderKpiLabel')
                .then(executeAppointmentProcess)
                .catch(err => console.error("Error in waiting for process start:", err));
        }
    });

    setInterval(addButton, 1000);
})();
