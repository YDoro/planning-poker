import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SetDontVote } from './SetDontVote';
import { Game } from '../domain/entities/Game';
import { Player, PlayerStatus } from '../domain/entities/Player';
import { IGameRepository } from '../domain/repositories/IGameRepository';

describe('SetDontVote', () => {
  let gameRepository: IGameRepository;
  let useCase: SetDontVote;

  beforeEach(() => {
    gameRepository = {
      getById: vi.fn(),
      save: vi.fn(),
      savePlayer: vi.fn(),
      delete: vi.fn(),
      streamGame: vi.fn(),
      streamPlayers: vi.fn(),
      removePlayer: vi.fn(),
      runGameTransaction: vi.fn(),
      listPlayerIds: vi.fn(),
    } as unknown as IGameRepository;

    useCase = new SetDontVote(gameRepository);
  });

  it('should toggle isNonVoter property for the player and persist the change', async () => {
    const mockPlayer = new Player('player-123', 'John Doe', PlayerStatus.NotStarted, undefined, false);
    const mockGame = new Game(
      'game-123',
      'Sprint Estimation',
      false,
      undefined,
      [],
      [mockPlayer],
      [],
      'John Doe',
      'player-123'
    );

    vi.spyOn(gameRepository, 'runGameTransaction').mockImplementation(
      async (_gameId, mutator) => {
        mutator(mockGame);
      }
    );

    // Call first time: should toggle isNonVoter from false to true
    await useCase.execute('game-123', 'player-123');

    expect(mockPlayer.isNonVoter).toBe(true);
    expect(gameRepository.runGameTransaction).toHaveBeenCalledWith(
      'game-123',
      expect.any(Function),
      { loadPlayerIds: ['player-123'], persistPlayerIds: ['player-123'] }
    );

    // Call second time: should toggle isNonVoter from true to false
    await useCase.execute('game-123', 'player-123');

    expect(mockPlayer.isNonVoter).toBe(false);
  });

  it('should propagate the error when the game is not found', async () => {
    vi.spyOn(gameRepository, 'runGameTransaction').mockRejectedValue(
      new Error('Game not found')
    );

    await expect(useCase.execute('invalid-game', 'player-123')).rejects.toThrow('Game not found');
  });

  it('should throw an error if the player is not found inside the game', async () => {
    const mockGame = new Game(
      'game-123',
      'Sprint Estimation',
      false,
      undefined,
      [],
      [],
      [],
      'John Doe',
      'player-123'
    );

    vi.spyOn(gameRepository, 'runGameTransaction').mockImplementation(
      async (_gameId, mutator) => {
        mutator(mockGame);
      }
    );

    await expect(useCase.execute('game-123', 'invalid-player')).rejects.toThrow('Player not found');
  });
});
