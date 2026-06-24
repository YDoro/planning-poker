import { IGameRepository } from '../domain/repositories/IGameRepository';

export class ChangeCurrentTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, taskId: string): Promise<void> {
    // Switching the current task resets every player's vote, so load and persist them all.
    const playerIds = await this.gameRepository.listPlayerIds(gameId);
    await this.gameRepository.runGameTransaction(
      gameId,
      (game) => {
        const task = game.tasks.find((t) => t.id === taskId);
        if (!task) return;

        if (task.status === 'pending') {
          task.startVoting();
        }
        game.currentTaskId = taskId;
        game.isFinished = false;

        // Reset votes for all players
        game.players.forEach((p) => p.resetVote());
      },
      { loadPlayerIds: playerIds, persistPlayerIds: playerIds }
    );
  }
}
