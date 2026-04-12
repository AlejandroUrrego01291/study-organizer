import { useState, useEffect, useRef } from "react"

interface UseTotalTimerProps {
    initialSeconds: number
    isRunning: boolean
}

export function useTotalTimer({ initialSeconds, isRunning }: UseTotalTimerProps) {
    const [totalSeconds, setTotalSeconds] = useState(initialSeconds)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        setTotalSeconds(initialSeconds)
    }, [initialSeconds])

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTotalSeconds((prev) => prev + 1)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning])

    return totalSeconds
}