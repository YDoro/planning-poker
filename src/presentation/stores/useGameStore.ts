import { create } from 'zustand';
import { Game } from '../../core/domain/entities/Game';
import { Player } from '../../core/domain/entities/Player';
import { Task } from '../../core/domain/entities/Task';
import { FirebaseGameRepository } from '../../infrastructure/firebase/FirebaseGameRepository';

// Use case instances
import { CreateGame } from '../../core/use-cases/CreateGame';
import { AddPlayer } from '../../core/use-cases/AddPlayer';
import { RemovePlayer } from '../../core/use-cases/RemovePlayer';
import { VoteOnTask } from '../../core/use-cases/VoteOnTask';
import { RevealCards } from '../../core/use-cases/RevealCards';
import { NextTask } from '../../core/use-cases/NextTask';
import { FinishGame } from '../../core/use-cases/FinishGame';
import { ChangeCurrentTask } from '../../core/use-cases/ChangeCurrentTask';
import { AddTask } from '../../core/use-cases/AddTask';
import { EditTask } from '../../core/use-cases/EditTask';
import { DeleteTask } from '../../core/use-cases/DeleteTask';
import { ReorderTasks } from '../../core/use-cases/ReorderTasks';
import { UpdateStoryName } from '../../core/use-cases/UpdateStoryName';
import { updatePlayerGames, removeGameFromCache } from '../../infrastructure/cache/localStorage';
import { SetDontVote } from '@/src/core/use-cases/SetDontVote';

const gameRepository = new FirebaseGameRepository();
const createGameUC = new CreateGame(gameRepository);
const addPlayerUC = new AddPlayer(gameRepository);
const removePlayerUC = new RemovePlayer(gameRepository);
const voteOnTaskUC = new VoteOnTask(gameRepository);
const revealCardsUC = new RevealCards(gameRepository);
const nextTaskUC = new NextTask(gameRepository);
const finishGameUC = new FinishGame(gameRepository);
const changeCurrentTaskUC = new ChangeCurrentTask(gameRepository);
const addTaskUC = new AddTask(gameRepository);
const editTaskUC = new EditTask(gameRepository);
const deleteTaskUC = new DeleteTask(gameRepository);
const reorderTasksUC = new ReorderTasks(gameRepository);
const updateStoryNameUC = new UpdateStoryName(gameRepository);
const setDontVoteUC = new SetDontVote(gameRepository);

interface GameState {
  game: Game | null;
  players: Player[];
  isLoading: boolean;

  // Getters
  getCurrentTask: () => Task | undefined;
  getCurrentPlayer: (playerId: string) => Player | undefined;

  // Real-time connections
  connectToGame: (gameId: string) => () => void;

