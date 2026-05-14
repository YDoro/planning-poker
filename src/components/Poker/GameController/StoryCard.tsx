import { Story } from "./types/story";
import { Game } from "../../../types/game";
import { Player } from "../../../types/player";
import { Status } from "../../../types/status";
import { HTMLAttributes, useState, useEffect, useMemo } from "react";
import { Card } from "../../ui/card";
import { H2 } from "../../Typography";
import { Button } from "../../ui/button";
import { Plus, Pencil, Check } from "lucide-react";

import { useTranslation } from "react-i18next";

type StoryCardProps = HTMLAttributes<HTMLDivElement> & {
    story: Story;
    isModerator?: boolean;
    game?: Game;
    players?: Player[];
    onStoryNameChange?: (name: string) => void;
}

export const StoryCard = ({ story, isModerator, game, players, onStoryNameChange, ...props }: StoryCardProps) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing(!isEditing);

    useEffect(() => {
        if (isModerator && !story.title) {
            setIsEditing(true);
        }
    }, [story.title, isModerator]);

    const isFinished = game?.gameStatus === Status.Finished;

    const stats = useMemo(() => {
        if (!isFinished || !game || !players) return null;

        const finishedPlayers = players.filter(p => p.status === Status.Finished && p.value !== undefined);
        if (finishedPlayers.length === 0) return null;

        const values = finishedPlayers.map(p => {
            if (typeof p.value === 'number') return p.value;
            return Number(p.value);
        }).filter(v => !isNaN(v));

        if (values.length === 0) return null;

        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        // Mode
        const counts = new Map<number, number>();
        values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
        let maxCount = 0;
        let mode: number[] = [];
        counts.forEach((count, val) => {
            if (count > maxCount) {
                maxCount = count;
                mode = [val];
            } else if (count === maxCount) {
                mode.push(val);
            }
        });

        // Closest
        const availableValues = game.cards
            .map(c => Number(c.value))
            .filter(v => !isNaN(v))
            .sort((a, b) => a - b);

        let closest = availableValues[0];
        let minDiff = Math.abs(avg - closest);

        for (const val of availableValues) {
            const diff = Math.abs(avg - val);
            if (diff < minDiff) {
                minDiff = diff;
                closest = val;
            } else if (Math.abs(diff - minDiff) < 0.0001) {
                // Tie, pick the higher value as requested
                if (val > closest) {
                    closest = val;
                }
            }
        }

        return {
            average: avg.toFixed(1),
            mode: mode.join(', '),
            closest
        };
    }, [isFinished, game, players]);

    return (
        <Card className={`flex flex-col aspect-4/3 w-lg shadow-md p-4 relative group ${isFinished ? 'justify-between' : 'justify-center'}`}>
            <div className="flex flex-col items-center w-full">
                {isModerator && !isEditing && (
                    <button
                        onClick={toggleEdit}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t('common.edit')}
                    >
                        <Pencil size={16} className="text-muted-foreground" />
                    </button>
                )}

                {isEditing ? (
                    <div className='w-full text-xs'>
                        <div className="flex justify-between items-center mb-1">
                            <label className='font-semibold'>{t('GameController.storyName')}:</label>
                            <button
                                onClick={toggleEdit}
                                className="p-1 rounded-full hover:bg-secondary text-primary"
                                title={t('common.confirm')}
                            >
                                <Check size={16} />
                            </button>
                        </div>
                        <input
                            autoFocus
                            placeholder={t('GameController.enterStoryName')}
                            className='w-full italic p-2 border bg-white dark:bg-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400'
                            type='text'
                            data-testid='story-name-input'
                            value={story.title || ''}
                            onChange={(e) => onStoryNameChange?.(e.target.value || '')}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') toggleEdit();
                            }}
                        />
                    </div>
                ) : (
                    <H2 className="text-center truncate w-full px-2">{story.title}</H2>
                )}
            </div>

            {isFinished && stats && (
                <div className="w-full mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-[10px]">
                    <div className="flex flex-col items-center">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider">{t('GameController.average')}</span>
                        <span className="text-sm font-bold text-primary">{stats.average}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Moda</span>
                        <span className="text-sm font-bold text-primary">{stats.mode}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Próximo</span>
                        <span className="text-sm font-bold text-primary">{stats.closest}</span>
                    </div>
                </div>
            )}
        </Card>
    );
}

export const AddStoryCard = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => {
    return (
        <button {...props} className="flex hover:scale-105 transition-all">
            <Card className="flex aspect-4/3 w-lg shadow-md justify-center items-center" >
                <Plus size={100} />
            </Card>
        </button>
    );
}