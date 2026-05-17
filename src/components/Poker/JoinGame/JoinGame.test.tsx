import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as gameService from '../../../service/games';
import * as playersService from '../../../service/players';
import { Game } from '../../../types/game';
import { JoinGame } from './JoinGame';
import { vi } from 'vitest';

vi.mock('../../../service/players');
vi.mock('../../../service/games');

const mockNavigate = vi.fn();
let mockParams: Record<string, string> = { id: '' };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

describe('JoinGame component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockParams = { id: '' };
    localStorage.clear();
  });

  it('should display correct text fields', () => {
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);

    render(<JoinGame />);

    expect(screen.getByPlaceholderText('xyz...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('should pre-fill the name field from localStorage', () => {
    localStorage.setItem('recentPlayerName', 'Alice');
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);

    render(<JoinGame />);
    expect(screen.getByPlaceholderText('Enter your name')).toHaveValue('Alice');
  });

  it('should display join button', () => {
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);
    render(<JoinGame />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Join');
  });

  it('should be able to join a session', async () => {
    vi.spyOn(playersService, 'addPlayerToGame').mockResolvedValue(true);
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);
    render(<JoinGame />);
    const sessionID = screen.getByPlaceholderText('xyz...');
    await userEvent.clear(sessionID);
    await userEvent.type(sessionID, 'gameId');

    const userName = screen.getByPlaceholderText('Enter your name');
    await userEvent.type(userName, 'Rock');

    const joinButton = screen.getByText('Join');

    await userEvent.click(joinButton);

    expect(playersService.addPlayerToGame).toHaveBeenCalled();

    expect(playersService.addPlayerToGame).toHaveBeenCalledWith('gameId', 'Rock');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game/gameId'));
    // Check that the name is saved to localStorage
    expect(localStorage.getItem('recentPlayerName')).toBe('Rock');
  });

  it('should automatically join the game when player has already joined', async () => {
    const gameId = 'abc';
    mockParams = { id: gameId };
    vi.spyOn(gameService, 'getGame').mockResolvedValue({ id: gameId } as Game);
    vi.spyOn(playersService, 'addPlayerToGame').mockResolvedValue(true);
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(true);

    render(<JoinGame />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game/abc'));
  });

  it('should not automatically join the game when player it not in the game', async () => {
    const gameId = 'abc';
    mockParams = { id: gameId };
    vi.spyOn(gameService, 'getGame').mockResolvedValue({ id: gameId } as Game);
    vi.spyOn(playersService, 'addPlayerToGame').mockResolvedValue(true);
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);

    render(<JoinGame />);

    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });
});
