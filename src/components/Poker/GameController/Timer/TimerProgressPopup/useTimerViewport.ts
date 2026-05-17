import { useEffect, useState } from 'react'

const smQuery = '(min-width: 640px)'

export const useIsDesktopTimerLayout = () => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(smQuery).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(smQuery)
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return isDesktop
}
