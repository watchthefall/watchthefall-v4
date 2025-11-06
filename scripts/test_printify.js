#!/usr/bin/env node
// Test Printify API Connection
// Run this to verify your API key and get your Shop ID

import 'dotenv/config';

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_API_BASE = 'https://api.printify.com/v1';

if (!PRINTIFY_API_KEY) {
    console.error('❌ PRINTIFY_API_KEY not found in environment');
    console.error('   Create a .env file with your Printify API key');
    process.exit(1);
}

async function testConnection() {
    try {
        console.log('🔍 Testing Printify API connection...\n');
        
        // Get shops
        const response = await fetch(`${PRINTIFY_API_BASE}/shops.json`, {
            headers: {
                'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const shops = await response.json();
        
        console.log('✅ Connection successful!\n');
        console.log(`📊 Found ${shops.length} shop(s):\n`);
        
        shops.forEach((shop, index) => {
            console.log(`${index + 1}. ${shop.title}`);
            console.log(`   Shop ID: ${shop.id}`);
            console.log(`   Platform: ${shop.sales_channel || 'N/A'}`);
            console.log('');
        });

        if (shops.length > 0) {
            console.log('💡 To use in your .env file:');
            console.log(`   PRINTIFY_SHOP_ID=${shops[0].id}\n`);
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
