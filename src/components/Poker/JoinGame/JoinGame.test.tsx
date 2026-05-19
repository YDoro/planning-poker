import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinGame } from './JoinGame';
import { vi } from 'vitest';
import * as playersService from '../../../service/players';

const mockGetById = vi.fn();

vi.mock('../../../infrastructure/firebase/FirebaseGameRepository', () => {
  return {
    FirebaseGameRepository: class {
      getById = mockGetById;
    },
  };
});

vi.mock('../../../service/players');

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
    mockGetById.mockReset().mockResolvedValue(null);
    const mockStore = (globalThis as any).mockStoreState;
    if (mockStore) {
      mockStore.addPlayer.mockClear();
    }
  });

  it('should render the form correctly', () => {
    vi.spyOn(playersService, 'getCurrentPlayerId').mockReturnValue(undefined);

    render(<JoinGame open={true} onClose={() => { }} />);

    expect(screen.getByPlaceholderText('JoinGame.sessionIdPlaceholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('JoinGame.playerNamePlaceholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /JoinGame.joinGameButton/i })).toBeInTheDocument();
  });

  it('should pre-fill the name field from localStorage', () => {
    localStorage.setItem('recentPlayerName', 'Alice');
    vi.spyOn(playersService, 'getCurrentPlayerId').mockReturnValue(undefined);

    render(<JoinGame open={true} onClose={() => { }} />);
    expect(screen.getByPlaceholderText('JoinGame.playerNamePlaceholder')).toHaveValue('Alice');
  });

  it('should be able to join a session', async () => {
    const mockStore = (globalThis as any).mockStoreState;
    mockStore.addPlayer.mockResolvedValue('mockPlayerId');

    render(<JoinGame open={true} onClose={() => { }} />);
    const sessionID = screen.getByPlaceholderText('JoinGame.sessionIdPlaceholder');
    await userEvent.clear(sessionID);
    await userEvent.type(sessionID, 'gameId');

    const userName = screen.getByPlaceholderText('JoinGame.playerNamePlaceholder');
    await userEvent.type(userName, 'Rock');

    const joinButton = screen.getByRole('button', { name: /JoinGame.joinGameButton/i });

    await userEvent.click(joinButton);

    expect(mockStore.addPlayer).toHaveBeenCalled();
    expect(mockStore.addPlayer).toHaveBeenCalledWith('gameId', 'Rock');
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game/gameId'));
    expect(localStorage.getItem('recentPlayerName')).toBe('Rock');
  });

  it('should automatically join the game when player has already joined', async () => {
    const gameId = 'abc';
    mockParams = { id: gameId };
    mockGetById.mockResolvedValue({
      id: gameId,
      players: [{ id: 'currentPlayerId', name: 'Alice' }],
    });
    vi.spyOn(playersService, 'getCurrentPlayerId').mockReturnValue('currentPlayerId');

    render(<JoinGame open={true} onClose={() => { }} />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game/abc'));
  });

  it('should not automatically join the game when player it not in the game', async () => {
    const gameId = 'abc';
    mockParams = { id: gameId };
    mockGetById.mockResolvedValue({
      id: gameId,
      players: [{ id: 'otherPlayerId', name: 'Bob' }],
    });
    vi.spyOn(playersService, 'getCurrentPlayerId').mockReturnValue('currentPlayerId');

    render(<JoinGame open={true} onClose={() => { }} />);

    expect(screen.getByPlaceholderText('JoinGame.playerNamePlaceholder')).toBeInTheDocument();
  });
});
