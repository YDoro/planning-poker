import * as fb from '../repository/firebase';
import { GameType } from '../types/game';
import { Status } from '../types/status';
import {
  addNewGame,
  finishGame,
  getGame,
  getGameStatus,
  resetGame,
  streamGame,
  streamPlayers,
  updateGame,
  updateGameStatus,
  updateStoryName,
} from './games';
import * as players from './players';
import { vi } from 'vitest';

vi.mock('../repository/firebase', () => ({
  addGameToStore: vi.fn(),
  addPlayerToGameInStore: vi.fn(),
  streamData: vi.fn(),
  streamPlayersFromStore: vi.fn(),
  getGameFromStore: vi.fn(),
  updateGameDataInStore: vi.fn(),
  getPlayersFromStore: vi.fn(),
}));
vi.mock('./players', () => ({
  resetPlayers: vi.fn(),
  updatePlayerGames: vi.fn(),
}));
vi.mock('ulid', () => ({ ulid: () => '321cba' }));

describe('games service', () => {
  const mockUlid = '321cba';
  const mockId = 'fancy pants';
  const mockGame = {
    id: 'fee-fii-foo-fum',
    name: 'Cadburys',
    average: 2,
    gameStatus: Status.NotStarted,
    gameType: GameType.Fibonacci,
    cards: [
      { value: 1, displayValue: '1', color: 'red' },
      { value: 2, displayValue: '2', color: 'blue' },
      { value: 3, displayValue: '3', color: 'green' },
    ],
    createdBy: 'Jack',
    createdById: 'beanstalk',
    createdAt: new Date(Date.now() - 60000),
    updatedAt: new Date(),
  };
  const mockPlayers = [
    { name: 'Jack', id: 'beanstalk', status: Status.Finished, value: 4, emoji: 'smirk' },
    { name: 'Jill', id: 'hill', status: Status.Started, value: 1, emoji: 'thumbsup' },
    { name: 'Humpty', id: 'dumpty', status: Status.InProgress, value: 500, emoji: 'egg' },
  ];
  // This is required because JS is weird with its copying VS referencing. Yes could have just copy-pasted the const, but what's the fun in that
  const finishedPlayers = [{ ...mockPlayers[0] }, { ...mockPlayers[1] }, { ...mockPlayers[2] }];
  finishedPlayers[0].status = Status.Finished;
  finishedPlayers[1].status = Status.Finished;
  finishedPlayers[2].status = Status.Finished;

  it('should store the new game info in the DB', async () => {
    const fakeGame = {
      name: 'cherries',
      gameType: 'uno',
      createdBy: 'Santa',
      cards: [
        { value: 1, displayValue: '1', color: 'red' },
        { value: 2, displayValue: '2', color: 'blue' },
        { value: 3, displayValue: '3', color: 'green' },
      ],
      createdAt: new Date(),
    };
    const resPlayer = {
      name: fakeGame.createdBy,
      id: mockUlid,
      status: Status.NotStarted,
    };
    const resGame = {
      ...fakeGame,
      id: mockUlid,
      average: 0,
      createdById: mockUlid,
      gameStatus: Status.Started,
    };
    const gameSpy = vi.spyOn(fb, 'addGameToStore');
    const playerSpy = vi.spyOn(fb, 'addPlayerToGameInStore');
    const updateSpy = vi.spyOn(players, 'updatePlayerGames');

    const id = await addNewGame(fakeGame);

    expect(id).toEqual(mockUlid);
    expect(gameSpy).toHaveBeenCalledWith(mockUlid, resGame);
    expect(playerSpy).toHaveBeenCalledWith(mockUlid, resPlayer);
    expect(updateSpy).toHaveBeenCalledWith(
      mockUlid,
      fakeGame.name,
      fakeGame.createdBy,
      mockUlid,
      mockUlid,
    ); // Game ID and player ID
  });

  it("should request the given game's stream", () => {
    const spy = vi.spyOn(fb, 'streamData');

    streamGame(mockId);

    expect(spy).toHaveBeenCalledWith(mockId);
  });

  it("should request the given player's stream", () => {
    const spy = vi.spyOn(fb, 'streamPlayersFromStore');

    streamPlayers(mockId);

    expect(spy).toHaveBeenCalledWith(mockId);
  });

  it('should get the game from the DB', () => {
    const spy = vi.spyOn(fb, 'getGameFromStore');

    getGame(mockId);

    expect(spy).toHaveBeenCalledWith(mockId);
  });

  it('should update the game in the DB', () => {
    const spy = vi.spyOn(fb, 'updateGameDataInStore');

    updateGame(mockId, 'banana');

    expect(spy).toHaveBeenCalledWith(mockId, 'banana');
  });

  describe('reset the game', () => {
    it('should update the game and reset the players', async () => {
      const expectGame = { average: 0, gameStatus: Status.Started, storyName: '' };
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(mockGame);
      const updateSpy = vi.spyOn(fb, 'updateGameDataInStore');
      const playerSpy = vi.spyOn(players, 'resetPlayers');

      await resetGame(mockId);

      expect(updateSpy).toHaveBeenCalledWith(mockId, expectGame);
      expect(playerSpy).toHaveBeenCalledWith(mockId);
    });

    it("should not touch the DB if the game doesn't exist", async () => {
      vi.resetAllMocks();
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(undefined);
      const updateSpy = vi.spyOn(fb, 'updateGameDataInStore');
      const playerSpy = vi.spyOn(players, 'resetPlayers');

      await resetGame(mockId);

      expect(updateSpy).toHaveBeenCalledTimes(0);
      expect(playerSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('finish the game', () => {
    it('update the game with the average and finished status', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(mockGame);
      vi.spyOn(fb, 'getPlayersFromStore').mockResolvedValueOnce(mockPlayers);
      const spy = vi.spyOn(fb, 'updateGameDataInStore');

      await finishGame(mockId);

      expect(spy).toHaveBeenCalledWith(
        mockId,
        expect.objectContaining({ gameStatus: Status.Finished }),
      );
    });

    it("should not touch the DB if the game doesn't exist", async () => {
      vi.resetAllMocks();
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(undefined);
      vi.spyOn(fb, 'getPlayersFromStore').mockResolvedValueOnce(mockPlayers);
      const spy = vi.spyOn(fb, 'updateGameDataInStore');

      await finishGame(mockId);

      expect(spy).toHaveBeenCalledTimes(0);
    });
  });

  describe('get the game status', () => {
    it("should have in progress status when there's some players who have finished", () => {
      const res = getGameStatus(mockPlayers);

      expect(res).toEqual(Status.InProgress);
    });

    it("should be started when there's no players that have finished", () => {
      const fakePlayers = [mockPlayers[1], mockPlayers[2]];

      const res = getGameStatus(fakePlayers);

      expect(res).toEqual(Status.Started);
    });
  });

  describe('update the game status', () => {
    it("should not touch the DB if the game doesn't exist", async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(undefined);

      const res = await updateGameStatus(mockId);

      expect(res).toBe(false);
    });

    it('should return false if there are no players in the game in the DB', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(mockGame);
      // @ts-ignore
      vi.spyOn(fb, 'getPlayersFromStore').mockResolvedValueOnce(undefined);

      const res = await updateGameStatus(mockId);

      expect(res).toBe(false);
    });

    it('should update the game with the new status', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(mockGame);
      vi.spyOn(fb, 'getPlayersFromStore').mockResolvedValueOnce(mockPlayers);
      const spy = vi.spyOn(fb, 'updateGameDataInStore').mockResolvedValueOnce(true);

      const res = await updateGameStatus(mockId);

      expect(spy).toHaveBeenCalledWith(mockId, { gameStatus: Status.InProgress });
      expect(res).toBe(true);
    });
  });
  describe('update the game story name', () => {
    it('should update the game with the new story name', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(mockGame);
      vi.spyOn(fb, 'getPlayersFromStore').mockResolvedValueOnce(mockPlayers);
      const spy = vi.spyOn(fb, 'updateGameDataInStore').mockResolvedValueOnce(true);

      await updateStoryName(mockId, 'User story 1');

      expect(spy).toHaveBeenCalledWith(mockId, { ...mockGame, storyName: 'User story 1' });
    });
  });

  describe('tasks logic', () => {
    it('should add a task and set it as current if first', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce(mockGame);
      const spy = vi.spyOn(fb, 'updateGameDataInStore').mockResolvedValueOnce(true);
      const { addTask } = await import('./games');

      await addTask(mockId, { title: 'New Task', description: '', status: 'pending' });
      expect(spy).toHaveBeenCalledWith(mockId, expect.objectContaining({
         tasks: [{ id: mockUlid, title: 'New Task', description: '', status: 'voting' }],
         currentTaskId: mockUlid
      }));
    });

    it('should edit a task', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce({ ...mockGame, tasks: [{ id: 'task1', title: 'Old', description: '', status: 'pending' }] });
      const spy = vi.spyOn(fb, 'updateGameDataInStore').mockResolvedValueOnce(true);
      const { editTask } = await import('./games');

      await editTask(mockId, 'task1', { title: 'New' });
      expect(spy).toHaveBeenCalledWith(mockId, expect.objectContaining({
         tasks: [{ id: 'task1', title: 'New', description: '', status: 'pending' }]
      }));
    });

    it('should delete a task', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce({ ...mockGame, tasks: [{ id: 'task1', title: 'Task 1', description: '', status: 'pending' }] });
      const spy = vi.spyOn(fb, 'updateGameDataInStore').mockResolvedValueOnce(true);
      const { deleteTask } = await import('./games');

      await deleteTask(mockId, 'task1');
      expect(spy).toHaveBeenCalledWith(mockId, expect.objectContaining({
         tasks: []
      }));
    });
    
    it('should change current task', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce({ ...mockGame, tasks: [{ id: 'task1', title: 'Task 1', description: '', status: 'pending' }] });
      const spy = vi.spyOn(fb, 'updateGameDataInStore').mockResolvedValueOnce(true);
      const { changeCurrentTask } = await import('./games');

      await changeCurrentTask(mockId, 'task1');
      expect(spy).toHaveBeenCalledWith(mockId, expect.objectContaining({
         currentTaskId: 'task1',
         tasks: [{ id: 'task1', title: 'Task 1', description: '', status: 'voting' }],
         gameStatus: Status.Started
      }));
    });

    it('should go to next task', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce({ 
         ...mockGame, 
         currentTaskId: 'task1',
         tasks: [
            { id: 'task1', title: 'Task 1', description: '', status: 'voting' },
            { id: 'task2', title: 'Task 2', description: '', status: 'pending' }
         ] 
      });
      const spy = vi.spyOn(fb, 'updateGameDataInStore').mockResolvedValueOnce(true);
      const { nextTask } = await import('./games');

      await nextTask(mockId, '5');
      expect(spy).toHaveBeenCalledWith(mockId, expect.objectContaining({
         currentTaskId: 'task2',
         tasks: [
            { id: 'task1', title: 'Task 1', description: '', status: 'voted', score: '5' },
            { id: 'task2', title: 'Task 2', description: '', status: 'voting' }
         ],
         gameStatus: Status.Started
      }));
    });

    it('should skip task', async () => {
      vi.spyOn(fb, 'getGameFromStore').mockResolvedValueOnce({ 
         ...mockGame, 
         currentTaskId: 'task1',
         tasks: [
            { id: 'task1', title: 'Task 1', description: '', status: 'voting' },
            { id: 'task2', title: 'Task 2', description: '', status: 'pending' }
         ] 
      });
      const spy = vi.spyOn(fb, 'updateGameDataInStore').mockResolvedValueOnce(true);
      const { nextTask } = await import('./games');

      await nextTask(mockId, undefined, true);
      expect(spy).toHaveBeenCalledWith(mockId, expect.objectContaining({
         currentTaskId: 'task2',
         tasks: [
            { id: 'task1', title: 'Task 1', description: '', status: 'skipped' },
            { id: 'task2', title: 'Task 2', description: '', status: 'voting' }
         ],
         gameStatus: Status.Started
      }));
    });
  });
});
