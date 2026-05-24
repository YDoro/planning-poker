import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Game } from '../../../core/domain/entities/Game';
import { Player, PlayerStatus } from '../../../core/domain/entities/Player';
import { Task } from '../../../core/domain/entities/Task';
import { PlayerCard } from './PlayerCard';
import { vi } from 'vitest';

describe('PlayerCard component', () => {
  beforeEach(() => {
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) {
      mockStore.removePlayer.mockClear();
      mockStore.game = createMockGame();
    }
  });

  const createMockGame = () => {
    const game = new Game('xyz', 'testGame', false);
    game.createdById = 'abc';
    game.cards = [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: '3', color: 'green' },
    ];
    const task = new Task('task-1', 'Story 1', '', 'voting');
    game.tasks = [task];
    game.currentTaskId = 'task-1';
    return game;
  };

  const createMockPlayer = () => {
    const player = new Player('a1', 'SpiderMan');
    player.status = PlayerStatus.InProgress;
    player.value = 0;
    return player;
  };

  it('should display Player name', () => {
    const player = createMockPlayer();
    render(
      <PlayerCard player={player} currentPlayerId="a1" />,
    );

    expect(screen.getAllByText(player.name)[0]).toBeInTheDocument();
  });

  it('should display thinking emoji when Player has not voted', () => {
    render(
      <PlayerCard player={createMockPlayer()} currentPlayerId="a1" />,
    );

    expect(screen.getByTestId('brain-emoji')).toBeInTheDocument();
  });

  it('should display thumbs up emoji when Player has voted', () => {
    const player = createMockPlayer();
    player.status = PlayerStatus.Finished;
    render(
      <PlayerCard player={player} currentPlayerId="a1" />,
    );

    expect(screen.getByTestId('check-emoji')).toBeInTheDocument();
  });

  it('should display coffee up emoji when Player has voted but value is -1 and Game is finished', () => {
    const player = createMockPlayer();
    player.status = PlayerStatus.Finished;
    player.value = -1;
    const game = createMockGame();
    game.isFinished = true;
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) mockStore.game = game;

    render(
      <PlayerCard
        player={player}
        currentPlayerId="a1"
      />,
    );

    expect(screen.getByText('☕')).toBeInTheDocument();
  });

  it('should display correct when Player has voted and Game is finished', () => {
    const player = createMockPlayer();
    player.status = PlayerStatus.Finished;
    player.value = 3; // displayValue is '3'
    const game = createMockGame();
    game.isFinished = true;
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) mockStore.game = game;

    render(
      <PlayerCard
        player={player}
        currentPlayerId="a1"
      />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display correct color when Player card is revealed', () => {
    const player = createMockPlayer();
    player.status = PlayerStatus.Finished;
    player.value = 1; 
    const game = createMockGame();
    game.isFinished = true;
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) mockStore.game = game;

    render(
      <PlayerCard
        player={player}
        currentPlayerId="a1"
      />,
    );

    const cardElement = screen.getByTestId('player-card-ui');
    expect(cardElement).toHaveStyle({ backgroundColor: '#9EC8FE' });
  });

  it('should display thinking emoji when Player has not voted and Game is finished', () => {
    const player = createMockPlayer();
    player.status = PlayerStatus.InProgress;
    const game = createMockGame();
    game.isFinished = true;
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) mockStore.game = game;

    render(
      <PlayerCard
        player={player}
        currentPlayerId="a1"
      />,
    );

    expect(screen.getByTestId('minus-emoji')).toBeInTheDocument();
  });

  it('should display remove icon for moderator', () => {
    const player = createMockPlayer();
    const game = createMockGame();
    game.createdById = 'moderator-1';
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) mockStore.game = game;

    render(
      <PlayerCard
        player={player}
        currentPlayerId="moderator-1"
      />,
    );

    expect(screen.getByTestId('remove-button')).toBeInTheDocument();
  });

  it('should not display remove icon for non moderator', () => {
    const player = createMockPlayer();
    const game = createMockGame();
    game.createdById = 'moderator-1';
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) mockStore.game = game;

    render(
      <PlayerCard
        player={player}
        currentPlayerId="a2" // not moderator, not own card
      />,
    );

    expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument();
  });

  it('should not display remove icon for moderator card', () => {
    const player = new Player('moderator-1', 'SpiderMan');
    const game = createMockGame();
    game.createdById = 'moderator-1';
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) mockStore.game = game;

    render(
      <PlayerCard
        player={player}
        currentPlayerId="moderator-1"
      />,
    );

    expect(screen.queryByTestId('remove-button')).not.toBeInTheDocument();
  });

  it('should call remove function on Remove action', async () => {
    const player = createMockPlayer();
    const game = createMockGame();
    game.createdById = 'moderator-1';
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) mockStore.game = game;

    render(
      <PlayerCard
        player={player}
        currentPlayerId="moderator-1"
      />,
    );

    await userEvent.click(screen.getByTestId('remove-button'));
    expect(mockStore.removePlayer).toHaveBeenCalledWith('xyz', 'a1');
  });
});
