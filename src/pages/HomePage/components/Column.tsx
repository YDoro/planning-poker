type ColumnProps = React.HTMLAttributes<HTMLDivElement>;

export const Column = ({ children, className = '', ...props }: ColumnProps) => (
    <div className={`w-full lg:w-1/2 px-4 ${className}`} {...props}>
        {children}
    </div>
);
