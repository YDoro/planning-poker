import { render, screen, fireEvent } from '@testing-library/react';
import { StoryCard } from './StoryCard';
import { vi } from 'vitest';
import { Game, GameType } from '../../../types/game';
import { Status } from '../../../types/status';
import { Story } from './types/story';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('StoryCard', () => {
    const mockStory: Story = {
        title: 'Initial Story',
        description: 'Description',
    };

    const mockGame: Game = {
        id: 'game-1',
        name: 'Test Game',
        cards: [
            { value: 1, displayValue: '1', color: 'blue' },
            { value: 2, displayValue: '2', color: 'green' },
            { value: 3, displayValue: '3', color: 'red' },
        ],
        gameStatus: Status.Started,
        createdBy: 'user-1',
        createdById: 'user-1',
        createdAt: new Date(),
        average: 0,
    };

    const mockPlayers = [
        { id: 'user-1', name: 'User 1', value: 1, status: Status.Finished },
        { id: 'user-2', name: 'User 2', value: 3, status: Status.Finished },
    ];

    const defaultProps = {
        story: mockStory,
        isModerator: false,
        game: mockGame,
        players: [],
        onStoryNameChange: vi.fn(),
    };

    it('renders story title', () => {
        render(<StoryCard {...defaultProps} />);
        expect(screen.getByText('Initial Story')).toBeInTheDocument();
    });

    it('enters edit mode when pencil icon is clicked (moderator)', () => {
        render(<StoryCard {...defaultProps} isModerator={true} />);
        
        const editButton = screen.getByTitle('common.edit');
        fireEvent.click(editButton);

        expect(screen.getByTestId('story-name-input')).toBeInTheDocument();
    });

    it('calls onStoryNameChange when input value changes', () => {
        const onStoryNameChange = vi.fn();
        render(<StoryCard {...defaultProps} isModerator={true} onStoryNameChange={onStoryNameChange} />);
        
        fireEvent.click(screen.getByTitle('common.edit'));
        const input = screen.getByTestId('story-name-input');
        
        fireEvent.change(input, { target: { value: 'New Story' } });
        expect(onStoryNameChange).toHaveBeenCalledWith('New Story');
    });

    it('exits edit mode when check icon is clicked', () => {
        render(<StoryCard {...defaultProps} isModerator={true} />);
        
        fireEvent.click(screen.getByTitle('common.edit'));
        const confirmButton = screen.getByTitle('common.confirm');
        fireEvent.click(confirmButton);

        expect(screen.queryByTestId('story-name-input')).not.toBeInTheDocument();
    });

    it('enters edit mode automatically if title is empty (moderator)', () => {
        render(<StoryCard {...defaultProps} story={{ ...mockStory, title: '' }} isModerator={true} />);
        expect(screen.getByTestId('story-name-input')).toBeInTheDocument();
    });

    it('displays statistics when game is finished', () => {
        const finishedGame = { ...mockGame, gameStatus: Status.Finished };
        render(<StoryCard {...defaultProps} game={finishedGame} players={mockPlayers} />);

        expect(screen.getByText('GameController.average')).toBeInTheDocument();
        expect(screen.getByText('Moda')).toBeInTheDocument();
        expect(screen.getByText('Próximo')).toBeInTheDocument();

        // Average (1 + 3) / 2 = 2.0
        expect(screen.getByText('2.0')).toBeInTheDocument();
        // Mode is 1 and 3
        expect(screen.getByText('1, 3')).toBeInTheDocument();
        // Closest to 2 is 2 (from mockGame.cards)
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('picks higher value on closest tie', () => {
        // Average 2.5, values 2 and 3 are equally close. Should pick 3.
        const tiePlayers = [
            { id: 'u1', name: 'U1', value: 2, status: Status.Finished },
            { id: 'u2', name: 'U2', value: 3, status: Status.Finished },
        ];
        const finishedGame = { ...mockGame, gameStatus: Status.Finished };
        render(<StoryCard {...defaultProps} game={finishedGame} players={tiePlayers} />);

        expect(screen.getByText('2.5')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument(); // Closest picks 3 over 2
    });
});
