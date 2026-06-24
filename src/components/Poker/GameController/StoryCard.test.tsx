import { render, screen, fireEvent } from '@testing-library/react';
import { StoryCard } from './StoryCard';
import { vi } from 'vitest';
import { Game } from '../../../core/domain/entities/Game';
import { Player, PlayerStatus } from '../../../core/domain/entities/Player';
import { Task } from '../../../core/domain/entities/Task';
import { Story } from './types/story';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('StoryCard', () => {
    beforeEach(() => {
        const mockStore = (globalThis as any).mockStoreState;
        if (mockStore) {
            mockStore.editTask.mockClear();
            mockStore.game = createMockGame();
            mockStore.players = [];
        }
    });

    const mockStory: Story = {
        cod: 'task-1',
        title: 'Initial Story',
        description: 'Description',
    };

    const createMockGame = () => {
        const game = new Game('game-1', 'Test Game', false);
        game.createdById = 'user-1';
        game.cards = [
            { value: 1, displayValue: '1', color: 'blue' },
            { value: 2, displayValue: '2', color: 'green' },
            { value: 3, displayValue: '3', color: 'red' },
        ];
        return game;
    };

    const createMockPlayers = () => {
        const p1 = new Player('user-1', 'User 1');
        p1.status = PlayerStatus.Finished;
        p1.value = 1;
        const p2 = new Player('user-2', 'User 2');
        p2.status = PlayerStatus.Finished;
        p2.value = 3;
        return [p1, p2];
    };

    const defaultProps = {
        story: mockStory,
        isModerator: false,
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
        const finishedGame = createMockGame();
        const task = new Task('task-1', 'Initial Story', 'Description', 'voted');
        task.revealed = true;
        finishedGame.tasks = [task];
        finishedGame.currentTaskId = 'task-1';

        const mockStore = (globalThis as any).mockStoreState;
        if (mockStore) {
            mockStore.game = finishedGame;
            mockStore.players = createMockPlayers();
        }

        render(<StoryCard {...defaultProps} />);

        expect(screen.getByText('GameController.average')).toBeInTheDocument();
        expect(screen.getByText('GameController.storyStats.mode')).toBeInTheDocument();
        expect(screen.getByText('GameController.storyStats.closest')).toBeInTheDocument();

        // Average (1 + 3) / 2 = 2.0
        expect(screen.getByText('2.0')).toBeInTheDocument();
        // Mode is 1 and 3
        expect(screen.getByText('1, 3')).toBeInTheDocument();
        // Closest to 2 is 2 (from mockGame.cards)
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('picks higher value on closest tie', () => {
        // Average 2.5, values 2 and 3 are equally close. Should pick 3.
        const finishedGame = createMockGame();
        const task = new Task('task-1', 'Initial Story', 'Description', 'voted');
        task.revealed = true;
        finishedGame.tasks = [task];
        finishedGame.currentTaskId = 'task-1';

        const p1 = new Player('u1', 'U1');
        p1.status = PlayerStatus.Finished;
        p1.value = 2;
        const p2 = new Player('u2', 'U2');
        p2.status = PlayerStatus.Finished;
        p2.value = 3;

        const mockStore = (globalThis as any).mockStoreState;
        if (mockStore) {
            mockStore.game = finishedGame;
            mockStore.players = [p1, p2];
        }

        render(<StoryCard {...defaultProps} />);

        expect(screen.getByText('2.5')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument(); // Closest picks 3 over 2
    });

    it('allows moderator to set final score when game is finished', () => {
        const finishedGame = createMockGame();
        const task = new Task('task-1', 'Initial Story', 'Description', 'voted');
        task.revealed = true;
        finishedGame.tasks = [task];
        finishedGame.currentTaskId = 'task-1';

        const mockStore = (globalThis as any).mockStoreState;
        if (mockStore) {
            mockStore.game = finishedGame;
            mockStore.players = createMockPlayers();
        }

        render(<StoryCard {...defaultProps} isModerator={true} story={{...mockStory, cod: 'task-1'}} />);

        const input = screen.getByLabelText('GameController.finalScore:');
        expect(input).toBeInTheDocument();
        
        fireEvent.change(input, { target: { value: '3' } });
        fireEvent.blur(input);

        expect(mockStore.editTask).toHaveBeenCalledWith('game-1', 'task-1', { score: '3' });
    });
});
