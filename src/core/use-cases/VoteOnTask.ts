import { IGameRepository } from '../domain/repositories/IGameRepository';

export class VoteOnTask {
  constructor(private gameRepository: IGameRepository) {}

  async execute(gameId: string, playerId: string, cardValue: number, emoji: string): Promise<void> {
    const game = await this.gameRepository.getById(gameId);
    if (!game) throw new Error('Game not found');

    game.submitVote(playerId, cardValue, emoji);

    // Save the updated player state
    const player = game.players.find((p) => p.id === playerId);
    if (player) {
      await this.gameRepository.savePlayer(gameId, player);
    }

    // Save the game (in case auto-reveal modified task statuses)
    await this.gameRepository.save(game);
  }
}
