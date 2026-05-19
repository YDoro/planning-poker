import { IGameRepository } from '../domain/repositories/IGameRepository';

export class FinishGame {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string): Promise<void> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    game.finish();
    await this.gameRepository.save(game);
  }
}
