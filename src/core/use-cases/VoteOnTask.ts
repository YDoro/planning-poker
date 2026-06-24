import { IGameRepository } from '../domain/repositories/IGameRepository';

export class VoteOnTask {
  constructor(private gameRepository: IGameRepository) { }

  async execute(gameId: string, playerId: string, cardValue: number): Promise<void> {
    // Load every player so auto-reveal evaluates fresh votes; persist only the voter.
    const playerIds = await this.gameRepository.listPlayerIds(gameId);
    await this.gameRepository.runGameTransaction(
      gameId,
      (game) => game.submitVote(playerId, cardValue),
      { loadPlayerIds: playerIds, persistPlayerIds: [playerId] }
    );
  }
}
