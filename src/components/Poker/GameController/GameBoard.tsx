import { FC, HTMLAttributes } from "react";
import { StoryCard } from "./StoryCard";
import { Story } from "./types/story";
import { Game } from "../../../types/game";
import { Player } from "../../../types/player";
import { TaskList } from "./TaskList";
import { updateStoryName, editTask } from '../../../service/games';

type GameBoardProps = FC<{
    game: Game;
    players?: Player[];
    isModerator?: boolean;
} & HTMLAttributes<HTMLDivElement>>

export const GameBoard: GameBoardProps = ({ className, game, players, isModerator, ...props }) => {
    const currentTask = game.tasks?.find((t) => t.id === game.currentTaskId);
    const storyTitle = currentTask ? currentTask.title : game.storyName || '';
    
    console.log("GameBoard Render:", { 
      gameCurrentTaskId: game.currentTaskId, 
      currentTaskFound: !!currentTask,
      storyTitle
    });

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

    return (
        <div className={`flex flex-col md:flex-row gap-4 w-full justify-between max-w-7xl max-h-[50dvh] rounded-md aspect-9/16 md:aspect-video self-center items-center bg-popover ${className}`} {...props}>
            <div className="w-full flex justify-center">
                <StoryCard
                    key={story.cod}
                    story={story}
                    game={game}
                    players={players}
                    isModerator={isModerator}
                    onStoryNameChange={handleStoryNameChange}
                />
            </div>
            <TaskList game={game} isModerator={!!isModerator} />
        </div>
    );
}