export type TaskStatus = 'pending' | 'voting' | 'voted' | 'skipped';

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public status: TaskStatus,
    public score?: string,
    public taskCode?: string,
    public revealed?: boolean
  ) {}

  public startVoting(): void {
    this.status = 'voting';
    this.revealed = false;
    this.score = undefined;
  }

  public reveal(score?: string): void {
    this.status = 'voted';
    this.revealed = true;
    if (score !== undefined) {
      this.score = score;
    }
  }

  public skip(): void {
    this.status = 'skipped';
    this.revealed = false;
  }
}
