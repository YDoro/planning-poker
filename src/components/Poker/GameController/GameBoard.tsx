import { FC, HTMLAttributes } from "react";
import { StoryCard } from "./StoryCard";
import { Story } from "./types/story";
import { Game } from "../../../core/domain/entities/Game";
import { Player } from "../../../core/domain/entities/Player";
import { TaskList } from "./TaskList";
import { useTranslation } from 'react-i18next';
import { CheckCheck } from 'lucide-react';
import { useGameStore } from "../../../presentation/stores/useGameStore";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../ui/resizable";
import { useBreakpoint } from "@/src/hooks/useBreakpoint";

type GameBoardProps = FC<{
    game: Game;
    players?: Player[];
    isModerator?: boolean;
} & HTMLAttributes<HTMLDivElement>>

/** All tasks are done (voted or skipped) — no pending/voting task left */
const isPlanningFinished = (game: Game): boolean => {
    const tasks = game.tasks;
    if (!tasks || tasks.length === 0) return false;
    return tasks.every(t => t.status === 'voted' || t.status === 'skipped') && game.isFinished;
};

export const GameBoard: GameBoardProps = ({ className, game, players, isModerator, ...props }) => {
    const { t } = useTranslation();
    const editTaskStore = useGameStore((state) => state.editTask);
    const updateStoryNameStore = useGameStore((state) => state.updateStoryName);
    const addTaskStore = useGameStore((state) => state.addTask);
    const currentTask = game.tasks?.find((t) => t.id === game.currentTaskId);
    const storyTitle = currentTask ? currentTask.title : game.storyName || '';
    const finished = isPlanningFinished(game);
    const { isMd } = useBreakpoint()
    const story: Story = {
        cod: currentTask?.id || 'active',
        title: storyTitle,
        description: currentTask?.description || '',
        points: currentTask?.score,
    };

    const handleStoryNameChange = (name: string) => {
        if (currentTask) {
            editTaskStore(game.id, currentTask.id, { title: name });
        } else {
            updateStoryNameStore(game.id, name);
        }
    };

    const handleStoryNameConfirm = (name: string) => {
        if (currentTask) return;
        if (name.trim()) {
            addTaskStore(game.id, { title: name.trim(), description: '' });
        }
    };

    if (finished) {
        return (
            <div className={`flex flex-col gap-4 pt-2 w-full justify-start max-w-xl 2xl:max-w-7xl rounded-md self-center ${className}`} {...props}>
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
        <ResizablePanelGroup orientation={isMd ? "horizontal" : "vertical"} className="
        self-center
        gap-2
        p-2

        max-h-screen
        max-w-full
        min-h-[60dvh]
        
        md:min-h-[50dvh]
        md:max-h-[50dvh]
        md:max-w-4xl
        
        2xl:max-w-7xl
        2xl:mt-[7dvh]
        ">
            <ResizablePanel defaultSize={70}>
                <StoryCard
                    key={story.cod}
                    story={story}
                    game={game}
                    players={players}
                    isModerator={isModerator}
                    onStoryNameChange={handleStoryNameChange}
                    onStoryNameConfirm={handleStoryNameConfirm}
                />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30}>
                <TaskList game={game} isModerator={!!isModerator} fullWidth />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}