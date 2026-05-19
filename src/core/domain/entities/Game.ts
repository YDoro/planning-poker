import { Player } from './Player';
import { Task } from './Task';

export interface CardConfig {
  value: number;
  displayValue: string;
  color: string;
}

export interface TimerProps {
  currentSeconds?: number;
  totalSeconds?: number;
  soundOn?: boolean;
  timerVisible?: boolean;
  timerPaused?: boolean;
}

export enum GameType {
  Fibonacci = 'Fibonacci',
  ShortFibonacci = 'ShortFibonacci',
  TShirt = 'TShirt',
  TShirtAndNumber = 'TShirtAndNumber',
  Custom = 'Custom',
}

export class Game {
  constructor(
    public readonly id: string,
    public name: string,
    public isFinished: boolean,
    public currentTaskId?: string,
    public tasks: Task[] = [],
    public players: Player[] = [],
    public cards: CardConfig[] = [],
    public createdBy: string = '',
    public createdById: string = '',
    public createdAt: Date = new Date(),
    public average: number = 0,
    public gameType?: GameType,
    public isAllowMembersToManageSession?: boolean,
    public storyName?: string,
    public updatedAt?: Date,
    public timerProps?: TimerProps,
    public autoReveal?: boolean
  ) {}

  public get gameStatus(): string {
    if (this.isFinished) return 'Finished';
    const currentTask = this.tasks.find((t) => t.id === this.currentTaskId);
    if (!currentTask) return 'NotStarted';
    if (currentTask.status === 'voting') return 'InProgress';
    return 'Started';
  }

  public addPlayer(player: Player): void {
    if (!this.players.some((p) => p.id === player.id)) {
      this.players.push(player);
    }
  }

  public removePlayer(playerId: string): void {
    this.players = this.players.filter((p) => p.id !== playerId);
  }

  public submitVote(playerId: string, value: number, emoji?: string): void {
    if (this.isFinished) {
      throw new Error('Cannot vote on a finished game');
    }
    const player = this.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error('Player not found in game');
    }
    player.vote(value, emoji);

    // If autoReveal is true, check if all players have voted
    if (this.autoReveal) {
      const activePlayers = this.players.filter((p) => !p.isNonVoter);
      const allVoted = activePlayers.every((p) => p.status === 'Finished');
      if (allVoted && activePlayers.length > 0) {
        this.revealCurrentTask();
      }
    }
  }

  public revealCurrentTask(): void {
    if (!this.currentTaskId) return;
    const task = this.tasks.find((t) => t.id === this.currentTaskId);
    if (task) {
      task.reveal();
    }
  }

  public goToNextTask(score?: string, skipped?: boolean): void {
    if (!this.currentTaskId || this.tasks.length === 0) return;
    const currentTaskIndex = this.tasks.findIndex((t) => t.id === this.currentTaskId);
    if (currentTaskIndex === -1) return;

    const currentTask = this.tasks[currentTaskIndex];
    if (skipped) {
      currentTask.skip();
    } else {
      currentTask.reveal(score);
    }

    const nextPendingTask = this.tasks.find(
      (t, idx) => idx > currentTaskIndex && (t.status === 'pending' || t.status === 'skipped')
    );

    if (nextPendingTask) {
      this.currentTaskId = nextPendingTask.id;
      nextPendingTask.startVoting();
    } else {
      this.isFinished = true;
    }

    // Reset votes for all players
    this.players.forEach((p) => p.resetVote());
  }

  public finish(): void {
    this.isFinished = true;
  }
}
