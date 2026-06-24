import { IGameRepository } from '../domain/repositories/IGameRepository';

export class RevealCards {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string): Promise<void> {
    // revealCurrentTask computes the closest score from player votes,
    // so load the players into the transaction.
    const playerIds = await this.gameRepository.listPlayerIds(gameId);
    await this.gameRepository.runGameTransaction(
      gameId,
      (game) => game.revealCurrentTask(),
      { loadPlayerIds: playerIds }
    );
  }
}
