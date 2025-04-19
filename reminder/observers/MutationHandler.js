function setupObserver() {
    let debounceTimer;
    let lastAttempt = 0;
    const checkAndAddButton = () => {
        const now = Date.now();
        if (now - lastAttempt < 50) return;
        lastAttempt = now;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (!findButtonById('6787')) {
                addReminderButton();
            }
            setupRowSelection();
        }, 100);
    };
    const observer = new MutationObserver(checkAndAddButton);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
    const setupIframeObservers = () => {
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                    if (!findButtonById('6787', iframe.contentDocument)) {
                        addReminderButton();
                    }
                    setupRowSelection();
                    try {
                        const frameDoc = iframe.contentDocument;
                        const frameObserver = new MutationObserver(checkAndAddButton);
                        frameObserver.observe(frameDoc.documentElement, {
                            childList: true,
                            subtree: true,
                            attributes: true,
                            attributeFilter: ['class', 'style']
                        });
                    } catch (e) {}
                }
                iframe.addEventListener('load', () => {
                    if (!findButtonById('6787')) {
                        addReminderButton();
                    }
                    setupRowSelection();
                    try {
                        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const frameObserver = new MutationObserver(checkAndAddButton);
                        frameObserver.observe(frameDoc.documentElement, {
                            childList: true,
                            subtree: true,
                            attributes: true,
                            attributeFilter: ['class', 'style']
                        });
                    } catch (e) {}
                });
            } catch (e) {}
        });
    };
    setupIframeObservers();
    setInterval(() => {
        setupIframeObservers();
    }, 1000);
}
