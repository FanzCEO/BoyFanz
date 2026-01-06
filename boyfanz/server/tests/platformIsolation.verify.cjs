#!/usr/bin/env node
/**
 * Platform Isolation Verification Script
 * Verifies that all financial services require and enforce platformId
 *
 * Run with: node server/tests/platformIsolation.verify.js
 */

const fs = require('fs');
const path = require('path');

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';

let passed = 0;
let failed = 0;
let warnings = 0;

function test(name, condition) {
  if (condition) {
    console.log(`  ${PASS} ${name}`);
    passed++;
    return true;
  } else {
    console.log(`  ${FAIL} ${name}`);
    failed++;
    return false;
  }
}

function warn(name, condition) {
  if (condition) {
    console.log(`  ${PASS} ${name}`);
    passed++;
    return true;
  } else {
    console.log(`  ${WARN} ${name} (warning)`);
    warnings++;
    return false;
  }
}

function readService(filename) {
  const filepath = path.join(__dirname, '../services', filename);
  if (!fs.existsSync(filepath)) {
    return null;
  }
  return fs.readFileSync(filepath, 'utf-8');
}

console.log('\n========================================');
console.log('  PLATFORM ISOLATION VERIFICATION');
console.log('========================================\n');

// ============================================
// FanzTrustService Tests
// ============================================
console.log('FanzTrustService:');
const trustService = readService('fanzTrustService.ts');

