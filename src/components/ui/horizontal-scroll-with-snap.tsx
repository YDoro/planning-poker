"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface HorizontalScrollProps {
    children: React.ReactNode
    className?: string
    itemClassName?: string
    gap?: number
    snapAlign?: "start" | "center" | "end"
    showGlow?: boolean
    showDots?: boolean
    dotsClassName?: string
    dotsPosition?: "bottom" | "top"
}

export function HorizontalScrollWithSnap({
    children,
    className,
    itemClassName,
    gap = 16,
    snapAlign = "start",
    showGlow = true,
    showDots = false,
    dotsClassName,
    dotsPosition = "bottom",
}: HorizontalScrollProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])
    const [showLeftScroll, setShowLeftScroll] = React.useState(false)
    const [showRightScroll, setShowRightScroll] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(0)

    // Touch tracking para decidir direção do scroll
    const touchStartRef = React.useRef<{ x: number; y: number } | null>(null)
    const isHorizontalScrollRef = React.useRef<boolean | null>(null)

    const childrenArray = React.Children.toArray(children)
    const childCount = childrenArray.length

    const checkScroll = React.useCallback(() => {
        if (!scrollRef.current) return

        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        const threshold = 10

        setShowLeftScroll(scrollLeft > threshold)
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - threshold)

        // Calcular qual item está mais visível
        let closestIndex = 0
        let closestDistance = Infinity

        itemRefs.current.forEach((item, index) => {
            if (!item || !scrollRef.current) return

            const itemRect = item.getBoundingClientRect()
            const containerRect = scrollRef.current.getBoundingClientRect()

            let distance: number
            if (snapAlign === "center") {
                const itemCenter = itemRect.left + itemRect.width / 2
                const containerCenter = containerRect.left + containerRect.width / 2
                distance = Math.abs(itemCenter - containerCenter)
            } else if (snapAlign === "end") {
                distance = Math.abs(itemRect.right - containerRect.right)
            } else {
                distance = Math.abs(itemRect.left - containerRect.left)
            }

            if (distance < closestDistance) {
                closestDistance = distance
                closestIndex = index
            }
        })

        setActiveIndex(closestIndex)
    }, [snapAlign])

    const scrollToIndex = React.useCallback((index: number) => {
        const item = itemRefs.current[index]
        if (!item || !scrollRef.current) return

        item.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: snapAlign === "center" ? "center" : snapAlign === "end" ? "end" : "start",
        })
    }, [snapAlign])

    const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0]
        touchStartRef.current = { x: touch.clientX, y: touch.clientY }
        isHorizontalScrollRef.current = null
    }, [])

    const handleTouchMove = React.useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (!touchStartRef.current) return

        const touch = e.touches[0]
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

        if (isHorizontalScrollRef.current === null && (deltaX > 10 || deltaY > 10)) {
            isHorizontalScrollRef.current = deltaX > deltaY
        }

        if (isHorizontalScrollRef.current === false) {
            e.currentTarget.style.overflowX = "hidden"
        }
    }, [])

    const handleTouchEnd = React.useCallback(() => {
        touchStartRef.current = null
        isHorizontalScrollRef.current = null
        // Restaura o overflow após o touch
        if (scrollRef.current) {
            scrollRef.current.style.overflowX = "auto"
        }
    }, [])

    React.useEffect(() => {
        checkScroll()

        const scrollElement = scrollRef.current
        if (scrollElement) {
            scrollElement.addEventListener("scroll", checkScroll, { passive: true })

            const resizeObserver = new ResizeObserver(checkScroll)
            resizeObserver.observe(scrollElement)

            return () => {
                scrollElement.removeEventListener("scroll", checkScroll)
                resizeObserver.disconnect()
            }
        }
    }, [checkScroll])

    const dots = showDots && childCount > 1 && (
        <div
            className={cn(
                "flex justify-center gap-2 py-3",
                dotsClassName
            )}
        >
            {childrenArray.map((_, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => scrollToIndex(index)}
                    aria-label={`Ir para item ${index + 1}`}
                    className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        "hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        index === activeIndex
                            ? "bg-foreground scale-110"
                            : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    )}
                />
            ))}
        </div>
    )

    return (
        <div className="relative w-full group">
            {dotsPosition === "top" && dots}

            <div className="relative">
                {/* Glow esquerdo */}
                {showGlow && (
                    <div
                        className={cn(
                            "absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-background via-background/20 to-transparent pointer-events-none z-20 transition-opacity duration-300",
                            showLeftScroll ? "opacity-100" : "opacity-0"
                        )}
                    />
                )}

                {/* Glow direito */}
                {showGlow && (
                    <div
                        className={cn(
                            "absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-background via-background/20 to-transparent pointer-events-none z-20 transition-opacity duration-300",
                            showRightScroll ? "opacity-100" : "opacity-0"
                        )}
                    />
                )}

                <div
                    ref={scrollRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={cn(
                        "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide",
                        className
                    )}
                    style={{ gap: `${gap}px` }}
                >
                    {childrenArray.map((child, index) => (
                        <div
                            key={index}
                            ref={(el) => { itemRefs.current[index] = el }}
                            className={cn(
                                "shrink-0",
                                snapAlign === "start" && "snap-start",
                                snapAlign === "center" && "snap-center",
                                snapAlign === "end" && "snap-end",
                                itemClassName
                            )}
                        >
                            {child}
                        </div>
                    ))}
                </div>
            </div>

            {dotsPosition === "bottom" && dots}
        </div>
    )
}
