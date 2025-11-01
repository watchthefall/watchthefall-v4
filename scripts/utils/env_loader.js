/**
 * env_loader.js
 * Loads environment variables securely from local .env (desktop) if present.
 * Prevents keys from ever being exposed in build artifacts.
 * 
 * IMPORTANT: This is for Node.js build scripts only, NOT for browser use.
 * For browser, use GitHub Secrets or server-side API.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try local .env first, fall back to workspace .env
const localEnvPath = "C:/Users/Jamie/OneDrive/Desktop/WatchTheFall_V4/.env";
const workspaceEnvPath = path.resolve(__dirname, '../../.env');

let envLoaded = false;

function loadEnv() {
    if (envLoaded) return;
    
    // Try local path first
    if (fs.existsSync(localEnvPath)) {
        const envContent = fs.readFileSync(localEnvPath, 'utf8');
        parseEnv(envContent);
        console.log('[SECURE] Local .env file loaded successfully.');
        envLoaded = true;
        return;
    }
    
    // Fall back to workspace path
    if (fs.existsSync(workspaceEnvPath)) {
        const envContent = fs.readFileSync(workspaceEnvPath, 'utf8');
        parseEnv(envContent);
        console.log('[SECURE] Workspace .env file loaded successfully.');
        envLoaded = true;
        return;
    }
    
    console.warn('[WARN] Local .env not found — using default template keys.');
}

function parseEnv(content) {
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        
        if (key && value) {
            process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
    }
}

// Load on import
loadEnv();

// Export environment variables
export const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY || '';
export const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID || '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Export loader function for manual use
export { loadEnv };
