import React, { useEffect, useState, useRef, ReactNode } from 'react';

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, className = '' }) => {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setShowLeftScroll(el.scrollLeft > 10);
      setShowRightScroll(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  return (
    <div className='relative w-full group'>
      {/* Glow */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-background via-background/20 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${showLeftScroll ? 'opacity-100' : 'opacity-0'
          }`}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-background via-background/20 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${showRightScroll ? 'opacity-100' : 'opacity-0'
          }`}
      />

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="overflow-x-auto scrollbar-hide w-full"
      >
        <div className={`flex min-w-full w-max ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
