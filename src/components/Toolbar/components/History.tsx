import { History } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { RecentGames } from "../../Poker/RecentGames/RecentGames";

export const HistoryButton = () => {
    return (
        <Popover>
            <PopoverTrigger className="button-ghost text-left flex items-center">
                <History />
            </PopoverTrigger>
            <PopoverContent className='w-xs p-0'>
                <RecentGames />
            </PopoverContent>
        </Popover>
    );
};