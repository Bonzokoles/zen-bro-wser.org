#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const appRoot = path.join(__dirname, '..', 'ZENO_WEB_CORE_APP');
const templatePath = path.join(appRoot, '.env.template');
const envPath = path.join(appRoot, '.env');

async function main() {
  if (!await fs.pathExists(templatePath)) {
    console.error('❌ Missing .env.template file.');
    process.exit(1);
  }

  if (await fs.pathExists(envPath)) {
    console.log('ℹ️  .env file already exists – leaving it untouched.');
    return;
  }

  await fs.copy(templatePath, envPath);
  console.log('✅ Created ZENO_WEB_CORE_APP/.env from template.');
  console.log('   Fill in your API keys before running the application.');
}

main().catch(error => {
  console.error('❌ Failed to set up environment file:', error.message);
  process.exit(1);
});
