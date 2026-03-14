/**
 * ZENO Browser Workflow Service
 * Browser automation and task orchestration
 */

export type WorkflowStepType = 'navigate' | 'search' | 'extract' | 'wait' | 'click' | 'fill' | 'screenshot';

export interface WorkflowStep {
  type: WorkflowStepType;
  params: Record<string, unknown>;
  description?: string;
  timeout?: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowResult {
  workflowId: string;
  success: boolean;
  steps: Array<{ step: WorkflowStep; success: boolean; output?: unknown; error?: string }>;
  duration: number;
  completedAt: Date;
}

export class WorkflowService {
  private workflows: Map<string, Workflow> = new Map();

  createWorkflow(name: string, steps: WorkflowStep[], description?: string): Workflow {
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      name,
      description,
      steps,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  listWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  async executeWorkflow(
    workflowId: string,
    executor: (step: WorkflowStep) => Promise<unknown>
  ): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    const startTime = Date.now();
    const stepResults = [];
    for (const step of workflow.steps) {
      try {
        const output = await executor(step);
        stepResults.push({ step, success: true, output });
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        stepResults.push({ step, success: false, error });
        break;
      }
    }
    return {
      workflowId,
      success: stepResults.every((r) => r.success),
      steps: stepResults,
      duration: Date.now() - startTime,
      completedAt: new Date(),
    };
  }

  exportWorkflow(workflow: Workflow): string {
    return JSON.stringify(workflow, null, 2);
  }

  importWorkflow(json: string): Workflow {
    const workflow = JSON.parse(json) as Workflow;
    workflow.id = crypto.randomUUID();
    workflow.updatedAt = new Date();
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }
}

export const workflowService = new WorkflowService();
