export const ControllerButton = ({
    onClick,
    icon,
    label,
    className,
    testId,
    title,
    children,
}: {
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    className: string;
    testId?: string;
    title?: string;
    children?: React.ReactNode;
}) => (
    <div className='flex flex-col items-center'>
        {children ? (
            children
        ) : (
            <button
                type='button'
                role='button'
                aria-label={label}
                id={testId}
                key={testId}
                onClick={onClick}
                data-testid={testId}
                className={`p-2 cursor-pointer rounded-full bg-white dark:bg-gray-900 ${className} transition`}
                title={title || label}
            >
                {icon}
            </button>
        )}
        <span className='text-xs mt-1 text-center'>{label}</span>
    </div>
);