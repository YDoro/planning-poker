import { IGameRepository } from '../domain/repositories/IGameRepository';

export class EditTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, taskId: string, updates: { title?: string; description?: string; score?: string; taskCode?: string }): Promise<void> {
    await this.gameRepository.runGameTransaction(gameId, (game) => {
      const task = game.tasks.find((t) => t.id === taskId);
      if (!task) throw new Error('Task not found');

      if (updates.title !== undefined) task.title = updates.title;
      if (updates.description !== undefined) task.description = updates.description;
      if (updates.score !== undefined) task.score = updates.score;
      if (updates.taskCode !== undefined) task.taskCode = updates.taskCode;
    });
  }
}
