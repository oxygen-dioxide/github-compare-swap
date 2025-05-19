// ==UserScript==
// @name        GitHub Compare Branch Swapper
// @namespace   https://github.com/oxygen-dioxide
// @version     0.1.0
// @description Adds a "Swap" button to GitHub compare pages.
// @author      oxygen-dioxide
// @match       https://github.com/*/compare/*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    function swapBranches() {
        const currentUrl = window.location.href;
        const regex = /github\.com\/([^/]+)\/([^/]+)\/compare\/([^.]+)\.\.\.([^:]+):([^:]+):(.+)/;
        const match = currentUrl.match(regex);

        if (match) {
            const [, user1, repo1, branch1, user2, repo2, branch2] = match;
            const newUrl = `https://github.com/${user2}/${repo2}/compare/${branch2}...${user1}:${repo1}:${branch1}`;
            window.location.href = newUrl;
        } else {
            console.warn("Could not parse the compare URL.");
        }
    }

    function addButton() {
        const compareBar = document.querySelector('.select-menu');
        if (compareBar) {
            const swapButton = document.createElement('button');
            swapButton.textContent = 'Swap';
            swapButton.classList.add('btn', 'btn-sm'); // Add some basic GitHub button styling
            swapButton.addEventListener('click', swapBranches);

            const actionsDiv = compareBar.querySelector('.flex-auto.text-right');
            if (actionsDiv) {
                actionsDiv.insertBefore(swapButton, actionsDiv.firstChild);
            }
        }
    }

    // Observe changes to the DOM and add the button when the compare bar appears
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('js-compare-pr-sticky-nav')) {
                        addButton();
                        observer.disconnect(); // Stop observing once the element is found
                    }
                });
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also try to add the button if the element is already present on page load
    addButton();
})();
