import { getGameFromStore, getPlayersFromStore } from "../repository/firebase";
import { Player } from "../types/player";
import { Status } from "../types/status";
import { getGame, updateGame } from "./games";

export const getCurrentTask = async (gameId: string) => {
    const game = await getGame(gameId)
    return game?.tasks?.find((t) => t.id === game.currentTaskId);
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
        await updateGame(gameId, { currentTask: { ...currentTask, revealed: true } });
    }
}