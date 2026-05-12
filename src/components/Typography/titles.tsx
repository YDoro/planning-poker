import { forwardRef, HTMLAttributes } from "react"

export const H1 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ children, className, ...props }, ref) => {
        return (
            <h1
                ref={ref}
                className={`scroll-m-20 text-center text-5xl font-normal tracking-tight text-balance ${className ?? ""}`}
                {...props}
            >
                {children}
            </h1>
        )
    }
)
H1.displayName = "H1"

export const H2 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ children, className, ...props }, ref) => {
        return (
            <h2
                ref={ref}
                className={`scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance ${className ?? ""}`}
                {...props}
            >
                {children}
            </h2>
        )
    }
)
H2.displayName = "H2"

export const H3 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ children, className, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={`scroll-m-20 text-center text-2xl font-bold tracking-tight text-balance ${className ?? ""}`}
                {...props}
            >
                {children}
            </h3>
        )
    }
)
H3.displayName = "H3"

export const H4 = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ children, className, ...props }, ref) => {
        return (
            <h4
                ref={ref}
                className={`scroll-m-20 text-center text-xl font-light tracking-tight text-balance ${className ?? ""}`}
                {...props}
            >
                {children}
            </h4>
        )
    }
)
H4.displayName = "H4"