/**
 * ZENO Browser - Main Electron Process
 * Window management, IPC handlers, backend services
 */

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeTheme,
} from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { BrowserManager } from './services/browser-manager';
import { AIGatewayService } from './services/ai-gateway-service';
import { NetworkMonitor } from './services/network-monitor';
import { SecuritySandbox } from './services/security-sandbox';

let mainWindow: BrowserWindow | null = null;
let browserManager: BrowserManager;
let aiGatewayService: AIGatewayService;
let networkMonitor: NetworkMonitor;
let securitySandbox: SecuritySandbox;

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
      enableRemoteModule: false,
      sandbox: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // Load UI
  const startUrl = isDev
    ? 'http://localhost:5173' // Vite dev server
    : `file://${path.join(__dirname, '../dist/index.html')}`;

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
    // Browser Manager
    browserManager = new BrowserManager();
    console.log('✅ Browser Manager initialized');

    // AI Gateway Service
    aiGatewayService = new AIGatewayService();
    await aiGatewayService.initialize();
    console.log('✅ AI Gateway Service initialized');

    // Network Monitor
    networkMonitor = new NetworkMonitor();
    console.log('✅ Network Monitor initialized');

    // Security Sandbox
    securitySandbox = new SecuritySandbox();
    console.log('✅ Security Sandbox initialized');

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
process.on('SIGINT', () => {
  console.log('\n📡 Shutting down gracefully...');
  app.quit();
});

process.on('SIGTERM', () => {
  console.log('\n📡 Shutting down gracefully...');
  app.quit();
});

export { mainWindow, browserManager, aiGatewayService };