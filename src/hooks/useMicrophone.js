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
    const lastUpdateTimeRef = useRef(0)
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
            analyser.smoothingTimeConstant = 0.4 // Moderate Native smoothing

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

            const updateLevel = (timestamp) => {
                if (!analyserRef.current) return

                analyserRef.current.getByteTimeDomainData(dataArray)

                // Calculate RMS (root mean square) from time domain
                let sum = 0
                for (let i = 0; i < dataArray.length; i++) {
                    const amplitude = dataArray[i] - 128
                    sum += amplitude * amplitude
                }
                const rms = Math.sqrt(sum / dataArray.length)

                // Normalize: Normal voice usually hits RMS 10-25
                let normalized = Math.min(100, Math.round((rms / 25) * 100))
                
                // Noise floor
                if (normalized < 5) normalized = 0

                // Throttle React state updates to ~15fps (every 66ms) 
                // This allows CSS 'duration-150' transitions to do the smoothing!
                // 60fps updates interrupt CSS transitions and cause extreme jitter.
                if (timestamp - lastUpdateTimeRef.current > 66) {
                    setMicLevel(normalized)
                    lastUpdateTimeRef.current = timestamp
                }

                animationFrameRef.current = requestAnimationFrame(updateLevel)
            }

            animationFrameRef.current = requestAnimationFrame(updateLevel)
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
