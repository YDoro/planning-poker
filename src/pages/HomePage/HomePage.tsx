import { HTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { Divider } from '../../components/Divider/Divider';
import { CreateGame } from '../../components/Poker/CreateGame/CreateGame';
import { JoinGame } from '../../components/Poker/JoinGame/JoinGame';
import { RecentGames } from '../../components/Poker/RecentGames/RecentGames';
import { H1, H4 } from '../../components/Typography';
import { AboutPlanningPokerContent } from '../AboutPage/AboutPage';
import SessionControllerImage from './../../images/Session.jpg';
import LandingImage from './../../images/background.jpg';
import { Button } from '@/src/components/ui/button';

export const HomePage = () => {
  return (
    <>
      <div className='flex flex-col items-center w-full animate-fade-in-down'>
        <HeroSection />
        {/* <GoogleAd /> */}
        <Divider />
        <RecentGamesSection />
        <Divider />
        <UIDesignSection />
        {/* <GoogleAd /> */}
        <Divider />
        <AboutSection />
        {/* <GoogleAd /> */}
      </div>
    </>
  );
};

type SectionProps = {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
};

const Section = ({ children, maxWidth = 'max-w-7xl', className = '' }: SectionProps) => (
  <div
    className={`flex flex-col py-6 md:py-12 lg:flex-row w-full ${maxWidth} items-center justify-center ${className}`}
  >
    {children}
  </div>
);

type ColumnProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const Column = ({ children, className = '', ...props }: ColumnProps) => (
  <div className={`w-full lg:w-1/2 px-4 ${className}`} {...props}>
    {children}
  </div>
);

const HeroSection = () => {
  const isJoin = !!useMatch('/join');
  const isCreate = !!useMatch('/create');
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (<div>
    <Section>
      <div className='flex flex-col-reverse md:flex-row p-4 items-stretch gap-4' >
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
    </Section>
  </div>
  );
};

const RecentGamesSection = () => {
  const { t } = useTranslation();
  return (
    <Section>
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

const UIDesignSection = () => {
  const { t } = useTranslation();
  return (
    <Section className='max-w-7xl'>
      <Column className='mb-8 lg:mb-0'>
        <div className='p-6 flex flex-col items-center justify-center'>
          <h2 className='text-xl font-semibold mb-2'>
            {t('HomePage.uiDesignTitle', 'Intuitive UI Design')}
          </h2>
          <p className='text-base'>
            {t(
              'HomePage.uiDesignDesc',
              "Beautiful design for voting the story points, showing team members voting status with emojis(👍 - Voting Done, 🤔 - Yet to Vote). Once the card values are revealed, the card color helps to understand if the team's voting is sync or not. Session Moderator has full control on revealing story points and restarting the session.",
            )}
          </p>
        </div>
      </Column>
      <Column>
        <div className='flex justify-center'>
          <div className='p-4'>
            <img
              className='-mt-2 w-[600px] h-auto rounded-lg shadow-md'
              alt='Session controller'
              src={SessionControllerImage}
            />
          </div>
        </div>
      </Column>
    </Section>
  );
};

const AboutSection = () => (
  <Section>
    <AboutPlanningPokerContent />
  </Section>
);

export default HomePage;
