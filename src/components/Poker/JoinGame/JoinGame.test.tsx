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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('JoinGame component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockParams = { id: '' };
    localStorage.clear();
  });

  it('should render the form correctly', () => {
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);

    render(<JoinGame open={true} onClose={() => { }} />);

    expect(screen.getByPlaceholderText('JoinGame.sessionIdPlaceholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('JoinGame.playerNamePlaceholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /JoinGame.joinGameButton/i })).toBeInTheDocument();
  });

  it('should pre-fill the name field from localStorage', () => {
    localStorage.setItem('recentPlayerName', 'Alice');
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);

    render(<JoinGame open={true} onClose={() => { }} />);
    expect(screen.getByPlaceholderText('JoinGame.playerNamePlaceholder')).toHaveValue('Alice');
  });

  it('should be able to join a session', async () => {
    vi.spyOn(playersService, 'addPlayerToGame').mockResolvedValue(true);
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);
    render(<JoinGame open={true} onClose={() => { }} />);
    const sessionID = screen.getByPlaceholderText('JoinGame.sessionIdPlaceholder');
    await userEvent.clear(sessionID);
    await userEvent.type(sessionID, 'gameId');

    const userName = screen.getByPlaceholderText('JoinGame.playerNamePlaceholder');
    await userEvent.type(userName, 'Rock');

    const joinButton = screen.getByRole('button', { name: /JoinGame.joinGameButton/i });

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

    render(<JoinGame open={true} onClose={() => { }} />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game/abc'));
  });

  it('should not automatically join the game when player it not in the game', async () => {
    const gameId = 'abc';
    mockParams = { id: gameId };
    vi.spyOn(gameService, 'getGame').mockResolvedValue({ id: gameId } as Game);
    vi.spyOn(playersService, 'addPlayerToGame').mockResolvedValue(true);
    vi.spyOn(playersService, 'isCurrentPlayerInGame').mockResolvedValue(false);

    render(<JoinGame open={true} onClose={() => { }} />);

    expect(screen.getByPlaceholderText('JoinGame.playerNamePlaceholder')).toBeInTheDocument();
  });
});
