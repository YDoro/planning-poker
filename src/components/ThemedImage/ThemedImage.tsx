import { FC, HtmlHTMLAttributes, PropsWithChildren, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/src/contexts/ThemeContext";

type ThemedImageProps = FC<PropsWithChildren<{
    imageLight: string;
    imageDark: string;
} & HtmlHTMLAttributes<HTMLDivElement>>>

export const ThemedImage: ThemedImageProps = ({ imageLight, imageDark, ...props }) => {
    const { theme } = useTheme()

    const [previewTheme, setPreviewTheme] = useState(theme);

    useEffect(() => {
        setPreviewTheme(theme)
    }, [theme])

    const toggleTheme = () => {
        setPreviewTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    const iconClass =
        theme === 'dark' ?
            previewTheme === 'dark' ?
                'bg-foreground text-background' :
                'bg-background text-foreground'
            : previewTheme === 'dark' ?
                'bg-background text-foreground' :
                'bg-foreground text-background'


    return (
        <div className='flex justify-center'>
            <div className='p-4' {...props}>
                <div className="relative w-fit -mt-2">
                    <Button
                        variant='ghost'
                        size='icon-lg'
                        className={`absolute top-2 right-2 z-10 ${iconClass}`}
                        onClick={toggleTheme}>
                        {previewTheme === 'light' ? <Moon /> : <Sun />}
                    </Button>
                    <img
                        key={previewTheme}
                        className='animate-fade-in-right w-[600px] h-auto rounded-lg shadow-lg'
                        alt='Session controller'
                        src={previewTheme === 'dark' ? imageDark : imageLight}
                    />
                </div>
            </div>
        </div>
    )
}