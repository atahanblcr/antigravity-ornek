import { useState, useEffect } from 'react'

/**
 * Ekran boyutunu algılayan hook
 * Mobil/Masaüstü Drawer/Sheet deseni için kullanılır
 * Reference.md Bölüm 4.2.1
 */
export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)

        // İlk değeri ayarla
        setMatches(media.matches)

        // Değişiklikleri dinle
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches)
        }

        media.addEventListener('change', listener)

        return () => {
            media.removeEventListener('change', listener)
        }
    }, [query])

    return matches
}

/**
 * Mobil cihaz kontrolü için hazır hook
 * < 768px = mobil
 */
export const useIsMobile = (): boolean => {
    return useMediaQuery('(max-width: 767px)')
}
