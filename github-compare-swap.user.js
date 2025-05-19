// ==UserScript==
// @name        GitHub Compare Branch Swapper
// @namespace   https://github.com/oxygen-dioxide
// @version     0.3.0
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
            const regexSameRepo = /github\.com\/([^/]+)\/([^/]+)\/compare\/([^.]+)\.\.\.([^.]+)/;
            const matchSameRepo = currentUrl.match(regexSameRepo);
            if (matchSameRepo) {
                const [, user, repo, branch1, branch2] = matchSameRepo;
                const newUrl = `https://github.com/${user}/${repo}/compare/${branch2}...${branch1}`;
                window.location.href = newUrl;
            }
             else {
                console.warn("Could not parse the compare URL.");
            }
        }
    }

    function addButton() {
        const compareHeader = document.querySelector('.compare-show-header');
        const comparePrHeader = document.querySelector('.compare-pr-header');
        let targetElement;

        if (compareHeader) {
            targetElement = compareHeader.querySelector('.Subhead-description');
        } else if (comparePrHeader) {
            targetElement = comparePrHeader.querySelector('.Subhead-description');
        }

        if (targetElement) {
            const swapButton = document.createElement('button');
            swapButton.textContent = 'Swap';
            swapButton.classList.add('btn', 'btn-sm', 'ml-2'); // Add some basic GitHub button styling and margin
            swapButton.addEventListener('click', swapBranches);

            targetElement.parentNode.insertBefore(swapButton, targetElement.nextSibling);
        }
    }

    // Observe changes to the DOM and add the button when the relevant header appears
    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('compare-show-header') || node.classList.contains('compare-pr-header'))) {
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
