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

    vi.spyOn(gameRepository, 'getById').mockResolvedValue(mockGame);

    // Call first time: should toggle isNonVoter from false to true
    await useCase.execute('game-123', 'player-123');

    expect(mockPlayer.isNonVoter).toBe(true);
    expect(gameRepository.savePlayer).toHaveBeenCalledWith('game-123', mockPlayer);
    expect(gameRepository.save).toHaveBeenCalledWith(mockGame);

    // Call second time: should toggle isNonVoter from true to false
    await useCase.execute('game-123', 'player-123');

    expect(mockPlayer.isNonVoter).toBe(false);
  });

  it('should throw an error if the game is not found', async () => {
    vi.spyOn(gameRepository, 'getById').mockResolvedValue(null);

    await expect(useCase.execute('invalid-game', 'player-123')).rejects.toThrow('Game not found');
    expect(gameRepository.savePlayer).not.toHaveBeenCalled();
    expect(gameRepository.save).not.toHaveBeenCalled();
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

    vi.spyOn(gameRepository, 'getById').mockResolvedValue(mockGame);

    await expect(useCase.execute('game-123', 'invalid-player')).rejects.toThrow('Player not found');
    expect(gameRepository.savePlayer).not.toHaveBeenCalled();
    expect(gameRepository.save).not.toHaveBeenCalled();
  });
});
