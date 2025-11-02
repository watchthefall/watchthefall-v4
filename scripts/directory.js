// =====================================================================
// WatchTheFall v4 - Directory Expand/Collapse
// =====================================================================

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const categories = document.querySelectorAll('.directory-category');

        categories.forEach(category => {
            const header = category.querySelector('.category-header');
            const hubLinks = category.querySelector('.hub-links');
            const expandBtn = category.querySelector('.expand-btn');

            if (!header || !hubLinks || !expandBtn) return;

            header.addEventListener('click', function(e) {
                // Prevent link clicks from triggering expand
                if (e.target.tagName === 'A') return;

                // Toggle expanded state
                const isExpanded = category.classList.contains('expanded');
                
                if (isExpanded) {
                    category.classList.remove('expanded');
                    hubLinks.classList.add('collapsed');
                    expandBtn.textContent = '+';
                    expandBtn.setAttribute('aria-label', `Expand ${category.dataset.category} category`);
                } else {
                    category.classList.add('expanded');
                    hubLinks.classList.remove('collapsed');
                    expandBtn.textContent = '−';
                    expandBtn.setAttribute('aria-label', `Collapse ${category.dataset.category} category`);
                }
            });
        });

        console.log('✅ Directory expand/collapse initialized');
    });
})();
