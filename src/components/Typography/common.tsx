import { HtmlHTMLAttributes } from "react";

type TextProps = HtmlHTMLAttributes<HTMLParagraphElement>

export const Text = (props: TextProps) => {
    return (
        <p className={`font-normal font-sans ${props.className}`} {...props}>
            {props.children}
        </p>
    )
}

export const MarqueeText = ({ children, className = "", title }: { children: React.ReactNode, className?: string, title?: string }) => {
    return (
        <div className={`overflow-hidden whitespace-nowrap marquee-hover w-full ${className}`} title={title}>
            <div className="inline-block marquee-content">
                <span className="inline-block pr-10">{children}</span>
                <span className="inline-block pr-10">{children}</span>
            </div>
        </div>
    )
}