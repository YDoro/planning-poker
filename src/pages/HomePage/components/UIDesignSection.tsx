import { useTranslation } from "react-i18next";

import SessionDark from './../../../images/session-b.png';
import SessionWhite from './../../../images/session-w.png';

import { ThemedImage } from "@/src/components/ThemedImage/ThemedImage";
import { H2, H4 } from "@/src/components/Typography";
import { Section } from "./Section";
import { HorizontalScrollWithSnap } from "@/src/components/ui/horizontal-scroll-with-snap";

export const UIDesignSection = () => {
    const { t } = useTranslation();
    const IntuitiveDesign = <div className="flex flex-col-reverse md:flex-row max-w-dvw md:max-w-7xl w-full">
        <div className='p-6 flex flex-col items-center justify-center w-full md:w-2/5'>
            <H2 className="mb-12">
                {t('HomePage.uiSection.intuitiveTitle')}
            </H2>
            <H4 className='text-base'>
                {t('HomePage.uiSection.intuitiveDesc')}
            </H4>
        </div>
        <ThemedImage imageLight={SessionWhite} imageDark={SessionDark} alt='Session controller' imgClass='max-w-[90dvw] md:max-w-2xl' />
    </div>

    return (
        <Section className="h-screen w-full bg-secondary rounded-t-3xl flex justify-center snap-start">
            <div className="sticky top-0 max-w-7xl flex flex-col mt-8 md:m-[10dvh]">
                <HorizontalScrollWithSnap gap={16} className="w-screen" snapAlign="start" showDots showGlow={false}>
                    {IntuitiveDesign}
                    {IntuitiveDesign}
                    {IntuitiveDesign}
                </HorizontalScrollWithSnap>
            </div>
        </Section>
    );
};