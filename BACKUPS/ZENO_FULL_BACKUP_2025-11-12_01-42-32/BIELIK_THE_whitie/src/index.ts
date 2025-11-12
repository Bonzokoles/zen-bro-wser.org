import 'dotenv/config';
import { AgentManager } from './core/AgentManager';
import { Task } from './tasks/Task';

async function main() {
  console.log("Initializing BIELIK_THE_whitie Agent System...");

  const agentManager = new AgentManager();
  await agentManager.loadConfig();

  console.log("System Initialized. Ready for tasks.");

  // --- Example Task ---
  const task = new Task(
    'research-task-1',
    'Research the current state of quantum computing and write a summary.',
    'researcher' // Specify which agent profile to use
  );

  console.log(`Starting task: ${task.description}`);

  const result = await agentManager.executeTask(task);

  console.log("--- Task Finished ---");
  console.log("Result:", result);
  console.log("---------------------");
}

main().catch(error => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
