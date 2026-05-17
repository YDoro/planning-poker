import { FC, HTMLAttributes } from "react";
import { StoryCard } from "./StoryCard";
import { Story } from "./types/story";
import { Game } from "../../../types/game";
import { Player } from "../../../types/player";

type GameBoardProps = FC<{
    stories: Story[];
    game?: Game;
    players?: Player[];
    isModerator?: boolean;
    onStoryNameChange?: (name: string) => void;
    onAddStory: (story: Story) => void;
    onSelectStory?: (story: Story) => void;
    onEditStory?: (story: Story) => void;
    onDeleteStory?: (story: Story) => void;
} & HTMLAttributes<HTMLDivElement>>

export const GameBoard: GameBoardProps = ({ className, stories, game, players, isModerator, onStoryNameChange, ...props }) => {
    return (
        <div className={`flex w-full max-w-7xl max-h-[50dvh] rounded-md aspect-9/16 md:aspect-video self-center justify-center items-center bg-popover ${className}`} {...props}>
            {stories.map((story, index) => (
                <StoryCard 
                    key={story.cod || index} 
                    story={story} 
                    game={game}
                    players={players}
                    isModerator={isModerator}
                    onStoryNameChange={onStoryNameChange}
                />
            ))}
        </div>
    );
}