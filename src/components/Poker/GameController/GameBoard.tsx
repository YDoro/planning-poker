import { FC, HTMLAttributes } from "react";
import { StoryCard } from "./StoryCard";
import { Story } from "./types/story";
import { Game } from "../../../types/game";
import { Player } from "../../../types/player";
import { TaskList } from "./TaskList";
import { updateStoryName, editTask, addTask } from '../../../service/games';
import { useTranslation } from 'react-i18next';
import { CheckCheck } from 'lucide-react';
import { Status } from "@/src/types/status";

type GameBoardProps = FC<{
    game: Game;
    players?: Player[];
    isModerator?: boolean;
} & HTMLAttributes<HTMLDivElement>>

/** All tasks are done (voted or skipped) — no pending/voting task left */
const isPlanningFinished = (game: Game): boolean => {
    const tasks = game.tasks;
    if (!tasks || tasks.length === 0) return false;
    return tasks.every(t => t.status === 'voted' || t.status === 'skipped') && game.gameStatus === Status.Finished;
};

export const GameBoard: GameBoardProps = ({ className, game, players, isModerator, ...props }) => {
    const { t } = useTranslation();
    const currentTask = game.tasks?.find((t) => t.id === game.currentTaskId);
    const storyTitle = currentTask ? currentTask.title : game.storyName || '';
    const finished = isPlanningFinished(game);

    const story: Story = {
        cod: currentTask?.id || 'active',
        title: storyTitle,
        description: currentTask?.description || '',
        points: currentTask?.score,
    };

    const handleStoryNameChange = (name: string) => {
        if (currentTask) {
            editTask(game.id, currentTask.id, { title: name });
        } else {
            updateStoryName(game.id, name);
        }
    };

    const handleStoryNameConfirm = (name: string) => {
        if (currentTask) return;
        if (name.trim()) {
            addTask(game.id, { title: name.trim(), description: '', status: 'pending' });
        }
    };

    if (finished) {
        return (
            <div className={`flex flex-col gap-4 w-full justify-start max-w-7xl rounded-md self-center items-center ${className}`} {...props}>
                {/* Planning finished banner */}
                <div className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400">
                    <CheckCheck size={22} />
                    <span className="font-semibold text-base">{t('GameController.planningFinished')}</span>
                </div>
                {/* Full-width task list */}
                <div className="w-full">
                    <TaskList game={game} isModerator={!!isModerator} fullWidth />
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col bg-background md:flex-row gap-4 w-full justify-between max-w-7xl md:max-h-[50dvh] rounded-md aspect-9/16 md:aspect-video self-center items-center md:bg-popover ${className}`} {...props}>
            <div className="w-full flex justify-center">
                <StoryCard
                    key={story.cod}
                    story={story}
                    game={game}
                    players={players}
                    isModerator={isModerator}
                    onStoryNameChange={handleStoryNameChange}
                    onStoryNameConfirm={handleStoryNameConfirm}
                />
            </div>
            <TaskList game={game} isModerator={!!isModerator} />
        </div>
    );
}