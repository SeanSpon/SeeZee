#!/usr/bin/env ts-node
/**
 * Check environment variables for encoding issues
 * Run: npx ts-node scripts/check-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const envLocalPath = path.join(process.cwd(), '.env.local');

console.log('🔍 Checking .env.local file...\n');

if (!fs.existsSync(envLocalPath)) {
  console.error('❌ .env.local file not found!');
  console.log('   Create it in the project root with your environment variables.\n');
  process.exit(1);
}

const content = fs.readFileSync(envLocalPath, 'utf-8');
const lines = content.split('\n');

let issuesFound = false;
let issues: string[] = [];

console.log('📋 Checking each variable...\n');

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }
  
  // Check if line has = sign
  if (!trimmed.includes('=')) {
    issues.push(`Line ${index + 1}: Missing '=' sign`);
    issuesFound = true;
    return;
  }
  
  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('='); // In case value contains =
  
  // Check for common encoding issues
  if (value.includes('EaLA=')) {
    issues.push(`Line ${index + 1}: ${key} has 'EaLA=' encoding - REMOVE IT`);
    issuesFound = true;
  }
  
  // Check for trailing spaces
  if (value.endsWith(' ') || key.endsWith(' ')) {
    issues.push(`Line ${index + 1}: ${key} has trailing spaces`);
    issuesFound = true;
  }
  
  // Check for base64 padding (likely encoding issue)
  if (/[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length > 20 && value.endsWith('=')) {
    issues.push(`Line ${index + 1}: ${key} might have base64 encoding - check the value`);
    issuesFound = true;
  }
  
  // Check if value is empty
  if (!value || value.trim() === '') {
    issues.push(`Line ${index + 1}: ${key} has no value`);
    issuesFound = true;
  }
});

if (issuesFound) {
  console.error('❌ Issues found in .env.local:\n');
  issues.forEach(issue => console.error(`   - ${issue}`));
  console.log('\n📝 Fix these issues and try again.\n');
  process.exit(1);
} else {
  console.log('✅ No obvious issues found in .env.local!\n');
  console.log('💡 Make sure your values are correct and restart your dev server.\n');
}


