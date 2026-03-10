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
            
            // Try to resume immediately in case it's suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(e => console.error("AudioContext resume failed:", e))
            }

            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 256
            analyser.smoothingTimeConstant = 0.5 // Lower smoothing for faster response

            const source = audioContext.createMediaStreamSource(stream)
            source.connect(analyser)

            audioContextRef.current = audioContext
            analyserRef.current = analyser
            sourceRef.current = source
            setIsActive(true)

            // Setup listeners to guarantee AudioContext unblocks on first interaction
            const unlockAudioContext = () => {
                if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume()
                }
                window.removeEventListener('click', unlockAudioContext)
                window.removeEventListener('touchstart', unlockAudioContext)
            }
            window.addEventListener('click', unlockAudioContext)
            window.addEventListener('touchstart', unlockAudioContext)

            const dataArray = new Uint8Array(analyser.frequencyBinCount)

            const updateLevel = () => {
                if (!analyserRef.current) return

                analyserRef.current.getByteFrequencyData(dataArray)

                // Calculate average frequency volume
                let sum = 0
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i]
                }
                const average = sum / dataArray.length

                // Increase sensitivity a lot: average usually hovers around 10-30 for normal speaking
                const normalized = Math.min(100, Math.round((average / 40) * 100))
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
