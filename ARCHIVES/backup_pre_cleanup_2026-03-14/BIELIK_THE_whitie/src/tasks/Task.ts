export class Task {
  public id: string;
  public description: string;
  public agentId: string; // The ID of the agent profile to use
  public status: 'pending' | 'in_progress' | 'completed' | 'failed';
  public result: string | null;
  public createdAt: Date;

  constructor(id: string, description: string, agentId: string) {
    this.id = id;
    this.description = description;
    this.agentId = agentId;
    this.status = 'pending';
    this.result = null;
    this.createdAt = new Date();
  }
}
