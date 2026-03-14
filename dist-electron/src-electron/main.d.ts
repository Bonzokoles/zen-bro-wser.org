/**
 * ZENO Browser - Main Electron Process
 * Window management, IPC handlers, backend services
 */
import { BrowserWindow } from 'electron';
import { BrowserManager } from './services/browser-manager';
import { AIGatewayService } from './services/ai-gateway-service';
declare let mainWindow: BrowserWindow | null;
declare let browserManager: BrowserManager;
declare let aiGatewayService: AIGatewayService;
export { mainWindow, browserManager, aiGatewayService };
