"use strict";
/**
 * ZENO Browser - Main Electron Process
 * Window management, IPC handlers, backend services
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiGatewayService = exports.browserManager = exports.mainWindow = void 0;
// Polyfills for Node 18 (Electron 27) — must be first, before any other imports
// process.getBuiltinModule is Node.js 21+ — polyfill for Electron 27 / Node 18
if (typeof process.getBuiltinModule === 'undefined') {
    process.getBuiltinModule = (name) => require(name);
}
// File global — required by cheerio/undici
if (typeof global.File === 'undefined') {
    global.File = require('node:buffer').File;
}
// DOMMatrix — required by pdfjs-dist / pdf-parse
if (typeof global.DOMMatrix === 'undefined') {
    // Minimal stub sufficient for PDF.js matrix operations
    global.DOMMatrix = class DOMMatrix {
        constructor(_init) {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
            this.m11 = 1;
            this.m12 = 0;
            this.m13 = 0;
            this.m14 = 0;
            this.m21 = 0;
            this.m22 = 1;
            this.m23 = 0;
            this.m24 = 0;
            this.m31 = 0;
            this.m32 = 0;
            this.m33 = 1;
            this.m34 = 0;
            this.m41 = 0;
            this.m42 = 0;
            this.m43 = 0;
            this.m44 = 1;
            this.is2D = true;
            this.isIdentity = true;
        }
        static fromMatrix(m) { return new global.DOMMatrix(); }
        static fromFloat32Array(a) { return new global.DOMMatrix(); }
        static fromFloat64Array(a) { return new global.DOMMatrix(); }
        multiply(m) { return new global.DOMMatrix(); }
        translate(tx = 0, ty = 0, tz = 0) { return new global.DOMMatrix(); }
        scale(s = 1) { return new global.DOMMatrix(); }
        rotate(a = 0) { return new global.DOMMatrix(); }
        inverse() { return new global.DOMMatrix(); }
        transformPoint(p) { return p; }
        toFloat32Array() { return new Float32Array(16); }
        toFloat64Array() { return new Float64Array(16); }
        toString() { return 'matrix(1, 0, 0, 1, 0, 0)'; }
    };
}
// ImageData — required by pdfjs-dist canvas operations
if (typeof global.ImageData === 'undefined') {
    global.ImageData = class ImageData {
        constructor(widthOrData, height, _options) {
            this.colorSpace = 'srgb';
            if (typeof widthOrData === 'number') {
                this.width = widthOrData;
                this.height = height;
                this.data = new Uint8ClampedArray(widthOrData * height * 4);
            }
            else {
                this.data = widthOrData;
                this.width = height;
                this.height = widthOrData.length / (4 * height);
            }
        }
    };
}
// Path2D — stub
if (typeof global.Path2D === 'undefined') {
    global.Path2D = class Path2D {
        constructor(_path) { }
        addPath() { }
        moveTo() { }
        lineTo() { }
        arc() { }
        arcTo() { }
        bezierCurveTo() { }
        closePath() { }
        ellipse() { }
        rect() { }
        quadraticCurveTo() { }
    };
}
const electron_1 = require("electron");
const path = __importStar(require("path"));
const isDev = require('electron-is-dev');
const browser_manager_1 = require("./services/browser-manager");
const ai_gateway_service_1 = require("./services/ai-gateway-service");
const network_monitor_1 = require("./services/network-monitor");
const security_sandbox_1 = require("./services/security-sandbox");
const web_crawler_service_1 = require("./services/web-crawler.service");
const local_library_service_1 = require("./services/local-library.service");
const network_manager_1 = require("./services/network-manager");
const tab_communication_1 = require("./services/tab-communication");
const mcp_client_service_1 = require("./services/mcp-client.service");
const cloudflare_tunnel_1 = require("./services/cloudflare-tunnel");
let mainWindow = null;
exports.mainWindow = mainWindow;
let browserManager;
let aiGatewayService;
let networkManager;
let tabCommunicationManager;
let mcpClient;
let networkMonitor;
let securitySandbox;
let webCrawler;
let localLibrary;
let cfTunnelManager;
/**
 * Create main window
 */
function createWindow() {
    exports.mainWindow = mainWindow = new electron_1.BrowserWindow({
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
        exports.mainWindow = mainWindow = null;
        electron_1.app.quit();
    });
    setupMenu();
}
/**
 * Setup application menu
 */
function setupMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        electron_1.app.quit();
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
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
/**
 * Initialize services
 */
