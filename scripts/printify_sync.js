// =====================================================================
// WatchTheFall v4.4 - WTF Creations Shop Integration (Enhanced)
// Features: Live Printify sync, sorting, filtering, fade-in animations
// =====================================================================

(function() {
    'use strict';
    
    // Printify store URL
    const PRINTIFY_STORE_URL = 'https://watchthefall.printify.me';
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    
    let allProducts = [];
    let currentFilter = 'all';
    let currentSort = 'recommended';
    
    async function loadPrintifyProducts() {
        const grid = document.getElementById('products-grid') || document.getElementById('printify-preview');
        const errorContainer = document.getElementById('products-error');
        
        if (!grid) return;
        
        try {
            // Load from synced data
            const response = await fetchWithRetry('data/brands.json');
            
            if (response.ok) {
                const data = await response.json();
                allProducts = data.products || [];
                
                if (allProducts.length > 0) {
                    displayProducts(allProducts, grid);
                    displayBrandLinks(data.brandLinks || []);
                    setupSortAndFilter();
                    console.log(`✅ WTF Creations feed loaded | ${allProducts.length} products`);
                    return;
                }
            }
            
            // Fallback: Fetch directly from Printify store
            console.warn('⚠️ No local data, attempting live fetch from Printify...');
            await fetchLiveFromPrintify(grid);
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            showError(grid, errorContainer);
        }
    }
    
    async function fetchLiveFromPrintify(grid) {
        try {
            // Scrape products from public Printify storefront
            // Note: This is a simplified approach - in production you'd use the Printify API
            const response = await fetch(PRINTIFY_STORE_URL);
            if (!response.ok) throw new Error('Failed to fetch from Printify store');
            
            // For now, show placeholder if live fetch isn't configured
            console.log('🔄 Live Printify sync requires API configuration');
            showPlaceholderProducts(grid);
            
        } catch (error) {
            console.error('❌ Live fetch failed:', error);
            showPlaceholderProducts(grid);
        }
    }
    
    async function fetchWithRetry(url, options = {}) {
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) return response;
                
                console.warn(`⚠️ Fetch attempt ${i + 1} failed, retrying...`);
                await sleep(RETRY_DELAY * (i + 1));
                
            } catch (error) {
                if (i === MAX_RETRIES - 1) throw error;
                console.warn(`⚠️ Fetch error on attempt ${i + 1}:`, error.message);
                await sleep(RETRY_DELAY * (i + 1));
            }
        }
        throw new Error('Max retries reached');
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function displayProducts(products, container) {
        if (products.length === 0) {
            showPlaceholderProducts(container);
            return;
        }
        
        // Apply current filter and sort
        let filteredProducts = filterProductsByCategory(products, currentFilter);
        filteredProducts = sortProducts(filteredProducts, currentSort);
        
        // Limit to 6 for preview, show all for full shop page
        const isPreview = container.id === 'printify-preview';
        const displayProducts = isPreview ? filteredProducts.slice(0, 6) : filteredProducts;
        
        container.innerHTML = displayProducts.map((product, index) => `
            <div class="product-card" 
                 data-category="${product.category || 'apparel'}"
                 data-price="${product.price}"
                 style="animation-delay: ${index * 0.1}s">
                <div class="product-image-wrapper">
                    <img src="${product.image}" 
                         alt="${product.title}" 
                         class="product-image"
                         loading="lazy"
                         onload="this.classList.add('loaded')">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">$${product.price}</p>
                    <a href="${product.url}" 
                       class="btn btn-primary product-btn" 
                       target="_blank" 
                       rel="noopener noreferrer">
                        View Product
                    </a>
                </div>
            </div>
        `).join('');
        
        // Trigger fade-in animation
        setTimeout(() => {
            container.querySelectorAll('.product-card').forEach(card => {
                card.classList.add('fade-in');
            });
        }, 50);
        
        console.log(`✅ Displayed ${displayProducts.length} products`);
    }
    
    function filterProductsByCategory(products, category) {
        if (category === 'all') return products;
        return products.filter(p => p.category === category);
    }
    
    function sortProducts(products, sortType) {
        const sorted = [...products];
        
        switch(sortType) {
            case 'price-low':
                return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            case 'price-high':
                return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            case 'newest':
                return sorted.reverse(); // Assumes products are already in chronological order
            case 'recommended':
            default:
                return sorted;
        }
    }
    
    function setupSortAndFilter() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                
                const grid = document.getElementById('products-grid');
                if (grid && allProducts.length > 0) {
                    displayProducts(allProducts, grid);
                }
            });
        });
        
        // Sort dropdown
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                
                const grid = document.getElementById('products-grid');
                if (grid && allProducts.length > 0) {
                    displayProducts(allProducts, grid);
                }
            });
        }
    }
    
    function showPlaceholderProducts(container) {
        const placeholders = [
            {
                title: 'WTF Classic Tee',
                price: '24.99',
                image: 'assets/logos/wtf-logo.png',
                url: PRINTIFY_STORE_URL,
                category: 'apparel'
            },
            {
                title: 'Dystopian Hoodie',
                price: '49.99',
                image: 'assets/logos/wtf-logo.png',
                url: PRINTIFY_STORE_URL,
                category: 'apparel'
            },
            {
                title: 'Fall Observer Cap',
                price: '19.99',
                image: 'assets/logos/wtf-logo.png',
                url: PRINTIFY_STORE_URL,
                category: 'accessories'
            },
            {
                title: 'Collapse Mug',
                price: '14.99',
                image: 'assets/logos/wtf-logo.png',
                url: PRINTIFY_STORE_URL,
                category: 'home'
            },
            {
                title: 'WTF Poster',
                price: '29.99',
                image: 'assets/logos/wtf-logo.png',
                url: PRINTIFY_STORE_URL,
                category: 'home'
            },
            {
                title: 'Society Watch Tote',
                price: '18.99',
                image: 'assets/logos/wtf-logo.png',
                url: PRINTIFY_STORE_URL,
                category: 'accessories'
            }
        ];
        
        allProducts = placeholders;
        displayProducts(placeholders, container);
        console.log('ℹ️ Displaying placeholder products - configure Printify sync for live data');
    }
    
    function showError(grid, errorContainer) {
        if (grid) grid.style.display = 'none';
        if (errorContainer) errorContainer.style.display = 'block';
    }
    
    function displayBrandLinks(links) {
        const container = document.getElementById('printify-brand-links');
        if (!container || links.length === 0) return;
        
        container.innerHTML = links.map(link => `
            <a href="${link.url}" 
               class="btn btn-secondary" 
               target="_blank" 
               rel="noopener noreferrer">
                ${link.name}
            </a>
        `).join('');
    }
    
    // Expose function globally
    window.loadPrintifyProducts = loadPrintifyProducts;
    
    // Auto-load on page load
    const previewContainer = document.getElementById('printify-preview');
    const shopContainer = document.getElementById('products-grid');
    
    if (previewContainer || shopContainer) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadPrintifyProducts);
        } else {
            loadPrintifyProducts();
        }
    }
})();
