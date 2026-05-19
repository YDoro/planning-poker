import { IGameRepository } from '../domain/repositories/IGameRepository';

export class ChangeCurrentTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, taskId: string): Promise<void> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    const task = game.tasks.find((t) => t.id === taskId);
    if (task) {
      if (task.status === 'pending') {
        task.startVoting();
      }
      game.currentTaskId = taskId;
      game.isFinished = false;

      // Reset votes for all players
      game.players.forEach((p) => p.resetVote());

      await this.gameRepository.save(game);
      for (const player of game.players) {
        await this.gameRepository.savePlayer(gameId, player);
      }
    }
  }
}
