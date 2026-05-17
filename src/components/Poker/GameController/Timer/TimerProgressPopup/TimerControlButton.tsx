type TimerControlButtonProps = {
  title: string
  callback: () => void
  children?: React.ReactNode
  disabled?: boolean
  className?: string
}

export const TimerControlButton: React.FC<TimerControlButtonProps> = ({
  title,
  callback,
  children,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      title={title}
      aria-label={title}
      type='button'
      className={`p-2 border-2 border-border h-8 w-8 flex items-center justify-center text-xl hover:text-foreground hover:border-foreground pb-[0.7rem] ${className} bg-background`}
      onClick={callback}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
