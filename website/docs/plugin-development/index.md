---
sidebar_position: 1
title: Plugin Development
description: Build plugins for ZENO Browser
---

# 🔌 Plugin Development Guide

ZENO Browser has an extensible plugin system that lets you add custom tools, AI providers, and UI panels.

---

## Overview

Plugins can extend ZENO Browser with:

- **Custom MCP Tools** — new tools accessible from the AI chat
- **Custom AI Providers** — connect to any LLM API
- **UI Panels** — new sidebars, floating windows, or toolbar items
- **Custom Agents** — specialized BIELIK agents for specific tasks
- **Page Scripts** — content scripts that run on web pages

---

## Quick Start

### 1. Create plugin directory

```bash
mkdir my-zeno-plugin
cd my-zeno-plugin
npm init -y
```

### 2. Create the plugin manifest

```json title="zeno-plugin.json"
{
  "name": "my-zeno-plugin",
  "version": "1.0.0",
  "displayName": "My Plugin",
  "description": "A sample ZENO Browser plugin",
  "author": "Your Name",
  "license": "MIT",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "engines": {
    "zeno": ">=0.0.1"
  },
  "permissions": [
    "tools:register",
    "ai:providers",
    "ui:panels"
  ]
}
```

### 3. Create the plugin entry point

```typescript title="src/index.ts"
import type { ZenoPlugin, PluginContext } from '@zeno-browser/sdk';

const plugin: ZenoPlugin = {
  name: 'my-zeno-plugin',
  version: '1.0.0',

  async activate(context: PluginContext) {
    // Register a custom MCP tool
    context.tools.register({
      name: 'my_custom_tool',
      description: 'Does something useful',
      parameters: {
        type: 'object',
        properties: {
          input: { type: 'string', description: 'Input value' }
        },
        required: ['input']
      },
      execute: async ({ input }) => {
        return `Processed: ${input}`;
      }
    });

    console.log('My plugin activated!');
  },

  async deactivate() {
    console.log('My plugin deactivated!');
  }
};

export default plugin;
```

---

## Plugin API

### PluginContext

The `context` object provided to `activate()`:

```typescript
interface PluginContext {
  // Register custom tools
  tools: ToolRegistry;
  
  // Access AI providers
  ai: AIProviderRegistry;
  
  // Register UI panels
  ui: UIRegistry;
  
  // Storage (persisted)
  storage: PluginStorage;
  
  // Current page info
  page: PageContext;
  
  // Emit events
  events: EventEmitter;
}
```

### Tool Registration

```typescript
context.tools.register({
  name: 'fetch_weather',
  description: 'Get current weather for a location',
  parameters: {
    type: 'object',
    properties: {
      location: { 
        type: 'string', 
        description: 'City name or coordinates' 
      }
    },
    required: ['location']
  },
  execute: async ({ location }) => {
    const response = await fetch(`https://api.weather.example.com?q=${location}`);
    const data = await response.json();
    return JSON.stringify(data);
  }
});
```

### UI Panel Registration

```typescript
context.ui.registerPanel({
  id: 'my-panel',
  title: 'My Panel',
  icon: '🎯',
  position: 'sidebar',  // 'sidebar' | 'bottom' | 'floating'
  component: () => import('./components/MyPanel'),
});
```

---

## Publishing

### 1. Build your plugin

```bash
npm run build
```

### 2. Test locally

```bash
# Copy to plugins directory
cp -r dist/ ~/.config/ZENO\ Browser/plugins/my-zeno-plugin/
```

### 3. Publish to npm

```bash
npm publish --access public
```

Plugins prefixed with `zeno-plugin-` or `@scope/zeno-plugin-*` are automatically discoverable.

---

## Examples

- [Weather Tool Plugin](https://github.com/Bonzokoles/zeno-plugin-weather) — example with external API
- [Dark Reader Integration](https://github.com/Bonzokoles/zeno-plugin-dark-reader) — example UI panel
- [Custom AI Provider](https://github.com/Bonzokoles/zeno-plugin-custom-ai) — example AI provider
