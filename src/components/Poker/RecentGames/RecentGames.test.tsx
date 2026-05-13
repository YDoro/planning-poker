import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as playersService from '../../../service/players';
import * as gamesService from '../../../service/games';
import { PlayerGame } from '../../../types/player';
import { RecentGames } from './RecentGames';
import { vi } from 'vitest';
import { isModerator } from '../../../utils/isModerator';

vi.mock('../../../service/players');
vi.mock('../../../service/games');
vi.mock('../../../utils/isModerator');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('RecentGames component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  it('should display no recent session when no games found in user local storage', async () => {
    vi.spyOn(playersService, 'getPlayerRecentGames').mockResolvedValue([]);
    render(<RecentGames />);
    expect(await screen.findByText('toolbar.history.noGames')).toBeInTheDocument();
  });

  it('should display recent games when games found in local storage', async () => {
    const mockGames: PlayerGame[] = [
      {
        id: 'abv',
        name: 'avengers',
        createdById: 'IronManId',
        createdBy: 'IronMan',
        playerId: 'abv',
      },
      {
        id: 'xyz',
        name: 'endgame',
        createdById: 'SpiderManId',
        createdBy: 'SpiderMan',
        playerId: 'abc',
      },
    ];
    vi.spyOn(playersService, 'getPlayerRecentGames').mockResolvedValue(mockGames);

    render(<RecentGames />);

    await screen.findByText(mockGames[0].name);

    expect(screen.getByText(mockGames[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockGames[1].name)).toBeInTheDocument();
  });

  it('should navigate to the game when clicking on game', async () => {
    const mockGames: PlayerGame[] = [
      {
        id: 'abc',
        name: 'avengers',
        createdById: 'IronManId',
        createdBy: 'IronMan',
        playerId: 'abc',
      },
    ];
    vi.spyOn(playersService, 'getPlayerRecentGames').mockResolvedValue(mockGames);

    render(<RecentGames />);

    await screen.findByText(mockGames[0].name);
    await userEvent.click(screen.getByText(mockGames[0].name));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/game/abc'));
  });

  it('should remove a game when clicking delete and confirming', async () => {
    const mockGames: PlayerGame[] = [
      {
        id: 'abc',
        name: 'avengers',
        createdById: 'IronManId',
        createdBy: 'IronMan',
        playerId: 'abc',
      },
    ];
    vi.spyOn(playersService, 'getPlayerRecentGames').mockResolvedValue(mockGames);
    (isModerator as any).mockReturnValue(true);
    const removeGameSpy = vi.spyOn(gamesService, 'removeGame').mockResolvedValue(undefined);

    render(<RecentGames />);

    await screen.findByText(mockGames[0].name);
    
    const deleteButton = screen.getByLabelText('Delete session');
    await userEvent.click(deleteButton);

    // Dialog should be open
    expect(screen.getByText('toolbar.history.deletionDialog.title')).toBeInTheDocument();
    
    const confirmButton = screen.getByText('toolbar.history.deletionDialog.continueButton');
    await userEvent.click(confirmButton);

    expect(removeGameSpy).toHaveBeenCalledWith('abc');
  });
});
