import { CreateGame } from "@/src/components/Poker/CreateGame/CreateGame";
import { JoinGame } from "@/src/components/Poker/JoinGame/JoinGame";
import { Section } from "@/src/pages/HomePage/components";
import { H1, H3, H4 } from "@/src/components/Typography";
import { Button } from "@/src/components/ui/button";
import { useTranslation } from "react-i18next";
import { useMatch, useNavigate } from "react-router-dom";
import LandingImage from './../../../images/background.jpg';
import { ChevronUpCircle } from "lucide-react";

export const HeroSection = () => {
    const isJoin = !!useMatch('/join');
    const isCreate = !!useMatch('/create');
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Section className="h-[calc(100dvh-72px)] w-full max-w-7xl bg-background flex flex-col justify-center items-center snap-start">
            <div className='sticky top-0'>
                <div className='flex flex-col-reverse md:flex-row p-4 items-stretch gap-4 md:px-12' >
                    <div className='flex flex-1 flex-col'>
                        <H1 className='text-left text-wrap'>{t('HomePage.heroSection.description')}</H1>
                        <H4 className='text-left text-wrap my-6 md:my-4'>{t('HomePage.heroSection.sub')}</H4>
                        <div className='flex flex-row gap-2 mt-auto justify-center'>
                            <Button className='px-4 py-6' variant='secondary' onClick={() => navigate('/join')}>
                                <H4>{t('HomePage.heroSection.joinSessionButton')}</H4>
                            </Button>
                            <Button className='px-4 py-6' onClick={() => navigate('/create')}>
                                <H4>{t('HomePage.heroSection.createSessionButton')}</H4>
                            </Button>
                        </div>
                    </div>
                    <CreateGame open={isCreate} onClose={() => navigate('/')} />
                    <JoinGame open={isJoin} onClose={() => navigate('/')} />
                    <div className='flex-1'>
                        <img
                            loading='lazy'
                            alt={t('HomePage.heroSection.title')}
                            className='w-full h-auto rounded-lg shadow-md'
                            src={LandingImage}
                        />
                    </div>
                </div>
                <div className="w-full flex justify-center mt-8 md:mt-[15dvh]">
                    <Button variant="ghost" className="align-middle gap-2" onClick={() => { document.querySelector('#ui')!.scrollIntoView(); }}>
                        <H3>
                            {t('HomePage.heroSection.readMore')}
                        </H3>
                        <ChevronUpCircle className="size-8" />
                    </Button>
                </div>
            </div>
        </Section>
    );
};