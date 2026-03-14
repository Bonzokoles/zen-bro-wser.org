import { agents as agentConfigs, AgentConfig } from '../config/agents.config';
import { models as modelConfigs, ModelConfig } from '../config/models.config';
import { BaseAgent } from '../agents/BaseAgent';
import { Task } from '../tasks/Task';
import { ModelFactory } from './ModelFactory';
import { ToolFactory, ToolFunction } from './ToolFactory';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private models: Map<string, ModelConfig> = new Map();
  private toolFactory: ToolFactory;

  constructor() {
    this.toolFactory = new ToolFactory();
  }

  async loadConfig() {
    // Load models
    for (const modelConfig of modelConfigs) {
      this.models.set(modelConfig.id, modelConfig);
    }
    console.log(`Loaded ${this.models.size} model configurations.`);

    // Load agents and instantiate them
    for (const agentConfig of agentConfigs) {
      const modelConfig = this.models.get(agentConfig.modelId);
      if (!modelConfig) {
        console.warn(`Model "${agentConfig.modelId}" not found for agent "${agentConfig.id}". Skipping.`);
        continue;
      }
      
      const modelProvider = ModelFactory.create(modelConfig);
      
      // Get the tools for this agent
      const agentTools: Map<string, ToolFunction> = new Map();
      for (const toolId of agentConfig.toolIds) {
        const toolFn = this.toolFactory.getTool(toolId);
        if (toolFn) {
          agentTools.set(toolId, toolFn);
        } else {
          console.warn(`Tool "${toolId}" not found for agent "${agentConfig.id}".`);
        }
      }

      const agent = new BaseAgent(agentConfig, modelProvider, agentTools);
      this.agents.set(agentConfig.id, agent);
    }
    console.log(`Loaded and instantiated ${this.agents.size} agents.`);
  }

  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  async executeTask(task: Task): Promise<string> {
    const agent = this.getAgent(task.agentId);
    if (!agent) {
      return `Error: Agent with ID "${task.agentId}" not found.`;
    }

    console.log(`Agent "${agent.config.role}" is executing task: ${task.description}`);
    const result = await agent.run(task);
    return result;
  }
}
