import { getGameFromStore, getPlayersFromStore } from "../repository/firebase";
import { Player } from "../types/player";
import { Status } from "../types/status";
import { Task } from "../types/task";
import { getGame, updateGame } from "./games";

export const getCurrentTask = async (gameId: string): Promise<Task | undefined> => {
    const game = await getGame(gameId)
    if (!game) return undefined;
    const taskInList = game.tasks?.find((t) => t.id === game.currentTaskId);
    const rootCurrentTask = (game as any).currentTask;
    if (rootCurrentTask && rootCurrentTask.id === game.currentTaskId) {
        return { ...taskInList, ...rootCurrentTask };
    }

    console.log('taskInList', taskInList)
    return taskInList;
}

export const setTaskVoted = async (gameId: string) => {
    const game = await getGameFromStore(gameId);
    const players = await getPlayersFromStore(gameId);
    const haveAllPlayersVoted = players.every((player: Player) => player.status === Status.Finished || player.isNonVoter);

    if (game && game.tasks && haveAllPlayersVoted) {
        const tasks = game.tasks.map((t) => {
            if (t.id === game.currentTaskId && t.status === 'voting') {
                return { ...t, status: 'voted' };
            }
            return t;
        });
        await updateGame(gameId, { tasks, gameStatus: Status.Started });
    }
}

export const revealCurrentTaskCards = async (gameId: string) => {
    const currentTask = await getCurrentTask(gameId);
    if (currentTask) {
        const game = await getGame(gameId);
        const tasks = game?.tasks?.map((t) => {
            if (t.id === game.currentTaskId) {
                return { ...t, status: 'voted', revealed: true };
            }
            return t;
        }) || [];
        await updateGame(gameId, { 
            currentTask: { ...currentTask, status: 'voted', revealed: true },
            tasks
        });
    }
}