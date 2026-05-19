import { IGameRepository } from '../domain/repositories/IGameRepository';

export class NextTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, score?: string, skipped?: boolean): Promise<void> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    game.goToNextTask(score, skipped);

    // Save the game document (updated tasks list, currentTaskId, isFinished flag)
    await this.gameRepository.save(game);

    // Save all player documents (reset status/vote)
    for (const player of game.players) {
      await this.gameRepository.savePlayer(gameId, player);
    }
  }
}
