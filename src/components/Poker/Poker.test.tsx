import { render, screen } from '@testing-library/react';
import * as playersService from '../../service/players';
import { Game } from '../../core/domain/entities/Game';
import { Player, PlayerStatus } from '../../core/domain/entities/Player';
import { Poker } from './Poker'
import { vi } from 'vitest';

vi.mock('../../service/players');
const mockNavigate = vi.fn();
let blockCallback: ((params: { historyAction: string }) => boolean) | undefined;

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'zz' }),
  useNavigate: () => mockNavigate,
  useBlocker: (blocker: unknown) => {
    blockCallback = blocker as (params: { historyAction: string }) => boolean;
    return {} as any;
  },
}));

describe('Poker component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    blockCallback = undefined;
  });
  it('should display game not found', async () => {
    const mockStore = (globalThis as any).mockStoreState;
    mockStore.game = null;
    mockStore.players = [];
    mockStore.isLoading = false;

    render(<Poker />);
    await screen.findByText('Game not found');
  });
  it('should display game area when game is found', async () => {
    const mockGame = new Game('zz', 'avengers', false);
    mockGame.createdById = 'IronMan';
    mockGame.cards = [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: '3', color: 'green' },
    ];
    const mockPlayerObj = new Player('xx', ' xyz');
    mockPlayerObj.status = PlayerStatus.NotStarted;
    mockPlayerObj.value = 0;

    const mockStore = (globalThis as any).mockStoreState;
    mockStore.game = mockGame;
    mockStore.players = [mockPlayerObj];
    mockStore.isLoading = false;

    vi.spyOn(playersService, 'getCurrentPlayerId').mockReturnValue('xx');
    render(<Poker />);

    await screen.findByText('avengers');

    expect(screen.getByText('avengers')).toBeInTheDocument();
    expect(screen.getByText('Not started 🚀')).toBeInTheDocument();
  });
  it('should display confirmation dialog when user clicks the back button', async () => {
    const mockGame = new Game('zz', 'avengers', false);
    mockGame.createdById = 'IronMan';
    mockGame.cards = [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: '3', color: 'green' },
    ];
    const mockPlayerObj = new Player('xx', 'xyz');
    mockPlayerObj.status = PlayerStatus.NotStarted;
    mockPlayerObj.value = 0;

    const mockStore = (globalThis as any).mockStoreState;
    mockStore.game = mockGame;
    mockStore.players = [mockPlayerObj];
    mockStore.isLoading = false;

    vi.spyOn(playersService, 'getCurrentPlayerId').mockReturnValue('xx');

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<Poker />);

    await screen.findByText('avengers');

    // Simulate back navigation by invoking the blocker callback
    blockCallback?.({ historyAction: 'POP' });

    // Assert that the confirmation dialog was shown
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to go back?');

    // Cleanup the mock
    confirmSpy.mockRestore();
  });
});
