import { tools as toolConfigs, ToolConfig } from '../config/tools.config';

// A type representing an executable tool function
export type ToolFunction = (...args: any[]) => Promise<any>;

export class ToolFactory {
  private tools: Map<string, ToolFunction> = new Map();

  constructor() {
    this.loadTools();
  }

  private async loadTools() {
    for (const toolConfig of toolConfigs) {
      try {
        const module = await import(toolConfig.filePath);
        const toolFn = module[toolConfig.functionName];

        if (typeof toolFn === 'function') {
          this.tools.set(toolConfig.id, toolFn);
        } else {
          console.error(`[ToolFactory] Error: Function "${toolConfig.functionName}" not found in ${toolConfig.filePath}`);
        }
      } catch (error) {
        console.error(`[ToolFactory] Error loading tool module: ${toolConfig.filePath}`, error);
      }
    }
    console.log(`Loaded ${this.tools.size} tools.`);
  }

  getTool(toolId: string): ToolFunction | undefined {
    return this.tools.get(toolId);
  }
}
