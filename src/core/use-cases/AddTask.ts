import { ulid } from 'ulid';
import { Task } from '../domain/entities/Task';
import { IGameRepository } from '../domain/repositories/IGameRepository';

export class AddTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, taskInput: { title: string; description: string; taskCode?: string }): Promise<void> {
    await this.gameRepository.runGameTransaction(gameId, (game) => {
      const newTask = new Task(
        ulid(),
        taskInput.title,
        taskInput.description,
        'pending',
        undefined,
        taskInput.taskCode
      );

      const isFirstTask = game.tasks.length === 0;
      if (isFirstTask) {
        newTask.status = 'voting';
        game.currentTaskId = newTask.id;
      }

      game.tasks.push(newTask);
    });
  }
}
