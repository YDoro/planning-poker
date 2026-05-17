import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from './GameBoard';
import { vi } from 'vitest';
import { Game } from '../../../types/game';
import { Status } from '../../../types/status';
import * as gamesService from '../../../service/games';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../../../service/games', () => ({
    editTask: vi.fn(),
    updateStoryName: vi.fn(),
}));

describe('GameBoard', () => {
    const mockGame: Game = {
        id: 'game-1',
        name: 'Test Game',
        cards: [],
        gameStatus: Status.Started,
        createdBy: 'user-1',
        createdById: 'user-1',
        createdAt: new Date(),
        average: 0,
        tasks: [
            { id: 't1', title: 'Task 1', description: '', status: 'voting' }
        ],
        currentTaskId: 't1'
    };

    const defaultProps = {
        game: mockGame,
        players: [],
        isModerator: true,
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders current task correctly', () => {
        render(<GameBoard {...defaultProps} />);
        expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    it('calls editTask when current task name is changed', () => {
        render(<GameBoard {...defaultProps} />);
        
        const editButton = screen.getByTitle('common.edit');
        fireEvent.click(editButton);

        const input = screen.getByTestId('story-name-input');
        fireEvent.change(input, { target: { value: 'Updated Task 1' } });
        
        expect(gamesService.editTask).toHaveBeenCalledWith('game-1', 't1', { title: 'Updated Task 1' });
    });

    it('calls updateStoryName if there is no current task', () => {
        const gameNoTasks = { ...mockGame, tasks: [], currentTaskId: undefined };
        render(<GameBoard {...defaultProps} game={gameNoTasks} />);
        
        const editButton = screen.getByTitle('common.edit');
        fireEvent.click(editButton);

        const input = screen.getByTestId('story-name-input');
        fireEvent.change(input, { target: { value: 'New Global Story' } });
        
        expect(gamesService.updateStoryName).toHaveBeenCalledWith('game-1', 'New Global Story');
    });
});
