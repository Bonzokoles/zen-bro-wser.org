import { AgentConfig } from '../config/agents.config';
import { IModelProvider, ChatMessage } from '../models/IModelProvider';
import { Task } from '../tasks/Task';
import { ToolFunction } from '../core/ToolFactory';

export class BaseAgent {
  constructor(
    public config: AgentConfig,
    private model: IModelProvider,
    private tools: Map<string, ToolFunction>
  ) {
    console.log(`Agent "${config.role}" initialized with ${this.tools.size} tools.`);
  }

  async run(task: Task): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.config.systemPrompt,
      },
      {
        role: 'user',
        content: `Your task is: ${task.description}.
        
        To solve this task, you can use the following tools: ${Array.from(this.tools.keys()).join(', ')}.
        When you need to use a tool, respond with a JSON object in your 'toolCalls' field.
        When you have the final answer, provide it in the 'content' field.`,
      },
    ];

    const maxIterations = 10;
    let currentIteration = 0;

    while (currentIteration < maxIterations) {
      currentIteration++;
      console.log(`\n--- Agent Iteration ${currentIteration} ---`);

      const response = await this.model.chat(messages);

      // Add assistant message to history
      messages.push({
        role: 'assistant' as const,
        content: response.content ?? 'No content provided'
      });

      // If there are tool calls, execute them
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log('Model requested tool calls:', response.toolCalls);
        for (const toolCall of response.toolCalls) {
          const toolName = toolCall.function.name;
          const toolFn = this.tools.get(toolName);

          if (toolFn) {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const result = await toolFn(...Object.values(args));

              // Add tool result to messages
              messages.push({
                role: 'tool',
                toolCallId: toolCall.id,
                content: String(result),
              });
              console.log(`Tool "${toolName}" executed successfully. Result added to context.`);

            } catch (error: unknown) {
              const err = error as Error;
              messages.push({
                role: 'tool',
                toolCallId: toolCall.id,
                content: `Error executing tool ${toolName}: ${err.message}`,
              });
              console.error(`Error executing tool ${toolName}:`, err);
            }
          } else {
            messages.push({
              role: 'tool',
              toolCallId: toolCall.id,
              content: `Error: Tool "${toolName}" not found.`,
            });
            console.error(`Tool "${toolName}" not found.`);
          }
        }
      } else {
        // If no tool calls, the model should have the final answer
        if (response.content) {
          console.log('Agent provided final answer.');
          return response.content;
        } else {
          return 'Error: The agent finished without providing a final answer.';
        }
      }
    }

    return 'Error: Agent reached maximum iterations without completing the task.';
  }
}