  // Actions corresponding to use cases
  createGame: (input: {
    name: string;
    createdBy: string;
    gameType: any;
    cards: any[];
    isAllowMembersToManageSession?: boolean;
  }) => Promise<{ gameId: string; creatorId: string }>;
  addPlayer: (gameId: string, playerName: string) => Promise<string>;
  removePlayer: (gameId: string, playerId: string) => Promise<void>;
  voteOnTask: (gameId: string, playerId: string, value: number, emoji: string) => Promise<void>;
  revealCards: (gameId: string) => Promise<void>;
  nextTask: (gameId: string, score?: string, skipped?: boolean) => Promise<void>;
  finishGame: (gameId: string) => Promise<void>;
  changeCurrentTask: (gameId: string, taskId: string) => Promise<void>;
  addTask: (gameId: string, taskInput: { title: string; description: string; taskCode?: string }) => Promise<void>;
  editTask: (gameId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (gameId: string, taskId: string) => Promise<void>;
  reorderTasks: (gameId: string, orderedTasks: Task[]) => Promise<void>;
  updateStoryName: (gameId: string, storyName: string) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  updateGame: (gameId: string, updates: Partial<Game>) => Promise<void>;
  setDontVote: (gameId: string, playerId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  game: null,
  players: [],
  isLoading: true,

  getCurrentTask: () => {
    const { game } = get();
    if (!game) return undefined;
    return game.tasks?.find((t) => t.id === game.currentTaskId);
  },

  connectToGame: (gameId: string) => {
    set({ isLoading: true });

    // Stream game data in real-time
    const unsubscribeGame = gameRepository.streamGame(gameId, (gameData) => {
      set((state) => ({
        game: gameData ? new Game(
          gameData.id,
          gameData.name,
          gameData.isFinished,
          gameData.currentTaskId,
          gameData.tasks,
          state.players, // Keep players from the players stream
          gameData.cards,
          gameData.createdBy,
          gameData.createdById,
          gameData.createdAt,
          gameData.average,
          gameData.gameType,
          gameData.isAllowMembersToManageSession,
          gameData.storyName,
          gameData.updatedAt,
          gameData.timerProps,
          gameData.autoReveal
        ) : null,
        isLoading: false,
      }));
    });

    // Stream players list in real-time
    const unsubscribePlayers = gameRepository.streamPlayers(gameId, (playersList) => {
      set((state) => {
        const updatedGame = state.game ? new Game(
          state.game.id,
          state.game.name,
          state.game.isFinished,
          state.game.currentTaskId,
          state.game.tasks,
          playersList,
          state.game.cards,
          state.game.createdBy,
          state.game.createdById,
          state.game.createdAt,
          state.game.average,
          state.game.gameType,
          state.game.isAllowMembersToManageSession,
          state.game.storyName,
          state.game.updatedAt,
          state.game.timerProps,
          state.game.autoReveal
        ) : null;

        return {
          players: playersList,
          game: updatedGame,
        };
      });
    });

    // Return disconnect cleanup function
    return () => {
      unsubscribeGame();
      unsubscribePlayers();
      set({ game: null, players: [], isLoading: true });
    };
  },

  createGame: async (input) => {
    const result = await createGameUC.execute(input);
    updatePlayerGames(
      result.gameId,
      input.name,
      input.createdBy,
      result.creatorId,
      result.creatorId
    );
    return result;
  },

  addPlayer: async (gameId, playerName) => {
    const playerId = await addPlayerUC.execute(gameId, playerName);
    const game = await gameRepository.getById(gameId);
    if (game) {
      updatePlayerGames(
        game.id,
        game.name,
        game.createdBy,
        game.createdById,
        playerId
      );
    }
    return playerId;
  },

  removePlayer: async (gameId, playerId) => {
    await removePlayerUC.execute(gameId, playerId);
  },

  voteOnTask: async (gameId, playerId, value, emoji) => {
    await voteOnTaskUC.execute(gameId, playerId, value, emoji);
  },

  revealCards: async (gameId) => {
    await revealCardsUC.execute(gameId);
  },

  nextTask: async (gameId, score, skipped) => {
    await nextTaskUC.execute(gameId, score, skipped);
  },

  finishGame: async (gameId) => {
    await finishGameUC.execute(gameId);
  },

  changeCurrentTask: async (gameId, taskId) => {
    await changeCurrentTaskUC.execute(gameId, taskId);
  },

  addTask: async (gameId, taskInput) => {
    await addTaskUC.execute(gameId, taskInput);
  },

  editTask: async (gameId, taskId, updates) => {
    await editTaskUC.execute(gameId, taskId, updates);
  },

  deleteTask: async (gameId, taskId) => {
    await deleteTaskUC.execute(gameId, taskId);
  },

  reorderTasks: async (gameId, orderedTasks) => {
    await reorderTasksUC.execute(gameId, orderedTasks);
  },

  updateStoryName: async (gameId, storyName) => {
    await updateStoryNameUC.execute(gameId, storyName);
  },

  deleteGame: async (gameId) => {
    await gameRepository.delete(gameId);
    removeGameFromCache(gameId);
  },

  updateGame: async (gameId, updates) => {
    const game = await gameRepository.getById(gameId);
    if (game) {
      Object.assign(game, updates);
      await gameRepository.save(game);
    }
  },

  setDontVote: async (gameId, playerId) => {
    await setDontVoteUC.execute(gameId, playerId);
  },

  getCurrentPlayer: (playerId: string) => {
    const { players } = get();
    return players.find((p) => p.id === playerId);
  },
}));