async function initializeServices() {
    try {
        // Local Data Path
        const appData = electron_1.app.getPath('userData');
        // Browser Manager (with Session Persistence)
        exports.browserManager = browserManager = new browser_manager_1.BrowserManager(appData);
        if (!browserManager.loadSession()) {
            browserManager.createTab(); // Initial tab if no session
        }
        console.log('✅ Browser Manager initialized');
        // AI Gateway Service
        exports.aiGatewayService = aiGatewayService = new ai_gateway_service_1.AIGatewayService();
        await aiGatewayService.initialize();
        console.log('✅ AI Gateway Service initialized');
        // Advanced Network Control
        networkManager = new network_manager_1.NetworkManager({ allowLocalhost: true, allowLAN: true });
        networkManager.init();
        // Prevent unhandled 'error' event crash — log only
        networkManager.on('error', (err) => {
            console.warn('[NetworkManager] request error:', err);
        });
        console.log('✅ Advanced Network Manager initialized');
        // Cloudflare WebTunnels Daemon
        const initialTunnelConfig = {
            name: 'zeno-portal',
            accountId: process.env.CF_ACCOUNT_ID || '',
            tunnelToken: process.env.CF_TUNNEL_TOKEN || '',
            routes: [
                { hostname: 'gateway.zenobrowser.local', service: 'http://localhost:3000' }
            ]
        };
        cfTunnelManager = new cloudflare_tunnel_1.CloudflareTunnelManager(initialTunnelConfig);
        console.log('✅ Cloudflare WebTunnels Manager initialized');
        // Tab Communication Broker
        tabCommunicationManager = new tab_communication_1.TabCommunicationManager();
        console.log('✅ Tab Communication Broker initialized');
        // Model Context Protocol (MCP) Agent Service
        mcpClient = new mcp_client_service_1.MCPClientService();
        console.log('✅ MCP Agent Service initialized');
        // Network Monitor (UI bridge)
        networkMonitor = new network_monitor_1.NetworkMonitor();
        console.log('✅ Network Monitor initialized');
        // Security Sandbox
        securitySandbox = new security_sandbox_1.SecuritySandbox();
        console.log('✅ Security Sandbox initialized');
        // Web Crawler (Offscreen Scraper + Tavily deep search)
        webCrawler = new web_crawler_service_1.WebCrawlerService();
        console.log('✅ Web Crawler initialized');
        // Local Library (SQLite FTS + PDF/MD Parsing)
        localLibrary = new local_library_service_1.LocalLibraryService(appData);
        console.log('✅ Local Library initialized');
        setupIPCHandlers();
    }
    catch (error) {
        console.error('Failed to initialize services:', error);
        throw error;
    }
}
/**
 * Setup IPC handlers for communication between renderer and main
 */
function setupIPCHandlers() {
    // Browser operations
    electron_1.ipcMain.handle('browser:new-tab', async () => {
        return browserManager.createTab();
    });
    electron_1.ipcMain.handle('browser:close-tab', async (_, tabId) => {
        return browserManager.closeTab(tabId);
    });
    electron_1.ipcMain.handle('browser:navigate', async (_, tabId, url) => {
        return browserManager.navigate(tabId, url);
    });
    electron_1.ipcMain.handle('browser:get-tabs', async () => {
        return browserManager.getTabs();
    });
    // AI Gateway
    electron_1.ipcMain.handle('ai:execute', async (_, request) => {
        try {
            const response = await aiGatewayService.execute(request);
            return { success: true, data: response };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('ai:get-providers', async () => {
        return aiGatewayService.getProviderStatus();
    });
    electron_1.ipcMain.handle('ai:get-metrics', async () => {
        return aiGatewayService.getMetrics();
    });
    // Network monitoring
    electron_1.ipcMain.handle('network:get-report', async (_, tabId) => {
        return networkMonitor.getReport(tabId);
    });
    // Security
    electron_1.ipcMain.handle('security:create-context', async (_, tabId) => {
        return securitySandbox.createIsolatedContext(tabId);
    });
    electron_1.ipcMain.handle('security:get-audit-logs', async (_, tabId) => {
        return securitySandbox.getAuditLogs(tabId);
    });
    // MCP Agent Protocol
    electron_1.ipcMain.handle('mcp:connect', async (_, config) => {
        return mcpClient.connectServer(config);
    });
    electron_1.ipcMain.handle('mcp:list-tools', async () => {
        return mcpClient.getAllTools();
    });
    electron_1.ipcMain.handle('mcp:execute-tool', async (_, serverId, toolName, args) => {
        return mcpClient.executeTool(serverId, toolName, args);
    });
    // Cloudflare Tunnels (Route Mapping & Health)
    electron_1.ipcMain.handle('tunnel:start', async () => {
        return cfTunnelManager.start();
    });
    electron_1.ipcMain.handle('tunnel:stop', async () => {
        await cfTunnelManager.stop();
        return true;
    });
    electron_1.ipcMain.handle('tunnel:metrics', async () => {
        return cfTunnelManager.getMetrics();
    });
    electron_1.ipcMain.handle('tunnel:status', async () => {
        return cfTunnelManager.getStatus();
    });
    // Theme
    electron_1.ipcMain.handle('theme:toggle', async () => {
        electron_1.nativeTheme.themeSource = electron_1.nativeTheme.shouldUseDarkColors ? 'light' : 'dark';
        return electron_1.nativeTheme.shouldUseDarkColors;
    });
    // Window
    electron_1.ipcMain.handle('window:minimize', async () => {
        mainWindow?.minimize();
    });
    electron_1.ipcMain.handle('window:maximize', async () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow?.maximize();
        }
    });
    electron_1.ipcMain.handle('window:close', async () => {
        browserManager?.saveSession();
        mainWindow?.close();
    });
}
/**
 * App event handlers
 */
electron_1.app.on('ready', async () => {
    try {
        await initializeServices();
        createWindow();
    }
    catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
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
    electron_1.app.quit();
});
process.on('SIGTERM', async () => {
    console.log('\n📡 Shutting down gracefully...');
    browserManager?.saveSession();
    await cfTunnelManager?.stop();
    electron_1.app.quit();
});
