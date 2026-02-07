#!/usr/bin/env node
/**
 * Production Auth Configuration Checker
 * 
 * This script helps diagnose production authentication issues by checking
 * if all required environment variables are properly configured.
 * 
 * Usage:
 *   node scripts/check-production-auth.js
 * 
 * Or add to package.json:
 *   "check:prod-auth": "node scripts/check-production-auth.js"
 */

const https = require('https');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvVar(name, required = true, validators = []) {
  const value = process.env[name];
  const exists = !!value;
  
  if (!exists && required) {
    log(`❌ ${name}: MISSING (REQUIRED)`, colors.red);
    return false;
  } else if (!exists && !required) {
    log(`⚠️  ${name}: Not set (optional)`, colors.yellow);
    return true;
  }
  
  // Run validators
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      log(`❌ ${name}: ${result.message}`, colors.red);
      return false;
    }
  }
  
  // Truncate sensitive values
  const displayValue = name.includes('SECRET') || name.includes('KEY')
    ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
    : value.length > 50
    ? `${value.substring(0, 47)}...`
    : value;
  
  log(`✅ ${name}: ${displayValue}`, colors.green);
  return true;
}

// Validators
const validators = {
  isUrl: (value) => {
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, message: 'Not a valid URL' };
    }
  },
  
  isHttpsUrl: (value) => {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') {
        return { valid: false, message: 'Must use HTTPS in production' };
      }
      return { valid: true };
    } catch {
      return { valid: false, message: 'Not a valid URL' };
    }
  },
  
  isGoogleClientId: (value) => {
    if (!value.endsWith('.apps.googleusercontent.com')) {
      return { valid: false, message: 'Should end with .apps.googleusercontent.com' };
    }
    return { valid: true };
  },
  
  isGoogleSecret: (value) => {
    if (!value.startsWith('GOCSPX-')) {
      return { valid: false, message: 'Should start with GOCSPX-' };
    }
    if (value.length < 35) {
      return { valid: false, message: 'Should be at least 35 characters' };
    }
    return { valid: true };
  },
  
  isPostgresUrl: (value) => {
    if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
      return { valid: false, message: 'Should start with postgresql:// or postgres://' };
    }
    return { valid: true };
  },
  
  minLength: (min) => (value) => {
    if (value.length < min) {
      return { valid: false, message: `Should be at least ${min} characters (got ${value.length})` };
    }
    return { valid: true };
  },
};

async function checkProductionUrl(url) {
  log('\n📡 Checking Production URL Accessibility...', colors.blue);
  
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: '/api/auth/signin',
      method: 'HEAD',
      timeout: 5000,
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 405 || res.statusCode === 302) {
        log(`✅ ${url} is accessible (status: ${res.statusCode})`, colors.green);
        resolve(true);
      } else {
        log(`⚠️  ${url} returned status: ${res.statusCode}`, colors.yellow);
        resolve(true);
      }
    });
    
    req.on('error', (error) => {
      log(`❌ Cannot reach ${url}: ${error.message}`, colors.red);
      resolve(false);
    });
    
    req.on('timeout', () => {
      log(`❌ Timeout reaching ${url}`, colors.red);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  log('🔐 Production Auth Configuration Checker', colors.cyan);
  log('=========================================\n', colors.cyan);
  
  // Core Auth Variables
  log('📋 Core Authentication:', colors.blue);
  // Check both AUTH_SECRET and NEXTAUTH_SECRET (either one is acceptable)
  const hasAuthSecret = checkEnvVar('AUTH_SECRET', false, [validators.minLength(32)]);
  const hasNextAuthSecret = checkEnvVar('NEXTAUTH_SECRET', false, [validators.minLength(32)]);
  
  // At least one must be set
  const hasAnySecret = hasAuthSecret || hasNextAuthSecret;
  if (!hasAnySecret) {
    log('❌ Either AUTH_SECRET or NEXTAUTH_SECRET must be set (REQUIRED)', colors.red);
  }
  
  log('\n📍 Base URLs:', colors.blue);
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  checkEnvVar('AUTH_URL', false, process.env.NODE_ENV === 'production' ? [validators.isHttpsUrl] : [validators.isUrl]);
  checkEnvVar('NEXTAUTH_URL', false, process.env.NODE_ENV === 'production' ? [validators.isHttpsUrl] : [validators.isUrl]);
  
  if (!authUrl) {
    log('❌ Either AUTH_URL or NEXTAUTH_URL must be set', colors.red);
  }
  
  // Google OAuth
  log('\n🔑 Google OAuth:', colors.blue);
  checkEnvVar('AUTH_GOOGLE_ID', false, [validators.isGoogleClientId]);
  checkEnvVar('GOOGLE_CLIENT_ID', false, [validators.isGoogleClientId]);
  checkEnvVar('AUTH_GOOGLE_SECRET', false, [validators.isGoogleSecret]);
  checkEnvVar('GOOGLE_CLIENT_SECRET', false, [validators.isGoogleSecret]);
  
  // Database
  log('\n💾 Database:', colors.blue);
  checkEnvVar('DATABASE_URL', true, [validators.isPostgresUrl]);
  
  // Check production URL if in production
  if (authUrl && process.env.NODE_ENV === 'production') {
    await checkProductionUrl(authUrl);
  }
  
  // Summary
  log('\n📊 Summary:', colors.cyan);
  const issues = [];
  
  if (!hasAnySecret) {
    issues.push('Missing AUTH_SECRET or NEXTAUTH_SECRET (REQUIRED)');
  }
  
  if (!authUrl) {
    issues.push('Missing AUTH_URL or NEXTAUTH_URL');
  }
  
  const hasGoogleId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
  const hasGoogleSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  
  if (!hasGoogleId || !hasGoogleSecret) {
    issues.push('Google OAuth credentials incomplete (OAuth login will not work)');
  }
  
  if (!process.env.DATABASE_URL) {
    issues.push('Missing DATABASE_URL');
  }
  
  if (issues.length === 0) {
    log('✅ All critical configuration looks good!', colors.green);
    log('\n💡 Next steps:', colors.cyan);
    log('   1. Deploy to Vercel: vercel deploy --prod', colors.reset);
    log('   2. Test login at: ' + (authUrl || 'https://your-domain.com') + '/login', colors.reset);
    log('   3. Check logs if issues persist: vercel logs', colors.reset);
  } else {
    log('❌ Configuration issues found:', colors.red);
    issues.forEach(issue => log(`   - ${issue}`, colors.red));
    log('\n💡 Fix these issues before deploying:', colors.cyan);
    log('   1. Set missing variables in Vercel: vercel env add <VAR_NAME>', colors.reset);
    log('   2. Or update .env.local for local testing', colors.reset);
    log('   3. See docs/PRODUCTION_LOGIN_TROUBLESHOOTING.md for help', colors.reset);
    process.exit(1);
  }
}

// Run the checker
main().catch(error => {
  log(`\n❌ Error running checker: ${error.message}`, colors.red);
  process.exit(1);
});
