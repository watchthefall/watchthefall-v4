// =====================================================================
// WatchTheFall v4.2 - Printify Integration & Product Sync (Enhanced)
// Features: Retry logic, error handling, offline fallback
// =====================================================================

(function() {
    'use strict';
    
    // Printify API configuration
    const PRINTIFY_API_URL = 'https://api.printify.com/v1';
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    
    let retryCount = 0;
    
    async function loadPrintifyProducts() {
        const grid = document.getElementById('products-grid') || document.getElementById('printify-preview');
        if (!grid) return;
        
        try {
            // Load from synced data with retry
            const response = await fetchWithRetry('data/brands.json');
            
            if (response.ok) {
                const data = await response.json();
                const products = data.products || [];
                
                if (products.length > 0) {
                    displayProducts(products, grid);
                    displayBrandLinks(data.brandLinks || []);
                    console.log(`✅ Loaded ${products.length} Printify products`);
                    console.log('Printify Sync OK');
                    return;
                }
            }
            
            // If no products, show placeholder
            console.warn('⚠️ No products found, using offline catalog');
            showPlaceholderProducts(grid);
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            console.log('⚠️ Falling back to offline_catalog mode');
            showPlaceholderProducts(grid);
        }
    }
    
    async function fetchWithRetry(url, options = {}) {
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) return response;
                
                console.warn(`⚠️ Fetch attempt ${i + 1} failed, retrying...`);
                await sleep(RETRY_DELAY * (i + 1)); // Exponential backoff
                
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
        
        // Limit to 6 products for preview, all for full page
        const isPreview = container.id === 'printify-preview';
        const displayProducts = isPreview ? products.slice(0, 6) : products;
        
        container.innerHTML = displayProducts.map(product => `
            <div class="product-card" data-category="${product.category || 'apparel'}">
                <img src="${product.image}" alt="${product.title}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-price">$${product.price}</p>
                    <a href="${product.url}" class="btn btn-primary" target="_blank" style="width: 100%; margin-top: 1rem;">
                        View Product
                    </a>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Products loaded:', displayProducts.length, 'items');
    }
    
    function showPlaceholderProducts(container) {
        const placeholders = [
            {
                title: 'WTF Classic Tee',
                price: '24.99',
                image: 'assets/logos/wtf-logo.png',
                url: '#',
                category: 'apparel'
            },
            {
                title: 'Dystopian Hoodie',
                price: '49.99',
                image: 'assets/logos/wtf-logo.png',
                url: '#',
                category: 'apparel'
            },
            {
                title: 'Fall Observer Cap',
                price: '19.99',
                image: 'assets/logos/wtf-logo.png',
                url: '#',
                category: 'accessories'
            }
        ];
        
        displayProducts(placeholders, container);
        console.log('ℹ️ Displaying placeholder products');
    }
    
    function displayBrandLinks(links) {
        const container = document.getElementById('printify-brand-links');
        if (!container || links.length === 0) return;
        
        container.innerHTML = links.map(link => `
            <a href="${link.url}" 
               class="btn btn-secondary" 
               target="_blank" 
               rel="noopener noreferrer"
               style="margin: 0.5rem;">
                ${link.name}
            </a>
        `).join('');
    }
    
    // Expose function globally for use in HTML
    window.loadPrintifyProducts = loadPrintifyProducts;
    
    // Auto-load on homepage preview
    const previewContainer = document.getElementById('printify-preview');
    if (previewContainer) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadPrintifyProducts);
        } else {
            loadPrintifyProducts();
        }
    }
})();
