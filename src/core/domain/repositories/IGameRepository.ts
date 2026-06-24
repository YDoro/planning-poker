import { Game } from '../entities/Game';
import { Player } from '../entities/Player';

export interface GameTransactionOptions {
  /** Player docs read inside the transaction so the mutator sees fresh state (e.g. autoReveal/reset). */
  loadPlayerIds?: string[];
  /** Player docs to persist after the mutation (default: none). */
  persistPlayerIds?: string[];
}

export interface IGameRepository {
  getById(gameId: string): Promise<Game | null>;
  save(game: Game): Promise<void>;
  delete(gameId: string): Promise<void>;
  streamGame(gameId: string, callback: (game: Game) => void): () => void;
  streamPlayers(gameId: string, callback: (players: Player[]) => void): () => void;
  savePlayer(gameId: string, player: Player): Promise<void>;
  removePlayer(gameId: string, playerId: string): Promise<void>;
  /**
   * Atomically read-modify-write the game (and optionally some player docs)
   * inside a Firestore transaction. The mutator runs on fresh state and is
   * re-executed automatically if a read document changes before commit,
   * preventing concurrent actions from overwriting each other.
   */
  runGameTransaction(
    gameId: string,
    mutator: (game: Game) => void,
    options?: GameTransactionOptions
  ): Promise<void>;
  /** Lightweight read of the current player ids in a game (outside any transaction). */
  listPlayerIds(gameId: string): Promise<string[]>;
}
