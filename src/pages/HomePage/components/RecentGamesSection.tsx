import { Column } from "./Column";
import { Section } from "./Section";
import { useTranslation } from "react-i18next";
import { RecentGames } from "@/src/components/Poker/RecentGames/RecentGames";

export const RecentGamesSection = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { t } = useTranslation();
    return (
        <Section {...props}>
            <Column className='mb-8 lg:mb-0'>
                <div className='p-6 flex flex-col items-center justify-center'>
                    <RecentGames />
                </div>
            </Column>
            <Column>
                <div className='p-6 flex flex-col items-center justify-center'>
                    <p className='text-base'>
                        {t(
                            'HomePage.recentSessions',
                            'Here is your recent Planning/Refinement sessions, click on the session name to join the session again.',
                        )}
                    </p>
                </div>
            </Column>
        </Section>
    );
};