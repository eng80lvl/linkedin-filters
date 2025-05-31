function addCustomTimeFilters() {
    const timeFilterContainer = document.querySelector('div[data-basic-filter-parameter-name="timePostedRange"]');
    if (!timeFilterContainer) return;

    const filterList = timeFilterContainer.querySelector('ul');
    if (!filterList) return;

    const customTimeFilters = [
        { label: '1 hour', value: 3600 },
        { label: '2 hours', value: 7200 },
        { label: '3 hours', value: 10800 },
        { label: '6 hours', value: 21600 },
        { label: '12 hours', value: 43200 }
    ];

    const allFiltersExist = customTimeFilters.every(filter => 
        filterList.querySelector(`input[value="r${filter.value}"]`)
    );

    if (allFiltersExist) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const currentTimeFilter = urlParams.get('f_TPR');
    if (currentTimeFilter) {
        const selectedValue = currentTimeFilter.replace('r', '');
        const selectedFilter = customTimeFilters.find(filter => filter.value.toString() === selectedValue);
        if (selectedFilter) {
            const selectedText = document.querySelector('.jobs-search-box__text-input[value="Past 24 hours"]');
            if (selectedText) {
                selectedText.value = `Past ${selectedFilter.label}`;
            }
            const selectedLabel = timeFilterContainer.querySelector('.artdeco-pill--selected .selected-text');
            if (selectedLabel) {
                selectedLabel.textContent = `Past ${selectedFilter.label}`;
            }
            const selectedInput = timeFilterContainer.querySelector(`input[value="${currentTimeFilter}"]`);
            if (selectedInput) {
                const labelSpan = selectedInput.closest('label')?.querySelector('.t-14');
                if (labelSpan) {
                    labelSpan.textContent = `Past ${selectedFilter.label}`;
                }
                const hiddenSpan = selectedInput.closest('label')?.querySelector('.visually-hidden');
                if (hiddenSpan) {
                    hiddenSpan.textContent = `Filter by Past ${selectedFilter.label}`;
                }
            }
        }
    }

    customTimeFilters.forEach(filter => {
        if (filterList.querySelector(`input[value="r${filter.value}"]`)) {
            return;
        }
        const listItem = document.createElement('li');
        listItem.className = 'search-reusables__collection-values-item';
        
        const input = document.createElement('input');
        input.name = 'date-posted-filter-value';
        input.id = `timePostedRange-r${filter.value}`;
        input.className = 'search-reusables__select-input';
        input.type = 'radio';
        input.value = `r${filter.value}`;

        const label = document.createElement('label');
        label.setAttribute('for', `timePostedRange-r${filter.value}`);
        label.className = 'search-reusables__value-label';

        const paragraph = document.createElement('p');
        paragraph.className = 'display-flex';

        const visibleSpan = document.createElement('span');
        visibleSpan.className = 't-14 t-black--light t-normal';
        visibleSpan.setAttribute('aria-hidden', 'true');
        visibleSpan.textContent = `Past ${filter.label}`;

        const hiddenSpan = document.createElement('span');
        hiddenSpan.className = 'visually-hidden';
        hiddenSpan.textContent = `Filter by Past ${filter.label}`;

        const emptyComment = document.createComment('');

        paragraph.appendChild(visibleSpan);
        paragraph.appendChild(hiddenSpan);
        paragraph.appendChild(emptyComment);

        label.appendChild(paragraph);
        
        listItem.appendChild(input);
        listItem.appendChild(label);
        listItem.appendChild(document.createComment(''));

        input.addEventListener('click', () => {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('start');
            currentUrl.searchParams.set('f_TPR', `r${filter.value}`);
            
            localStorage.setItem('selectedTimeFilter', filter.label);
            
            window.location.href = currentUrl.toString();
        });

        filterList.insertBefore(listItem, filterList.firstChild);
    });

    const storedFilter = localStorage.getItem('selectedTimeFilter');
    if (storedFilter) {
        const selectedTexts = document.querySelectorAll('.jobs-search-box__text-input');
        selectedTexts.forEach(text => {
            if (text.value === 'Past 24 hours') {
                text.value = `Past ${storedFilter}`;
            }
        });

        const selectedLabel = timeFilterContainer.querySelector('.artdeco-pill--selected .selected-text');
        if (selectedLabel) {
            selectedLabel.textContent = `Past ${storedFilter}`;
        }

        localStorage.removeItem('selectedTimeFilter');
    }
}

function initializeExtension() {
    addCustomTimeFilters();

    const observer = new MutationObserver((mutations) => {
        const hasRelevantChanges = mutations.some(mutation => {
            return Array.from(mutation.addedNodes).some(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) return false;
                
                if (node.classList?.contains('jobs-search-results-list')) {
                    return true;
                }
                
                if (node.querySelector?.('div[data-basic-filter-parameter-name="timePostedRange"]')) {
                    return true;
                }

                return false;
            });
        });

        if (hasRelevantChanges) {
            addCustomTimeFilters();
            setTimeout(() => {
                addCustomTimeFilters();
            }, 500);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(() => {
                addCustomTimeFilters();
            }, 1000);
        }
    }).observe(document, { subtree: true, childList: true });

    document.addEventListener('click', (e) => {
        const isPaginationButton = e.target.closest('.artdeco-pagination__button') ||
                                 e.target.closest('.artdeco-pagination__indicator');
        if (isPaginationButton) {
            setTimeout(() => {
                addCustomTimeFilters();
            }, 1000);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    initializeExtension();
} 