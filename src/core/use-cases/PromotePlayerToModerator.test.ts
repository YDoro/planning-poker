import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PromotePlayerToModerator } from './PromotePlayerToModerator';
import { Game } from '../domain/entities/Game';
import { Player } from '../domain/entities/Player';
import { IGameRepository } from '../domain/repositories/IGameRepository';

describe('PromotePlayerToModerator', () => {
  let gameRepository: IGameRepository;
  let useCase: PromotePlayerToModerator;

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

    useCase = new PromotePlayerToModerator(gameRepository);
  });

  it('should add the player to moderatorIds and persist the change', async () => {
    const mockPlayer = new Player('player-123', 'John Doe');
    const mockGame = new Game(
      'game-123',
      'Sprint Estimation',
      false,
      undefined,
      [],
      [mockPlayer],
      [],
      'Creator',
      'creator-1'
    );

    vi.spyOn(gameRepository, 'getById').mockResolvedValue(mockGame);

    await useCase.execute('game-123', 'player-123');

    expect(mockGame.moderatorIds).toContain('player-123');
    expect(gameRepository.save).toHaveBeenCalledWith(mockGame);
  });

  it('should not duplicate a player already in moderatorIds', async () => {
    const mockGame = new Game(
      'game-123',
      'Sprint Estimation',
      false,
      undefined,
      [],
      [],
      [],
      'Creator',
      'creator-1'
    );
    mockGame.moderatorIds = ['player-123'];

    vi.spyOn(gameRepository, 'getById').mockResolvedValue(mockGame);

    await useCase.execute('game-123', 'player-123');

    expect(mockGame.moderatorIds).toEqual(['player-123']);
    expect(gameRepository.save).toHaveBeenCalledWith(mockGame);
  });

  it('should throw an error if the game is not found', async () => {
    vi.spyOn(gameRepository, 'getById').mockResolvedValue(null);

    await expect(useCase.execute('invalid-game', 'player-123')).rejects.toThrow('Game not found');
    expect(gameRepository.save).not.toHaveBeenCalled();
  });
});
