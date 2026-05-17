import { useTranslation } from "react-i18next";
import { Section } from "./Section";
import { Column } from "./Column";
import SessionControllerImage from './../../../images/Session.jpg';

export const UIDesignSection = () => {
    const { t } = useTranslation();
    return (
        <Section>
            <Column>
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