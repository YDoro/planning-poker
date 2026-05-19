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
    public emoji?: string
  ) {}

  public vote(value: number, emoji?: string): void {
    this.value = value;
    this.emoji = emoji;
    this.status = PlayerStatus.Finished;
  }

  public resetVote(): void {
    this.value = 0;
    this.status = PlayerStatus.NotStarted;
    // We keep or clear the emoji, but usually we can clear or keep it. Let's clear or reset to undefined.
    this.emoji = undefined;
  }
}
