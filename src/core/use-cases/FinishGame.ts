import { IGameRepository } from '../domain/repositories/IGameRepository';

export class FinishGame {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string): Promise<void> {
    await this.gameRepository.runGameTransaction(gameId, (game) => {
      game.finish();
    });
  }
}
