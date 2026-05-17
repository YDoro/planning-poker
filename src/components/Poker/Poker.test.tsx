import { render, screen } from '@testing-library/react';
import * as gamesService from '../../service/games';
import * as playersService from '../../service/players';
import { Game } from '../../types/game';
import { Player } from '../../types/player';
import { Status } from '../../types/status';
import { Poker } from './Poker'
import { vi } from 'vitest';

vi.mock('../../service/players');
// vi.mock('../../service/games');
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
    vi.spyOn(gamesService, 'streamGame').mockImplementation(() => {
      return {
        onSnapshot: vi.fn((success) => success({ exists: false })),
      } as any;
    });
    vi.spyOn(gamesService, 'streamPlayers').mockImplementation(() => {
      return {
        onSnapshot: vi.fn(() => Promise.resolve(true)),
      } as any;
    });
    render(<Poker />);
    await screen.findByText('Game not found');
  });
  it('should display game area when game is found', async () => {
    const mockGame: Game = {
      id: 'abc',
      name: 'avengers',
      cards: [
        { value: 1, displayValue: '1', color: 'red' },
        { value: 2, displayValue: '2', color: 'blue' },
        { value: 3, displayValue: '3', color: 'green' },
      ],
      createdBy: 'IronMan',
      gameStatus: Status.NotStarted,
    } as Game;
    const mockPlayers: Player[] = [
      {
        id: 'xx',
        name: ' xyz',
        status: Status.NotStarted,
        value: 0,
      },
    ] as Player[];
    vi.spyOn(gamesService, 'streamGame').mockImplementation(() => {
      return {
        onSnapshot: vi.fn((success) => success({ exists: true, data: () => mockGame })),
      } as any;
    });
    vi.spyOn(gamesService, 'streamPlayers').mockImplementation(() => {
      return {
        onSnapshot: vi.fn((success) => success({ exists: true, forEach: () => mockPlayers })),
      } as any;
    });

    vi.spyOn(playersService, 'getCurrentPlayerId').mockReturnValue('xx');
    render(<Poker />);

    await screen.findByText(mockGame.name);

    expect(screen.getByText(mockGame.name)).toBeInTheDocument();
    expect(screen.getByText(`${mockGame.gameStatus} 🚀`)).toBeInTheDocument();
  });
  it('should display confirmation dialog when user clicks the back button', async () => {
    const mockGame: Game = {
      id: 'abc',
      name: 'avengers',
      cards: [
        { value: 1, displayValue: '1', color: 'red' },
        { value: 2, displayValue: '2', color: 'blue' },
        { value: 3, displayValue: '3', color: 'green' },
      ],
      createdBy: 'IronMan',
      gameStatus: Status.NotStarted,
    } as Game;

    const mockPlayers: Player[] = [
      {
        id: 'xx',
        name: 'xyz',
        status: Status.NotStarted,
        value: 0,
      },
    ] as Player[];

    vi.spyOn(gamesService, 'streamGame').mockImplementation(() => {
      return {
        onSnapshot: vi.fn((success) => success({ exists: true, data: () => mockGame })),
      } as any;
    });

    vi.spyOn(gamesService, 'streamPlayers').mockImplementation(() => {
      return {
        onSnapshot: vi.fn((success) => success({ exists: true, forEach: () => mockPlayers })),
      } as any;
    });

    vi.spyOn(playersService, 'getCurrentPlayerId').mockReturnValue('xx');

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<Poker />);

    await screen.findByText(mockGame.name);

    // Simulate back navigation by invoking the blocker callback
    blockCallback?.({ historyAction: 'POP' });

    // Assert that the confirmation dialog was shown
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to go back?');

    // Cleanup the mock
    confirmSpy.mockRestore();
  });
});
