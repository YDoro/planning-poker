import { IGameRepository } from '../domain/repositories/IGameRepository';

export class UpdateStoryName {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, storyName: string): Promise<void> {
    await this.gameRepository.runGameTransaction(gameId, (game) => {
      game.storyName = storyName;
    });
  }
}
