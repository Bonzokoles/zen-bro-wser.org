/**
 * ZENO Browser - Main Electron Process
 * Window management, IPC handlers, backend services
 */

// Polyfills for Node 18 (Electron 27) — must be first, before any other imports

// process.getBuiltinModule is Node.js 21+ — polyfill for Electron 27 / Node 18
if (typeof (process as any).getBuiltinModule === 'undefined') {
  (process as any).getBuiltinModule = (name: string) => require(name);
}

// File global — required by cheerio/undici
if (typeof (global as any).File === 'undefined') {
  (global as any).File = require('node:buffer').File;
}

// DOMMatrix — required by pdfjs-dist / pdf-parse
if (typeof (global as any).DOMMatrix === 'undefined') {
  // Minimal stub sufficient for PDF.js matrix operations
  (global as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true; isIdentity = true;
    constructor(_init?: string | number[]) {}
    static fromMatrix(m: any) { return new (global as any).DOMMatrix(); }
    static fromFloat32Array(a: Float32Array) { return new (global as any).DOMMatrix(); }
    static fromFloat64Array(a: Float64Array) { return new (global as any).DOMMatrix(); }
    multiply(m: any) { return new (global as any).DOMMatrix(); }
    translate(tx = 0, ty = 0, tz = 0) { return new (global as any).DOMMatrix(); }
    scale(s = 1) { return new (global as any).DOMMatrix(); }
    rotate(a = 0) { return new (global as any).DOMMatrix(); }
    inverse() { return new (global as any).DOMMatrix(); }
    transformPoint(p: any) { return p; }
    toFloat32Array() { return new Float32Array(16); }
    toFloat64Array() { return new Float64Array(16); }
    toString() { return 'matrix(1, 0, 0, 1, 0, 0)'; }
  };
}

// ImageData — required by pdfjs-dist canvas operations
if (typeof (global as any).ImageData === 'undefined') {
  (global as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace: string = 'srgb';
    constructor(widthOrData: number | Uint8ClampedArray, height: number, _options?: any) {
      if (typeof widthOrData === 'number') {
        this.width = widthOrData;
        this.height = height;
        this.data = new Uint8ClampedArray(widthOrData * height * 4);
      } else {
        this.data = widthOrData;
        this.width = height;
        this.height = widthOrData.length / (4 * height);
      }
    }
  };
}

// Path2D — stub
if (typeof (global as any).Path2D === 'undefined') {
  (global as any).Path2D = class Path2D {
    constructor(_path?: any) {}
    addPath() {} moveTo() {} lineTo() {} arc() {} arcTo() {}
    bezierCurveTo() {} closePath() {} ellipse() {} rect() {}
    quadraticCurveTo() {}
  };
}

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeTheme,
} from 'electron';
import * as path from 'path';
const isDev = require('electron-is-dev');

// Suppress CSP/security warnings in dev (unsafe-eval needed by Vite HMR)
// These warnings do not appear in production builds
if (isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}
import { BrowserManager } from './services/browser-manager';
import { AIGatewayService } from './services/ai-gateway-service';
import { NetworkMonitor } from './services/network-monitor';
import { SecuritySandbox } from './services/security-sandbox';
import { WebCrawlerService } from './services/web-crawler.service';
import { LocalLibraryService } from './services/local-library.service';
import { NetworkManager } from './services/network-manager';
import { TabCommunicationManager } from './services/tab-communication';
import { MCPClientService } from './services/mcp-client.service';
import { CloudflareTunnelManager, TunnelConfig } from './services/cloudflare-tunnel';

let mainWindow: BrowserWindow | null = null;
let browserManager: BrowserManager;
let aiGatewayService: AIGatewayService;
let networkManager: NetworkManager;
let tabCommunicationManager: TabCommunicationManager;
let mcpClient: MCPClientService;
let networkMonitor: NetworkMonitor;
let securitySandbox: SecuritySandbox;
let webCrawler: WebCrawlerService;
let localLibrary: LocalLibraryService;
let cfTunnelManager: CloudflareTunnelManager;

/**
 * Create main window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // Load UI
  const startUrl = isDev
    ? 'http://localhost:4378' // Astro dev server (npm run dev:astro)
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  // Content Security Policy – set on all responses from Electron session
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev
      // Development: allow localhost + wss for HMR, unsafe-eval for React DevTools
      ? "default-src 'self' http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:*; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:* ws://localhost:* https:;"
      // Production: strict CSP
      : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https:;";

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    });
  });

  mainWindow.loadURL(startUrl);

  // DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });

  setupMenu();
}

/**
 * Setup application menu
 */
function setupMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Initialize services
 */
