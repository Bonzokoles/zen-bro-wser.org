#!/usr/bin/env node
/**
 * ZENO Browser - Linux AppImage Builder
 * 
 * Builds the Linux AppImage, .deb, .rpm, and .snap packages.
 * Supports x64 and arm64 architectures.
 * 
 * Usage:
 *   node scripts/build-appimage.js [--arch x64|arm64|both] [--target appimage|deb|rpm|snap|all]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Parse CLI args
const args = process.argv.slice(2);
const archArg = args.find(a => a.startsWith('--arch='))?.split('=')[1] || 'x64';
const targetArg = args.find(a => a.startsWith('--target='))?.split('=')[1] || 'appimage';

const ARCH_MAP = {
  'both': ['x64', 'arm64'],
  'x64': ['x64'],
  'arm64': ['arm64'],
};
const ARCHITECTURES = ARCH_MAP[archArg] || ['x64'];

const TARGET_MAP = {
  'all': ['AppImage', 'deb', 'rpm'],
  'appimage': ['AppImage'],
  'deb': ['deb'],
  'rpm': ['rpm'],
  'snap': ['snap'],
};
const TARGETS = TARGET_MAP[targetArg.toLowerCase()] || ['AppImage'];

console.log('╔══════════════════════════════════════════╗');
console.log('║   ZENO Browser - Linux AppImage Builder  ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`Architectures: ${ARCHITECTURES.join(', ')}`);
console.log(`Targets:       ${TARGETS.join(', ')}`);
console.log('');

/**
 * Validate prerequisites
 */
function validatePrerequisites() {
  console.log('🔍 Checking prerequisites...');

  if (process.platform !== 'linux') {
    console.warn('  ⚠️  Warning: AppImage builds are best created on Linux.');
    console.warn('     Cross-compilation may not produce optimal results.');
  }

  // Check icon directory
  const iconDir = path.join(ROOT, 'assets/installer/icons');
  if (!fs.existsSync(iconDir)) {
    console.warn('  ⚠️  Icon directory not found - creating placeholder icons');
    createPlaceholderIcons(iconDir);
  } else {
    console.log('  ✅ Linux icon directory found');
  }

  // Check desktop integration assets
  const desktopFile = path.join(ROOT, 'assets/installer/zeno-browser.desktop');
  if (!fs.existsSync(desktopFile)) {
    createDesktopFile(desktopFile);
  } else {
    console.log('  ✅ .desktop file found');
  }

  // Check snap availability if building snap
  if (TARGETS.includes('snap')) {
    try {
      execSync('snapcraft --version', { stdio: 'pipe' });
      console.log('  ✅ snapcraft found');
    } catch {
      console.warn('  ⚠️  snapcraft not found - snap builds will fail');
    }
  }

  console.log('');
}

/**
 * Create placeholder icon files for Linux
 */
function createPlaceholderIcons(iconDir) {
  fs.mkdirSync(iconDir, { recursive: true });
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
  sizes.forEach(size => {
    const iconPath = path.join(iconDir, `${size}x${size}.png`);
    if (!fs.existsSync(iconPath)) {
      // Minimal placeholder (1x1 transparent PNG)
      const minimalPng = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
        0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
        0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
        0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(iconPath, minimalPng);
    }
  });
  console.log(`  ✅ Created placeholder icons in ${iconDir}`);
}

/**
 * Create .desktop file for system integration
 */
function createDesktopFile(desktopPath) {
  fs.mkdirSync(path.dirname(desktopPath), { recursive: true });
  const content = `[Desktop Entry]
Name=ZENO Browser
Comment=AI-powered browser with multi-model integration
Exec=zeno-browser %U
Icon=zeno-browser
Type=Application
Categories=Network;WebBrowser;
MimeType=x-scheme-handler/http;x-scheme-handler/https;text/html;text/xml;application/xhtml+xml;
StartupNotify=true
StartupWMClass=zeno-browser
`;
  fs.writeFileSync(desktopPath, content);
  console.log(`  ✅ Created .desktop file at ${desktopPath}`);
}

/**
 * Install Linux build dependencies
 */
function installLinuxDeps() {
  if (process.platform !== 'linux') return;

  console.log('📦 Checking Linux build dependencies...');
  const deps = ['rpm', 'fakeroot', 'dpkg'];

  deps.forEach(dep => {
    try {
      execSync(`which ${dep}`, { stdio: 'pipe' });
      console.log(`  ✅ ${dep} found`);
    } catch {
      console.warn(`  ⚠️  ${dep} not found - some builds may fail`);
    }
  });
  console.log('');
}

/**
 * Build the Astro frontend
 */
function buildFrontend() {
  console.log('🔨 Building Astro frontend...');
  const appDir = path.join(ROOT, 'ZENO_WEB_CORE_APP');

  if (fs.existsSync(appDir)) {
    execSync('npm run build', { cwd: appDir, stdio: 'inherit' });
    console.log('  ✅ Frontend built successfully\n');
  } else {
    console.log('  ℹ️  ZENO_WEB_CORE_APP not found, skipping frontend build\n');
  }
}

/**
 * Build Linux packages for specified architecture and targets
 */
function buildLinux(arch, targets) {
  const targetStr = targets.map(t => t.toLowerCase()).join(',');
  console.log(`📦 Building Linux [${targets.join(', ')}] for ${arch}...`);

  const targetsArg = targets.map(t => `--linux ${t.toLowerCase()}`).join(' ');
  const cmd = [
    'npx electron-builder',
    targetsArg,
    `--${arch}`,
    '--config electron-builder.yml',
  ].join(' ');

  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });
    console.log(`  ✅ Linux [${targets.join(', ')}] for ${arch} built successfully\n`);
  } catch (error) {
    console.error(`  ❌ Build failed for ${arch}/${targets}: ${error.message}`);
    throw error;
  }
}

/**
 * Make AppImage executable and verify it
 */
function verifyAppImage() {
  const outputDir = path.join(ROOT, 'dist-electron');
  if (!fs.existsSync(outputDir)) return;

  const appImages = fs.readdirSync(outputDir).filter(f => f.endsWith('.AppImage'));
  appImages.forEach(file => {
    const filePath = path.join(outputDir, file);
    fs.chmodSync(filePath, '0755');
    console.log(`  ✅ Made executable: ${file}`);
  });
}

/**
 * List output files
 */
function listOutputFiles() {
  const outputDir = path.join(ROOT, 'dist-electron');
  if (!fs.existsSync(outputDir)) {
    console.log('No output directory found.');
    return;
  }

  console.log('📁 Built files:');
  const extensions = ['.AppImage', '.deb', '.rpm', '.snap', '-linux.yml'];
  const files = fs.readdirSync(outputDir).filter(f =>
    extensions.some(ext => f.endsWith(ext))
  );

  files.forEach(file => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(`  📦 ${file} (${sizeMB} MB)`);
  });
}

/**
 * Main build process
 */
async function main() {
  try {
    validatePrerequisites();
    installLinuxDeps();
    buildFrontend();

    for (const arch of ARCHITECTURES) {
      buildLinux(arch, TARGETS);
    }

    verifyAppImage();
    listOutputFiles();
    console.log('✨ Linux AppImage build completed successfully!');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();
