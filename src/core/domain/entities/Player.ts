export enum PlayerStatus {
  NotStarted = 'Not Started',
  Started = 'Started',
  InProgress = 'In Progress',
  Finished = 'Finished',
}

export class Player {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public status: PlayerStatus = PlayerStatus.NotStarted,
    public value?: number,
    public isNonVoter?: boolean,
  ) { }

  public vote(value: number): void {
    this.value = value;
    this.status = PlayerStatus.Finished;
  }

  public resetVote(): void {
    this.value = 0;
    this.status = PlayerStatus.NotStarted;
  }

  public toggleDontVote(): void {
    this.isNonVoter = !this.isNonVoter;
  }
}