async function initializeServices() {
  try {
    // Local Data Path
    const appData = app.getPath('userData');

    // Browser Manager (with Session Persistence)
    browserManager = new BrowserManager(appData);
    if (!browserManager.loadSession()) {
      browserManager.createTab(); // Initial tab if no session
    }
    console.log('✅ Browser Manager initialized');

    // AI Gateway Service
    aiGatewayService = new AIGatewayService();
    await aiGatewayService.initialize();
    console.log('✅ AI Gateway Service initialized');

    // Advanced Network Control
    networkManager = new NetworkManager({ allowLocalhost: true, allowLAN: true });
    networkManager.init();
    // Prevent unhandled 'error' event crash — log only
    networkManager.on('error', (err: unknown) => {
      console.warn('[NetworkManager] request error:', err);
    });
    console.log('✅ Advanced Network Manager initialized');

    // Cloudflare WebTunnels Daemon
    const initialTunnelConfig: TunnelConfig = {
      name: 'zeno-portal',
      accountId: process.env.CF_ACCOUNT_ID || '',
      tunnelToken: process.env.CF_TUNNEL_TOKEN || '',
      routes: [
        { hostname: 'gateway.zenobrowser.local', service: 'http://localhost:3000' }
      ]
    };
    cfTunnelManager = new CloudflareTunnelManager(initialTunnelConfig);
    console.log('✅ Cloudflare WebTunnels Manager initialized');

    // Tab Communication Broker
    tabCommunicationManager = new TabCommunicationManager();
    console.log('✅ Tab Communication Broker initialized');

    // Model Context Protocol (MCP) Agent Service
    mcpClient = new MCPClientService();
    console.log('✅ MCP Agent Service initialized');

    // Network Monitor (UI bridge)
    networkMonitor = new NetworkMonitor();
    console.log('✅ Network Monitor initialized');

    // Security Sandbox
    securitySandbox = new SecuritySandbox();
    console.log('✅ Security Sandbox initialized');

    // Web Crawler (Offscreen Scraper + Tavily deep search)
    webCrawler = new WebCrawlerService();
    console.log('✅ Web Crawler initialized');

    // Local Library (SQLite FTS + PDF/MD Parsing)
    localLibrary = new LocalLibraryService(appData);
    console.log('✅ Local Library initialized');

    setupIPCHandlers();
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Setup IPC handlers for communication between renderer and main
 */
function setupIPCHandlers() {
  // Browser operations
  ipcMain.handle('browser:new-tab', async () => {
    return browserManager.createTab();
  });

  ipcMain.handle('browser:close-tab', async (_, tabId: string) => {
    return browserManager.closeTab(tabId);
  });

  ipcMain.handle('browser:navigate', async (_, tabId: string, url: string) => {
    return browserManager.navigate(tabId, url);
  });

  ipcMain.handle('browser:get-tabs', async () => {
    return browserManager.getTabs();
  });

  // AI Gateway
  ipcMain.handle(
    'ai:execute',
    async (_, request: any) => {
      try {
        const response = await aiGatewayService.execute(request);
        return { success: true, data: response };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
  );

  ipcMain.handle('ai:get-providers', async () => {
    return aiGatewayService.getProviderStatus();
  });

  ipcMain.handle('ai:get-metrics', async () => {
    return aiGatewayService.getMetrics();
  });

  // Network monitoring
  ipcMain.handle('network:get-report', async (_, tabId: string) => {
    return networkMonitor.getReport(tabId);
  });

  // Security
  ipcMain.handle('security:create-context', async (_, tabId: string) => {
    return securitySandbox.createIsolatedContext(tabId);
  });

  ipcMain.handle('security:get-audit-logs', async (_, tabId?: string) => {
    return securitySandbox.getAuditLogs(tabId);
  });

  // MCP Agent Protocol
  ipcMain.handle('mcp:connect', async (_, config: any) => {
    return mcpClient.connectServer(config);
  });

  ipcMain.handle('mcp:list-tools', async () => {
    return mcpClient.getAllTools();
  });

  ipcMain.handle('mcp:execute-tool', async (_, serverId: string, toolName: string, args: any) => {
    return mcpClient.executeTool(serverId, toolName, args);
  });

  // Cloudflare Tunnels (Route Mapping & Health)
  ipcMain.handle('tunnel:start', async () => {
    return cfTunnelManager.start();
  });

  ipcMain.handle('tunnel:stop', async () => {
    await cfTunnelManager.stop();
    return true;
  });

  ipcMain.handle('tunnel:metrics', async () => {
    return cfTunnelManager.getMetrics();
  });

  ipcMain.handle('tunnel:status', async () => {
    return cfTunnelManager.getStatus();
  });

  // Theme
  ipcMain.handle('theme:toggle', async () => {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark';
    return nativeTheme.shouldUseDarkColors;
  });

  // Window
  ipcMain.handle('window:minimize', async () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', async () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('window:close', async () => {
    browserManager?.saveSession();
    mainWindow?.close();
  });
}

/**
 * App event handlers
 */
app.on('ready', async () => {
  try {
    await initializeServices();
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n📡 Shutting down gracefully...');
  browserManager?.saveSession();
  await cfTunnelManager?.stop();
  app.quit();
});

process.on('SIGTERM', async () => {
  console.log('\n📡 Shutting down gracefully...');
  browserManager?.saveSession();
  await cfTunnelManager?.stop();
  app.quit();
});

export { mainWindow, browserManager, aiGatewayService };