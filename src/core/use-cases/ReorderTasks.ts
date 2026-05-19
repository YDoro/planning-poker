import { Task } from '../domain/entities/Task';
import { IGameRepository } from '../domain/repositories/IGameRepository';

export class ReorderTasks {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, orderedTasks: Task[]): Promise<void> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    game.tasks = orderedTasks;
    await this.gameRepository.save(game);
  }
}
