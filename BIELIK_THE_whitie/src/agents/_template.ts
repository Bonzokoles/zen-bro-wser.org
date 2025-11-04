/**
 * @template
 * 
 * This is a template for creating a new, specialized agent.
 * To create a new agent:
 * 1. Copy this file to a new file with a descriptive name, e.g., `ResearcherAgent.ts`.
 * 2. Update the class name to match the file name.
 * 3. Implement the `run` method with the agent's specific logic.
 * 4. (Optional) Add any private methods needed for the agent's tasks.
 * 5. Add a new configuration for this agent in `src/config/agents.config.ts`.
 */

import { BaseAgent } from './BaseAgent';
import { AgentConfig } from '../config/agents.config';
import { IModelProvider, ChatMessage } from '../models/IModelProvider';
import { Task } from '../tasks/Task';

// Define a specific state or context for this agent, if needed.
interface SpecialistAgentContext {
  researchTopic: string;
  sources: string[];
}

export class SpecialistAgent extends BaseAgent {
  constructor(
    public config: AgentConfig,
    private model: IModelProvider
  ) {
    super(config, model);
  }

  /**
   * The main execution method for this agent.
   * This method should contain the core logic for processing a task.
   * @param task The task to be executed.
   * @returns A promise that resolves with the result of the task.
   */
  async run(task: Task): Promise<string> {
    console.log(`SpecialistAgent is running task: ${task.description}`);

    // 1. Prepare the initial messages for the model.
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.config.systemPrompt,
      },
      {
        role: 'user',
        content: `Your primary goal is: ${task.description}. Please begin.`,
      },
    ];

    // 2. (Optional) Implement a loop for complex interactions (e.g., ReAct pattern).
    //    This might involve calling tools, processing results, and sending them back to the model.
    
    // For this template, we'll just make a single call.
    const response = await this.model.chat(messages);

    // 3. Process the final response.
    const finalResult = this.processFinalResponse(response.content);

    return finalResult;
  }

  /**
   * A private helper method to process the model's final response.
   * @param rawContent The raw content from the model.
   * @returns A formatted or cleaned-up string.
   */
  private processFinalResponse(rawContent: string): string {
    // Example: clean up markdown, extract a specific part of the response, etc.
    return rawContent.trim();
  }
}
