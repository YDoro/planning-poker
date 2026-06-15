import { IGameRepository } from '../domain/repositories/IGameRepository';

export class PromotePlayerToModerator {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, playerId: string): Promise<void> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    game.promoteToModerator(playerId);
    await this.gameRepository.save(game);
  }
}