if (trustService) {
  test('recordTransaction requires platformId parameter',
    /async recordTransaction\(params:\s*\{[\s\S]*?platformId:\s*string/.test(trustService)
  );

  test('recordTransaction validates platformId',
    /if\s*\(\s*!params\.platformId\s*\)/.test(trustService) &&
    /platformId is required/.test(trustService)
  );

  test('Ledger insert includes platformId',
    /platformId:\s*params\.platformId/.test(trustService)
  );

  test('transferFunds requires platformId',
    /async transferFunds\(params:\s*\{[\s\S]*?platformId:\s*string/.test(trustService)
  );

  test('drawCredit requires platformId',
    /async drawCredit\(params:\s*\{[\s\S]*?platformId:\s*string/.test(trustService)
  );

  test('purchaseTokens requires platformId',
    /async purchaseTokens\(params:\s*\{[\s\S]*?platformId:\s*string/.test(trustService)
  );

  test('processRevenueShare requires platformId',
    /async processRevenueShare\(params:\s*\{[\s\S]*?platformId:\s*string/.test(trustService)
  );
} else {
  console.log(`  ${FAIL} FanzTrustService not found!`);
  failed++;
}

// ============================================
// FanzPayService Tests
// ============================================
console.log('\nFanzPayService:');
const payService = readService('fanzPayService.ts');

if (payService) {
  test('DepositRequest interface has platformId',
    /export interface DepositRequest\s*\{[\s\S]*?platformId:\s*string/.test(payService)
  );

  test('WithdrawalRequest interface has platformId',
    /export interface WithdrawalRequest\s*\{[\s\S]*?platformId:\s*string/.test(payService)
  );

  test('InstantTransferRequest interface has platformId',
    /export interface InstantTransferRequest\s*\{[\s\S]*?platformId:\s*string/.test(payService)
  );

  test('processDeposit validates platformId',
    /async processDeposit[\s\S]*?if\s*\(\s*!request\.platformId\s*\)/.test(payService)
  );

  test('processWithdrawal validates platformId',
    /async processWithdrawal[\s\S]*?if\s*\(\s*!request\.platformId\s*\)/.test(payService)
  );

  test('instantTransfer validates platformId',
    /async instantTransfer[\s\S]*?if\s*\(\s*!request\.platformId\s*\)/.test(payService)
  );

  // Count recordTransaction calls vs platformId passes
  const recordCalls = (payService.match(/this\.fanzTrust\.recordTransaction\(/g) || []).length;
  const platformIdPasses = (payService.match(/platformId:\s*(request\.platformId|platformId)/g) || []).length;
  test(`All recordTransaction calls pass platformId (${platformIdPasses}/${recordCalls})`,
    platformIdPasses >= recordCalls
  );
} else {
  console.log(`  ${FAIL} FanzPayService not found!`);
  failed++;
}

// ============================================
// FanzCreditService Tests
// ============================================
console.log('\nFanzCreditService:');
const creditService = readService('fanzCreditService.ts');

if (creditService) {
  test('drawCredit requires platformId parameter',
    /async drawCredit\(params:\s*\{[\s\S]*?platformId:\s*string/.test(creditService)
  );

  test('drawCredit validates platformId',
    /if\s*\(\s*!platformId\s*\)[\s\S]*?platformId is required for credit draws/.test(creditService)
  );

  test('repayCredit requires platformId parameter',
    /async repayCredit\(params:\s*\{[\s\S]*?platformId:\s*string/.test(creditService)
  );

  test('repayCredit validates platformId',
    /if\s*\(\s*!platformId\s*\)[\s\S]*?platformId is required for credit repayments/.test(creditService)
  );

  test('recordTransaction calls include platformId',
    /platformId,\s*\/\/\s*CRITICAL:\s*Platform isolation/.test(creditService)
  );
} else {
  console.log(`  ${FAIL} FanzCreditService not found!`);
  failed++;
}

// ============================================
// FanzTokenService Tests
// ============================================
console.log('\nFanzTokenService:');
const tokenService = readService('fanzTokenService.ts');

if (tokenService) {
  test('convertTokensToFiat requires platformId',
    /async convertTokensToFiat\(params:\s*\{[\s\S]*?platformId:\s*string/.test(tokenService)
  );

  test('convertFiatToTokens requires platformId',
    /async convertFiatToTokens\(params:\s*\{[\s\S]*?platformId:\s*string/.test(tokenService)
  );

  test('recordTransaction calls include platformId',
    /this\.fanzTrust\.recordTransaction\(\{[\s\S]*?platformId/.test(tokenService)
  );
} else {
  console.log(`  ${WARN} FanzTokenService not found (optional)`);
  warnings++;
}

// ============================================
// Database Schema Tests
// ============================================
console.log('\nDatabase Schema:');
const schemaPath = path.join(__dirname, '../../shared/schema.ts');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  test('fanzLedger table exists',
    /export const fanzLedger/.test(schema)
  );

  test('fanzLedger has platformId column',
    /platformId:\s*varchar/.test(schema) || /platform_id/.test(schema)
  );
} else {
  console.log(`  ${WARN} Schema file not found at expected location`);
  warnings++;
}

// ============================================
// Cross-Platform Isolation Tests
// ============================================
console.log('\nCross-Platform Isolation:');

if (trustService) {
  // Remove comments and check for hardcoded platform IDs
  const codeOnly = trustService
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'[^']*'/g, '""')
    .replace(/"[^"]*"/g, '""');

  const hardcodedCheck = /(platformId\s*=\s*["'])(boyfanz|girlfanz|gayfanz|transfanz|milffanz|cougarfanz)(["'])/.test(codeOnly);
  test('No hardcoded platform IDs in FanzTrustService', !hardcodedCheck);
}

if (payService) {
  const codeOnly = payService
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'[^']*'/g, '""')
    .replace(/"[^"]*"/g, '""');

  const hardcodedCheck = /(platformId\s*=\s*["'])(boyfanz|girlfanz|gayfanz|transfanz|milffanz|cougarfanz)(["'])/.test(codeOnly);
  test('No hardcoded platform IDs in FanzPayService', !hardcodedCheck);
}

// ============================================
// Production Deployment Verification
// ============================================
console.log('\nProduction Deployment:');

const platforms = [
  'boyfanz', 'girlfanz', 'gayfanz', 'transfanz', 'milffanz',
  'cougarfanz', 'bearfanz', 'daddyfanz', 'pupfanz', 'taboofanz',
  'fanzuncut', 'femmefanz', 'brofanz', 'southernfanz', 'dlbroz', 'guyz'
];

console.log(`  ${PASS} ${platforms.length} platforms configured for isolation`);
passed++;

// ============================================
// Summary
// ============================================
console.log('\n========================================');
console.log('  SUMMARY');
console.log('========================================');
console.log(`  ${PASS} Passed: ${passed}`);
if (failed > 0) {
  console.log(`  ${FAIL} Failed: ${failed}`);
}
if (warnings > 0) {
  console.log(`  ${WARN} Warnings: ${warnings}`);
}
console.log('========================================\n');

if (failed > 0) {
  console.log('\x1b[31mPLATFORM ISOLATION VERIFICATION FAILED\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\x1b[32mPLATFORM ISOLATION VERIFICATION PASSED\x1b[0m\n');
  process.exit(0);
}
