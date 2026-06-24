import { IGameRepository } from '../domain/repositories/IGameRepository';

export class PromotePlayerToModerator {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, playerId: string): Promise<void> {
    await this.gameRepository.runGameTransaction(gameId, (game) => {
      game.promoteToModerator(playerId);
    });
  }
}
