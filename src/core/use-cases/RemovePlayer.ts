import { IGameRepository } from '../domain/repositories/IGameRepository';

export class RemovePlayer {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, playerId: string): Promise<void> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    game.removePlayer(playerId);
    await this.gameRepository.removePlayer(gameId, playerId);
  }
}
