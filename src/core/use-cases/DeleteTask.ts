import { IGameRepository } from '../domain/repositories/IGameRepository';

export class DeleteTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, taskId: string): Promise<void> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    const tasksCountBefore = game.tasks.length;
    game.tasks = game.tasks.filter((t) => t.id !== taskId);

    if (game.tasks.length !== tasksCountBefore) {
      if (game.currentTaskId === taskId) {
        game.currentTaskId = game.tasks.length > 0 ? game.tasks[0].id : undefined;
      }
      await this.gameRepository.save(game);
    }
  }
}
