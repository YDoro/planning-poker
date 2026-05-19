import { IGameRepository } from "../domain/repositories/IGameRepository";

export class SetDontVote {
    constructor(private gameRepository: IGameRepository) { }

    async execute(gameId: string, playerId: string): Promise<void> {
        const game = await this.gameRepository.getById(gameId);
        if (!game) throw new Error('Game not found');

        const player = game.players.find(p => p.id === playerId);
        if (!player) throw new Error('Player not found');

        player.toggleDontVote();

        await this.gameRepository.savePlayer(gameId, player);
        await this.gameRepository.save(game);
    }
}