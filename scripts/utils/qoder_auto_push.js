#!/usr/bin/env node
/**
 * Qoder Auto-Push Utility
 * Automatically commits and pushes changes to GitHub
 * Usage: node scripts/utils/qoder_auto_push.js [commit-message]
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultMessage = '🔁 Qoder Auto Commit (v4.2.1 sync)';
const commitMessage = process.argv[2] || defaultMessage;

function executeCommand(command, description) {
    try {
        console.log(`\n📝 ${description}...`);
        execSync(command, { stdio: 'inherit', cwd: path.resolve(__dirname, '../..') });
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        return false;
    }
}

function autoPush() {
    console.log('🔁 Qoder Auto-Push: Starting...\n');
    console.log('═'.repeat(50));
    
    // Check if there are changes
    try {
        const status = execSync('git status --porcelain', { 
            cwd: path.resolve(__dirname, '../..'),
            encoding: 'utf8' 
        });
        
        if (!status.trim()) {
            console.log('\n✅ No changes to commit. Repository is up to date.');
            return;
        }
        
        console.log('\n📊 Detected changes:\n');
        console.log(status);
        
    } catch (error) {
        console.error('❌ Error checking git status:', error.message);
        process.exit(1);
    }
    
    // Stage all changes
    if (!executeCommand('git add .', 'Staging all changes')) {
        process.exit(1);
    }
    
    // Commit changes
    if (!executeCommand(`git commit -m "${commitMessage}"`, 'Committing changes')) {
        console.log('⚠️  Nothing to commit or commit failed');
    }
    
    // Push to remote
    if (!executeCommand('git push origin main', 'Pushing to GitHub')) {
        console.error('\n❌ Push failed. Please check:');
        console.error('   1. Remote repository exists');
        console.error('   2. You have push permissions');
        console.error('   3. Branch name is correct (main)');
        process.exit(1);
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('✅ Repo successfully updated and pushed.');
    console.log('🚀 GitHub Actions will automatically deploy changes.');
}

// Execute
autoPush();
