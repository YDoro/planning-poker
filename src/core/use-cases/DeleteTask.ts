import { IGameRepository } from '../domain/repositories/IGameRepository';

export class DeleteTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, taskId: string): Promise<void> {
    await this.gameRepository.runGameTransaction(gameId, (game) => {
      const tasksCountBefore = game.tasks.length;
      game.tasks = game.tasks.filter((t) => t.id !== taskId);

      if (game.tasks.length !== tasksCountBefore && game.currentTaskId === taskId) {
        game.currentTaskId = game.tasks.length > 0 ? game.tasks[0].id : undefined;
      }
    });
  }
}
