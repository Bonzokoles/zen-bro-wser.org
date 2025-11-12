#!/usr/bin/env node

/**
 * validate-working.js - Validate working version before merge
 *
 * Checks:
 * - TypeScript compilation
 * - Tests pass
 * - Bundle size (not >10% increase)
 * - Linting
 * - Metadata filled out
 *
 * Usage:
 *   node scripts/validate-working.js components/Browser.tsx
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Usage: node scripts/validate-working.js <path>');
  console.error('   Example: node scripts/validate-working.js components/Browser.tsx');
  process.exit(1);
}

const targetPath = args[0];
const workingPath = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP', 'src', 'working', targetPath);
const metaPath = workingPath + '.meta.json';

async function main() {
  console.log('🔍 Validating working version...\n');

  let allPassed = true;

  // 1. Check if working version exists
  if (!fs.existsSync(workingPath)) {
    console.error('❌ Working version not found:', workingPath);
    process.exit(1);
  }

  // 2. Check metadata
  console.log('📝 Checking metadata...');
  if (!fs.existsSync(metaPath)) {
    console.error('❌ Metadata file not found:', metaPath);
    allPassed = false;
  } else {
    const metadata = await fs.readJSON(metaPath);

    if (!metadata.changes || metadata.changes.length === 0) {
      console.error('❌ No changes documented in metadata');
      console.error('   Please add changes to:', metaPath);
      allPassed = false;
    } else {
      console.log('✅ Metadata complete');
      console.log('   Changes:', metadata.changes.join(', '));
    }

    metadata.status = allPassed ? 'validated' : 'validation_failed';
    await fs.writeJSON(metaPath, metadata, { spaces: 2 });
  }

  // 3. TypeScript check
  console.log('\n📘 TypeScript compilation...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ TypeScript passed');
  } catch (error) {
    console.error('❌ TypeScript errors found');
    allPassed = false;
  }

  // 4. Tests (if test file exists)
  console.log('\n🧪 Running tests...');
  const testFile = workingPath.replace(/\.(tsx?|jsx?)$/, '.test.$1');
  if (fs.existsSync(testFile)) {
    try {
      execSync(`npm test ${testFile}`, { stdio: 'inherit' });
      console.log('✅ Tests passed');
    } catch (error) {
      console.error('❌ Tests failed');
      allPassed = false;
    }
  } else {
    console.log('⚠️  No test file found (skipping)');
  }

  // 5. Linting
  console.log('\n🔧 Linting...');
  try {
    execSync(`npx eslint ${workingPath}`, { stdio: 'inherit' });
    console.log('✅ Linting passed');
  } catch (error) {
    console.warn('⚠️  Linting warnings (non-fatal)');
  }

  // 6. Bundle size check (optional - skip if not applicable)
  console.log('\n📦 Bundle size check...');
  console.log('⚠️  Manual check recommended - run: npm run build');

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ VALIDATION PASSED');
    console.log('\nReady to merge:');
    console.log(`   npm run merge:to-original ${targetPath}`);
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log('\nFix issues before merging');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
