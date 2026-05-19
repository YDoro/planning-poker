import { render, screen } from '@testing-library/react';
import { Game } from '../../../core/domain/entities/Game';
import { Player } from '../../../core/domain/entities/Player';
import { Task } from '../../../core/domain/entities/Task';
import { GameArea } from './GameArea';
import { vi } from 'vitest';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('GameArea component', () => {
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

  const createMockPlayers = () => {
    const p1 = new Player('a1', 'SpiderMan');
    const p2 = new Player('a2', 'IronMan');
    return [p1, p2];
  };

  it('should display players', () => {
    const players = createMockPlayers();
    render(
      <DndProvider backend={HTML5Backend}>
        <GameArea game={createMockGame()} players={players} currentPlayerId="a1" />
      </DndProvider>
    );

    players.forEach((player: Player) => {
      expect(screen.getAllByText(player.name)[0]).toBeInTheDocument();
    });
  });

  it('should display game controller with name', () => {
    const game = createMockGame();
    render(
      <DndProvider backend={HTML5Backend}>
        <GameArea game={game} players={createMockPlayers()} currentPlayerId="a1" />
      </DndProvider>
    );
    expect(screen.getByText(game.name)).toBeInTheDocument();
  });

  it('should display card picker', () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <GameArea game={createMockGame()} players={createMockPlayers()} currentPlayerId="a1" />
      </DndProvider>
    );

    expect(screen.queryAllByText('1').length).toBeGreaterThan(0);
  });
});
