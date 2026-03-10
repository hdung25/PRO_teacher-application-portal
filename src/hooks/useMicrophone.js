import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook to measure real microphone input level using Web Audio API.
 * Takes a MediaStream (from useCamera) and returns a normalized level 0–100.
 */
export function useMicrophone(stream) {
    const [micLevel, setMicLevel] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const audioContextRef = useRef(null)
    const analyserRef = useRef(null)
    const animationFrameRef = useRef(null)
    const sourceRef = useRef(null)

    const startAnalyser = useCallback(() => {
        if (!stream) return

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            analyser.smoothingTimeConstant = 0.8

            const source = audioContext.createMediaStreamSource(stream)
            source.connect(analyser)

            audioContextRef.current = audioContext
            analyserRef.current = analyser
            sourceRef.current = source
            setIsActive(true)

            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const updateLevel = () => {
                if (!analyserRef.current) return

                analyserRef.current.getByteFrequencyData(dataArray)

                // Calculate RMS (root mean square) for a more accurate level
                let sum = 0
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i] * dataArray[i]
                }
                const rms = Math.sqrt(sum / dataArray.length)

                // Normalize to 0–100 range with some sensitivity adjustment
                const normalized = Math.min(100, Math.round((rms / 128) * 100))
                setMicLevel(normalized)

                animationFrameRef.current = requestAnimationFrame(updateLevel)
            }

            updateLevel()
        } catch (err) {
            console.error('Failed to initialize audio analyser:', err)
            setIsActive(false)
        }
    }, [stream])

    const stopAnalyser = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }
        if (sourceRef.current) {
            sourceRef.current.disconnect()
            sourceRef.current = null
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
        analyserRef.current = null
        setIsActive(false)
        setMicLevel(0)
    }, [])

    // Auto-start when stream is available
    useEffect(() => {
        if (stream) {
            startAnalyser()
        }
        return () => stopAnalyser()
    }, [stream, startAnalyser, stopAnalyser])

    return { micLevel, isActive }
}
