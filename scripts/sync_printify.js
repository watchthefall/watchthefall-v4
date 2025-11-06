#!/usr/bin/env node
// =====================================================================
// Printify Product Sync Script
// Fetches products from Printify API and updates data/brands.json
// =====================================================================

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_BASE = 'https://api.printify.com/v1';

if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
    console.error('❌ Missing Printify credentials');
    console.error('   Required: PRINTIFY_API_KEY and PRINTIFY_SHOP_ID');
    process.exit(1);
}

async function fetchPrintifyProducts() {
    try {
        console.log('🔄 Fetching products from Printify...');
        
        const response = await fetch(
            `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json`,
            {
                headers: {
                    'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
        }

        const { data: products } = await response.json();
        console.log(`✅ Fetched ${products.length} products from Printify`);

        return products;

    } catch (error) {
        console.error('❌ Failed to fetch products:', error.message);
        throw error;
    }
}

function transformProduct(product) {
    // Get the first image
    const image = product.images?.[0]?.src || 'assets/logos/wtf-logo.png';
    
    // Get the lowest price variant
    const prices = product.variants?.map(v => parseFloat(v.price)) || [0];
    const minPrice = Math.min(...prices);
    
    // Determine category from tags
    let category = 'apparel';
    if (product.tags?.some(tag => tag.toLowerCase().includes('home'))) {
        category = 'home';
    } else if (product.tags?.some(tag => tag.toLowerCase().includes('access'))) {
        category = 'accessories';
    }

    return {
        title: product.title,
        price: (minPrice / 100).toFixed(2), // Printify prices are in cents
        category: category,
        image: image,
        url: `https://watchthefall.printify.me/product/${product.id}` // Adjust to your store URL
    };
}

async function syncProducts() {
    try {
        const products = await fetchPrintifyProducts();
        
        // Transform products to our format
        const transformedProducts = products
            .filter(p => p.visible && p.is_locked === false) // Only published products
            .map(transformProduct);

        // Create brands.json structure
        const brandsData = {
            products: transformedProducts,
            brandLinks: [
                {
                    name: 'Visit WTF Creations Store',
                    url: 'https://watchthefall.printify.me'
                }
            ]
        };

        // Write to data/brands.json
        const dataPath = path.join(__dirname, '..', 'data', 'brands.json');
        fs.writeFileSync(dataPath, JSON.stringify(brandsData, null, 2), 'utf-8');

        console.log(`✅ Successfully synced ${transformedProducts.length} products to ${dataPath}`);
        console.log('📦 Products updated in data/brands.json');

    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        process.exit(1);
    }
}

// Run the sync
syncProducts();
