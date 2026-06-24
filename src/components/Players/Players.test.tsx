import { render, screen } from '@testing-library/react';
import { Game } from '../../core/domain/entities/Game';
import { Player } from '../../core/domain/entities/Player';
import { Players } from './Players';

describe('Players component', () => {
  const createMockGame = () => {
    const game = new Game('xyz', 'testGame', false);
    game.createdById = 'abc';
    game.cards = [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: '3', color: 'green' },
    ];
    return game;
  };

  const createMockPlayers = () => {
    const p1 = new Player('a1', 'SpiderMan');
    const p2 = new Player('a2', 'IronMan');
    return [p1, p2];
  };

  it('should display all players', () => {
    const players = createMockPlayers();
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) {
      mockStore.game = createMockGame();
      mockStore.players = players;
    }

    render(<Players currentPlayerId="a1" />);

    players.forEach((player: Player) => {
      expect(screen.getAllByText(player.name)[0]).toBeInTheDocument();
    });
  });
});
