import { useTranslation } from "react-i18next";
import { Clock, Eye } from "lucide-react";
import { ControllerButton } from "./ControllerButton";

interface AutoRevealProps {
    autoReveal: boolean;
    onAutoReveal: (autoReveal: boolean) => void;
}

export const AutoReveal: React.FC<AutoRevealProps> = ({ autoReveal, onAutoReveal }) => {
    const { t } = useTranslation();

    return (
        <ControllerButton
            icon={
                <Clock id="auto-reveal-switch" className={autoReveal ? 'text-green-700' : 'text-muted'}>
                    <Eye size={15} x={-1} y={11} strokeWidth={3} className=" fill-white dark:fill-gray-900" />
                </Clock>
            }
            label={t('GameController.autoReveal')}
            onClick={() => onAutoReveal(!autoReveal)}
            testId='auto-reveal-button'
            className=''
        />
    );
};
