// =====================================================================
// WatchTheFall v4 - Printify Integration & Product Sync
// =====================================================================

(function() {
    'use strict';
    
    // Printify API configuration (requires .env setup)
    const PRINTIFY_API_URL = 'https://api.printify.com/v1';
    
    async function loadPrintifyProducts() {
        const grid = document.getElementById('products-grid') || document.getElementById('printify-preview');
        if (!grid) return;
        
        try {
            // Try to load from cached data first
            const response = await fetch('data/brands.json');
            
            if (response.ok) {
                const data = await response.json();
                displayProducts(data.products || [], grid);
                displayBrandLinks(data.brandLinks || []);
                return;
            }
            
            // If no cache, show placeholder
            showPlaceholderProducts(grid);
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            showPlaceholderProducts(grid);
        }
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
