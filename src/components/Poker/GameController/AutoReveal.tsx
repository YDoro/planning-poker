import { useTranslation } from "react-i18next";
import { Switch } from "../../ui/switch";

interface AutoRevealProps {
    autoReveal: boolean;
    onAutoReveal: (autoReveal: boolean) => void;
}

export const AutoReveal: React.FC<AutoRevealProps> = ({ autoReveal, onAutoReveal }) => {
    const { t } = useTranslation();

    return (
        <div className='flex flex-col items-center gap-2'>
            <Switch id="auto-reveal-switch" checked={autoReveal} onCheckedChange={(value) => onAutoReveal(value)} />
            <label htmlFor="auto-reveal-switch">
                <span className='text-xs leading-none text-center block'>{t('GameController.autoReveal')}</span>
            </label>
        </div>
    );
};
