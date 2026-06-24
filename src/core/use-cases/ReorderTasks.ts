import { Task } from '../domain/entities/Task';
import { IGameRepository } from '../domain/repositories/IGameRepository';

export class ReorderTasks {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, orderedTasks: Task[]): Promise<void> {
    // Reorder the *fresh* tasks by the requested id order instead of replacing
    // the array with the client's (possibly stale) snapshot, so concurrent task
    // edits are preserved. Unknown ids (tasks added concurrently) go to the end.
    const order = orderedTasks.map((t) => t.id);
    const rank = (id: string) => {
      const index = order.indexOf(id);
      return index === -1 ? order.length : index;
    };

    await this.gameRepository.runGameTransaction(gameId, (game) => {
      game.tasks = [...game.tasks].sort((a, b) => rank(a.id) - rank(b.id));
    });
  }
}
