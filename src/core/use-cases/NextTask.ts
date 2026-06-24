import { IGameRepository } from '../domain/repositories/IGameRepository';

export class NextTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, score?: string, skipped?: boolean): Promise<void> {
    // goToNextTask resets every player's vote, so load and persist them all.
    const playerIds = await this.gameRepository.listPlayerIds(gameId);
    await this.gameRepository.runGameTransaction(
      gameId,
      (game) => game.goToNextTask(score, skipped),
      { loadPlayerIds: playerIds, persistPlayerIds: playerIds }
    );
  }
}
