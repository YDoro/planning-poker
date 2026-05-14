import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as gamesService from '../../../service/games';
import { Game, GameType } from '../../../types/game';
import { Player } from '../../../types/player';
import { Status } from '../../../types/status';
import { CardConfig } from '../../Players/CardPicker/CardConfigs';
import {
  areAllFinishedPlayersDisplayValuesNumeric,
  GameController,
} from './GameController';
import { vi } from 'vitest';
import { AutoReveal } from './AutoReveal';

vi.mock('../../../service/games');
const mockNavigate = vi.fn();
document.execCommand = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('GameController component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });
  const mockGame: Game = {
    id: 'xyz',
    name: 'testGame',
    cards: [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: '3', color: 'green' },
    ],
    createdBy: 'someone',
    createdAt: new Date(),
    average: 0,
    createdById: 'abc',
    gameStatus: Status.InProgress,
    storyName: 'testStory',
  };
  const mockCurrentPlayerId = 'abc';
  const mockPlayers: Player[] = [
    { id: 'abc', name: 'Player1', value: 2, emoji: '😀', status: Status.InProgress },
  ];

  it('should display game name', () => {
    render(
      <GameController
        game={mockGame}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    );
    expect(screen.getByText(mockGame.name)).toBeInTheDocument();
  });
  it('should display game status', () => {
    render(
      <GameController
        game={mockGame}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    );

    expect(screen.getByText(`${mockGame.gameStatus} ⏱️`)).toBeInTheDocument();
  });

  it('should display exit option', () => {
    render(
      <GameController
        game={mockGame}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    );

    expect(screen.getByTestId('exit-button')).toBeInTheDocument();
  });

  it('should display invite option', () => {
    render(
      <GameController
        game={mockGame}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    );

    expect(screen.getByTestId('invite-button')).toBeInTheDocument();
  });

  it('should copy invite link to clipboard', async () => {
    render(
      <GameController
        game={mockGame}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    );

    await userEvent.click(screen.getByTestId('invite-button'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/join/xyz'),
    );
  });

  it('should navigate to home page when exit button is clicked', async () => {
    render(
      <GameController
        game={mockGame}
        currentPlayerId={mockCurrentPlayerId}
        players={mockPlayers}
      />,
    );

    await userEvent.click(screen.getByTestId('exit-button'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });


  describe('When Player is Moderator', () => {
    it('should display reveal option', () => {
      render(
        <GameController
          game={mockGame}
          currentPlayerId={mockCurrentPlayerId}
          players={mockPlayers}
        />,
      );

      expect(screen.getByText('Reveal')).toBeInTheDocument();
    });
    it('should display restart option', () => {
      render(
        <GameController
          game={mockGame}
          currentPlayerId={mockCurrentPlayerId}
          players={mockPlayers}
        />,
      );

      expect(screen.getByText('Restart')).toBeInTheDocument();
    });
    it('should reveal cards when player click on Reveal button', async () => {
      render(
        <GameController
          game={mockGame}
          currentPlayerId={mockCurrentPlayerId}
          players={mockPlayers}
        />,
      );
      await userEvent.click(screen.getByTestId('reveal-button'));
      expect(gamesService.finishGame).toHaveBeenCalled();
    });
    it('should restart game when player click on Restart button', async () => {
      render(
        <GameController
          game={mockGame}
          currentPlayerId={mockCurrentPlayerId}
          players={mockPlayers}
        />,
      );
      await userEvent.click(screen.getByTestId('restart-button'));
      expect(gamesService.resetGame).toHaveBeenCalled();
    });
    it('should call finish game when auto reveal is true and all players has voted', () => {
      const mockPlayersWithVotes: Player[] = [
        { id: 'abc', name: 'Player1', value: 2, emoji: '😀', status: Status.Finished },
        { id: 'def', name: 'Player2', value: 3, emoji: '😃', status: Status.Finished },
      ];
      const mockGameWihAutoReveal: Game = {
        ...mockGame,
        autoReveal: true,
      };
      render(
        <GameController
          game={mockGameWihAutoReveal}
          currentPlayerId={mockCurrentPlayerId}
          players={mockPlayersWithVotes}
        />,
      );
      expect(gamesService.finishGame).toHaveBeenCalled();
    });
  });

  describe('AutoReveal', () => {
    it('renders the auto reveal switch', () => {
      const { getByRole, getByText } = render(
        <AutoReveal autoReveal={true} onAutoReveal={() => { }} />,
      );
      expect(getByText(/auto reveal/i)).toBeInTheDocument();
      expect(getByRole('switch')).toBeInTheDocument();
    });

    it('shows OFF when switch is off and ON when switch is on', () => {
      const { getByRole } = render(<AutoReveal autoReveal={false} onAutoReveal={() => { }} />);
      const switchBtn = getByRole('switch');
      // Initially OFF
      expect(switchBtn).toHaveAttribute('aria-checked', 'false');
    });

    it('shows ON when switch is on', () => {
      const { getByRole } = render(<AutoReveal autoReveal={true} onAutoReveal={() => { }} />);
      const switchBtn = getByRole('switch');
      expect(switchBtn).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onAutoReveal with correct value when toggled', () => {
      const onAutoReveal = vi.fn();
      const { getByRole } = render(<AutoReveal autoReveal={false} onAutoReveal={onAutoReveal} />);
      const switchBtn = getByRole('switch');
      // Toggle ON
      fireEvent.click(switchBtn);
      expect(onAutoReveal).toHaveBeenCalledWith(true);
    });
  });
});
