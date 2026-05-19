import { Game } from '../entities/Game';
import { Player } from '../entities/Player';

export interface IGameRepository {
  getById(gameId: string): Promise<Game | null>;
  save(game: Game): Promise<void>;
  delete(gameId: string): Promise<void>;
  streamGame(gameId: string, callback: (game: Game) => void): () => void;
  streamPlayers(gameId: string, callback: (players: Player[]) => void): () => void;
  savePlayer(gameId: string, player: Player): Promise<void>;
  removePlayer(gameId: string, playerId: string): Promise<void>;
}
