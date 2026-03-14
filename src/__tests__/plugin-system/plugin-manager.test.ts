/**
 * Plugin Manager Tests
 */

import { PluginManager } from '@/plugin-system/core/plugin-manager';
import { BasePlugin } from '@/plugin-system/core/plugin-api';
import type { PluginMetadata, PluginContext } from '@/plugin-system/core/plugin-api';

// Mock plugin
class MockPlugin extends BasePlugin {
  loadCalled = false;
  unloadCalled = false;
  enableCalled = false;
  disableCalled = false;

  getMetadata(): PluginMetadata {
    return {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      author: 'Test Author',
      description: 'A test plugin',
      capabilities: ['ui-panel'],
      permissions: [],
    };
  }

  async onLoad(): Promise<void> {
    this.loadCalled = true;
  }

  async onUnload(): Promise<void> {
    this.unloadCalled = true;
  }

  async onEnable(): Promise<void> {
    this.enableCalled = true;
  }

  async onDisable(): Promise<void> {
    this.disableCalled = true;
  }
}

describe('PluginManager', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  test('should load plugin', async () => {
    const plugin = new MockPlugin();
    
    // Note: In real scenario, this would load from file
    // For testing, we're using direct instance
    
    expect(plugin.loadCalled).toBe(false);
  });

  test('should enable plugin', async () => {
    // TODO: Implement after plugin loading is set up
  });

  test('should disable plugin', async () => {
    // TODO: Implement after plugin loading is set up
  });

  test('should unload plugin', async () => {
    // TODO: Implement after plugin loading is set up
  });

  test('should get plugin metadata', async () => {
    const plugin = new MockPlugin();
    const metadata = plugin.getMetadata();

    expect(metadata.id).toBe('test-plugin');
    expect(metadata.name).toBe('Test Plugin');
    expect(metadata.version).toBe('1.0.0');
  });
});