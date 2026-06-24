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

export interface ModeratorCheck {
  createdById: string;
  playerId?: string;
  moderatorIds?: string[];
  isAllowMembersToManageSession?: boolean;
}

/**
 * Canonical rule for deciding whether a player can manage a session.
 * Single source of truth — used by both the Game entity and the
 * CheckIsModerator use-case so the rule can never drift between call sites.
 */
export function isPlayerModerator(check: ModeratorCheck): boolean {
  if (check.isAllowMembersToManageSession) return true;
  if (!check.playerId) return false;
  if (check.createdById === check.playerId) return true;
  return !!check.moderatorIds?.includes(check.playerId);
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
    public autoReveal?: boolean,
    public moderatorIds: string[] = []
  ) { }

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
    this.moderatorIds = this.moderatorIds.filter((id) => id !== playerId);
  }

  public promoteToModerator(playerId: string): void {
    if (!this.moderatorIds.includes(playerId)) {
      this.moderatorIds.push(playerId);
    }
  }

  public isModerator(playerId?: string): boolean {
    return isPlayerModerator({
      createdById: this.createdById,
      playerId,
      moderatorIds: this.moderatorIds,
      isAllowMembersToManageSession: this.isAllowMembersToManageSession,
    });
  }

  public submitVote(playerId: string, value: number): void {
    if (this.isFinished) {
      throw new Error('Cannot vote on a finished game');
    }
    const player = this.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error('Player not found in game');
    }
    player.vote(value);

    // If autoReveal is true, check if all players have voted
    if (this.autoReveal) {
      const activePlayers = this.players.filter((p) => !p.isNonVoter);
      const allVoted = activePlayers.every((p) => p.status === 'Finished');
      if (allVoted && activePlayers.length > 0) {
        this.revealCurrentTask();
      }
    }
  }

  public calculateClosestScore(): string | undefined {
    const finishedPlayers = this.players.filter(
      (p) => p.status === 'Finished' && p.value !== undefined
    );
    if (finishedPlayers.length === 0) return undefined;

    const values = finishedPlayers
      .map((p) => (typeof p.value === 'number' ? p.value : Number(p.value)))
      .filter((v) => !isNaN(v));
    if (values.length === 0) return undefined;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    const availableValues = this.cards
      .map((c) => Number(c.value))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b);

    if (availableValues.length === 0) return undefined;

    let closest = availableValues[0];
    let minDiff = Math.abs(avg - closest);

    for (const val of availableValues) {
      const diff = Math.abs(avg - val);
      if (diff < minDiff) {
        minDiff = diff;
        closest = val;
      } else if (Math.abs(diff - minDiff) < 0.0001) {
        if (val > closest) {
          closest = val;
        }
      }
    }

    const matchingCard = this.cards.find((c) => Number(c.value) === closest);
    return matchingCard ? matchingCard.displayValue : String(closest);
  }

  public revealCurrentTask(): void {
    if (!this.currentTaskId) return;
    const task = this.tasks.find((t) => t.id === this.currentTaskId);
    if (task) {
      const closestScore = this.calculateClosestScore();
      task.reveal(closestScore);
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
