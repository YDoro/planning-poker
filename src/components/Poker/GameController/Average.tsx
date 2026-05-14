import { Game, GameType } from "@/src/types/game";
import { Player } from "@/src/types/player";
import { useTranslation } from "react-i18next";
import { Status } from "@/src/types/status";
import { Info } from "lucide-react";

const getAverage = (game: Game, players: Player[]): number => {
    let values = 0;
    let numberOfPlayersPlayed = 0;
    const cards = game.cards;
    players.forEach((player) => {
        const value =
            game.gameType === GameType.Custom
                ? Number(cards.find((card) => card.value === player.value)?.displayValue)
                : player.value;

        if (
            player.status === Status.Finished &&
            value !== undefined &&
            !isNaN(value) &&
            value &&
            value >= 0
        ) {
            values = values + value;
            numberOfPlayersPlayed++;
        }
    });
    return Math.round((values / numberOfPlayersPlayed) * 100) / 100;
};


export const AverageComponent: React.FC<{ game: Game; players: Player[] }> = ({ game, players }) => {
    const gameType = game.gameType;
    const NOT_APPLICABLE = 'N/A';
    const EMPTY = '-';
    const canShowAverage = gameType !== GameType.TShirt && gameType !== GameType.TShirtAndNumber;

    if (!canShowAverage) {
        return null;
    }

    const { t } = useTranslation();
    const gameAverage = getAverage(game, players);
    let average = game.gameStatus === Status.Finished && gameAverage ? gameAverage.toFixed(2) : EMPTY;


    return (
        <>
            <div className='mx-2 h-6 border-l border-gray-400 dark:border-gray-600' />
            <span className='text-sm font-medium'>{t('GameController.average')}:</span>
            <span className='px-2 py-1 ml-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 font-bold shadow-sm border border-gray-200 inline-flex items-center relative'>
                {average}
                {average !== EMPTY && average !== NOT_APPLICABLE && (
                    <>
                        <span className='relative group ml-1'>
                            <span className='cursor-pointer group ml-1 flex'>
                                <Info className='h-4 w-4 text-gray-600 dark:text-gray-300' />
                            </span>
                            <span className='absolute left-1/2 top-full mt-2 z-10 -translate-x-1/2 w-max min-w-[80px] rounded bg-white dark:bg-gray-900 bg-opacity-90 px-2 py-1 text-xs font-semibold border border-gray-200 dark:border-gray-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                                {`Rounded Average : ${Math.round(gameAverage) || 0}`}
                            </span>
                        </span>
                    </>
                )}
            </span>
        </>
    );
};