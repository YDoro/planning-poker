import { ReactNode } from "react"

export function H1({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h2 className={`scroll-m-20 text-center text-5xl font-normal tracking-tight text-balance ${className}`}>
            {children}
        </h2>
    )
}

export function H2({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h2 className={`scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance ${className}`}>
            {children}
        </h2>
    )
}

export function H3({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h2 className={`scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance ${className}`}>
            {children}
        </h2>
    )
}

export function H4({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h2 className={`scroll-m-20 text-center text-xl font-light tracking-tight text-balance ${className}`}>
            {children}
        </h2>
    )
}