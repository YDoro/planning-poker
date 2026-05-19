import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from './GameBoard';
import { vi } from 'vitest';
import { Game } from '../../../core/domain/entities/Game';
import { Task } from '../../../core/domain/entities/Task';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('react-dnd', () => ({
    useDrag: () => [{}, vi.fn(), vi.fn()],
    useDrop: () => [{}, vi.fn()],
}));

describe('GameBoard', () => {
    beforeEach(() => {
        const mockStore = (globalThis as any).mockStoreState;
        if (mockStore) {
            mockStore.editTask.mockClear();
            mockStore.updateStoryName.mockClear();
            mockStore.addTask.mockClear();
        }
    });

    const createMockGame = () => {
        const game = new Game('game-1', 'Test Game', false);
        game.createdById = 'user-1';
        const task = new Task('t1', 'Task 1', '', 'voting');
        game.tasks = [task];
        game.currentTaskId = 't1';
        return game;
    };

    const defaultProps = {
        game: createMockGame(),
        players: [],
        isModerator: true,
    };

    it('renders current task correctly', () => {
        render(<GameBoard {...defaultProps} />);
        expect(screen.getAllByText('Task 1').length).toBeGreaterThan(0);
    });

    it('calls editTask when current task name is changed', () => {
        render(<GameBoard {...defaultProps} />);
        
        const editButton = screen.getByTitle('common.edit');
        fireEvent.click(editButton);

        const input = screen.getByTestId('story-name-input');
        fireEvent.change(input, { target: { value: 'Updated Task 1' } });
        
        const mockStore = (globalThis as any).mockStoreState;
        expect(mockStore.editTask).toHaveBeenCalledWith('game-1', 't1', { title: 'Updated Task 1' });
    });

    it('calls updateStoryName if there is no current task', () => {
        const gameNoTasks = createMockGame();
        gameNoTasks.tasks = [];
        gameNoTasks.currentTaskId = undefined;
        gameNoTasks.storyName = 'Initial Story';

        render(<GameBoard {...defaultProps} game={gameNoTasks} />);
        
        const editButton = screen.getByTitle('common.edit');
        fireEvent.click(editButton);

        const input = screen.getByTestId('story-name-input');
        fireEvent.change(input, { target: { value: 'New Global Story' } });
        
        const mockStore = (globalThis as any).mockStoreState;
        expect(mockStore.updateStoryName).toHaveBeenCalledWith('game-1', 'New Global Story');
    });
});
