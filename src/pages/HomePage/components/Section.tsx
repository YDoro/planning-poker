export const Section = (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={`flex flex-col py-6 md:py-12 lg:flex-row w-full max-w-7xl items-center justify-center ${props.className}`}
        {...props}
    >
        {props.children}
    </div>
);