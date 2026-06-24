import { IGameRepository } from "../domain/repositories/IGameRepository";

export class SetDontVote {
    constructor(private gameRepository: IGameRepository) { }

    async execute(gameId: string, playerId: string): Promise<void> {
        await this.gameRepository.runGameTransaction(
            gameId,
            (game) => {
                const player = game.players.find(p => p.id === playerId);
                if (!player) throw new Error('Player not found');
                player.toggleDontVote();
            },
            { loadPlayerIds: [playerId], persistPlayerIds: [playerId] }
        );
    }
}