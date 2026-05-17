import { ulid } from 'ulid';
import {
  addGameToStore,
  addPlayerToGameInStore,
  getGameFromStore,
  getPlayersFromStore,
  removeGameFromStore,
  removeOldGameFromStore,
  streamData,
  streamPlayersFromStore,
  updateGameDataInStore,
} from '../repository/firebase';
import { NewGame } from '../types/game';
import { Player } from '../types/player';
import { Task } from '../types/task';
import { Status } from '../types/status';
import { removeGameFromCache, resetPlayers, updatePlayerGames } from './players';

export const addNewGame = async (newGame: NewGame): Promise<string> => {
  const player = {
    name: newGame.createdBy,
    id: ulid(),
    status: Status.NotStarted,
  };
  const gameData = {
    ...newGame,
    id: ulid(),
    average: 0,
    createdById: player.id,
    gameStatus: Status.Started,
  };
  await addGameToStore(gameData.id, gameData);
  await addPlayerToGameInStore(gameData.id, player);
  updatePlayerGames(
    gameData.id,
    gameData.name,
    gameData.createdBy,
    gameData.createdById,
    player.id,
  );

  return gameData.id;
};

export const streamGame = (id: string) => {
  return streamData(id);
};

export const streamPlayers = (id: string) => {
  return streamPlayersFromStore(id);
};

export const getGame = (id: string) => {
  return getGameFromStore(id);
};

export const updateGame = async (gameId: string, updatedGame: any): Promise<boolean> => {
  await updateGameDataInStore(gameId, updatedGame);
  return true;
};

export const resetGame = async (gameId: string) => {
  const game = await getGameFromStore(gameId);
  if (game) {
    const updatedGame = {
      average: 0,
      gameStatus: Status.Started,
      storyName: '',
    };
    await updateGame(gameId, updatedGame);
    await resetPlayers(gameId);
  }
};

export const finishGame = async (gameId: string) => {
  const game = await getGameFromStore(gameId);
  const players = await getPlayersFromStore(gameId);

  if (game && players) {
    const updatedGame = {
      gameStatus: Status.Finished,
    };
    await updateGame(gameId, updatedGame);
  }
};

export const updateStoryName = async (gameId: string, storyName: string) => {
  const game = await getGameFromStore(gameId);
  const players = await getPlayersFromStore(gameId);

  if (game && players) {
    const updatedGame = {
      ...game,
      storyName: storyName,
    };
    updateGame(gameId, updatedGame);
  }
};

export const getGameStatus = (players: Player[]): Status => {
  let numberOfPlayersPlayed = 0;
  players.forEach((player: Player) => {
    if (player.status === Status.Finished) {
      numberOfPlayersPlayed++;
    }
  });
  if (numberOfPlayersPlayed === 0) {
    return Status.Started;
  }
  return Status.InProgress;
};

export const updateGameStatus = async (gameId: string): Promise<boolean> => {
  const game = await getGame(gameId);
  if (!game) {
    console.log('Game not found');
    return false;
  }
  const players = await getPlayersFromStore(gameId);
  if (players) {
    const status = getGameStatus(players);
    const dataToUpdate = {
      gameStatus: status,
    };
    const result = await updateGameDataInStore(gameId, dataToUpdate);
    return result;
  }
  return false;
};

export const removeGame = async (gameId: string) => {
  await removeGameFromStore(gameId);
  removeGameFromCache(gameId);
};

export const deleteOldGames = async () => {
  await removeOldGameFromStore();
};

export const addTask = async (gameId: string, task: Omit<Task, 'id'>) => {
  const game = await getGameFromStore(gameId);
  if (game) {
    const newTask: Task = { ...task, id: ulid() };
    const tasks = game.tasks || [];
    
    // If it's the first task, set it as current
    const isFirstTask = tasks.length === 0;
    const currentTaskId = isFirstTask ? newTask.id : game.currentTaskId;
    if (isFirstTask) newTask.status = 'voting';

    const updatedGame = { tasks: [...tasks, newTask], currentTaskId };
    await updateGame(gameId, updatedGame);
  }
};

export const editTask = async (gameId: string, taskId: string, updatedTask: Partial<Task>) => {
  const game = await getGameFromStore(gameId);
  if (game && game.tasks) {
    const tasks = game.tasks.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t));
    await updateGame(gameId, { tasks });
  }
};

export const deleteTask = async (gameId: string, taskId: string) => {
  const game = await getGameFromStore(gameId);
  if (game && game.tasks) {
    const tasks = game.tasks.filter((t) => t.id !== taskId);
    let currentTaskId = game.currentTaskId;
    if (currentTaskId === taskId) {
      currentTaskId = tasks.length > 0 ? tasks[0].id : undefined;
    }
    await updateGame(gameId, { tasks, currentTaskId });
  }
};

export const changeCurrentTask = async (gameId: string, taskId: string) => {
  const game = await getGameFromStore(gameId);
  if (game && game.tasks) {
    const tasks = game.tasks.map((t) => {
      if (t.id === taskId && t.status === 'pending') {
         return { ...t, status: 'voting' };
      }
      return t;
    });
    await updateGame(gameId, { currentTaskId: taskId, tasks, gameStatus: Status.Started });
    await resetPlayers(gameId);
  }
};

export const nextTask = async (gameId: string, score?: string, skipped?: boolean) => {
  const game = await getGameFromStore(gameId);
  if (game && game.tasks && game.currentTaskId) {
    const currentTaskIndex = game.tasks.findIndex(t => t.id === game.currentTaskId);
    if (currentTaskIndex !== -1) {
      const tasks = [...game.tasks];
      const newStatus = skipped ? 'skipped' : 'voted';
      const updatedTask = { ...tasks[currentTaskIndex], status: newStatus };
      if (score !== undefined) {
        updatedTask.score = score;
      }
      tasks[currentTaskIndex] = updatedTask;
      
      const nextPendingTask = tasks.find((t, idx) => idx > currentTaskIndex && (t.status === 'pending' || t.status === 'skipped'));
      let newCurrentTaskId = game.currentTaskId;
      
      if (nextPendingTask) {
        newCurrentTaskId = nextPendingTask.id;
        const nextIndex = tasks.findIndex(t => t.id === newCurrentTaskId);
        tasks[nextIndex] = { ...tasks[nextIndex], status: 'voting' };
      }

      await updateGame(gameId, { tasks, currentTaskId: newCurrentTaskId, gameStatus: Status.Started });
      await resetPlayers(gameId);
    }
  }
};
