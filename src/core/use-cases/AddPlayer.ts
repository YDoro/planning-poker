import { ulid } from 'ulid';
import { Player, PlayerStatus } from '../domain/entities/Player';
import { IGameRepository } from '../domain/repositories/IGameRepository';

export class AddPlayer {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, playerName: string): Promise<string> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    const playerId = ulid();
    const player = new Player(
      playerId,
      playerName,
      PlayerStatus.NotStarted
    );

    game.addPlayer(player);
    await this.gameRepository.savePlayer(gameId, player);
    return playerId;
  }
}
