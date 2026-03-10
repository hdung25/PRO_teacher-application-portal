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
            let smoothedLevel = 0;

            const updateLevel = () => {
                if (!analyserRef.current) return

                analyserRef.current.getByteFrequencyData(dataArray)

                // Find the peak frequency amplitude (0-255)
                let currentMax = 0
                for (let i = 0; i < dataArray.length; i++) {
                    if (dataArray[i] > currentMax) {
                        currentMax = dataArray[i]
                    }
                }

                // Convert to percentage and add a boost for normal speaking volume
                let rawPercentage = (currentMax / 255) * 100
                rawPercentage = Math.min(100, rawPercentage * 1.5) // 1.5x boost

                // Noise floor clamping
                if (rawPercentage < 8) rawPercentage = 0

                // Fast attack, slow release (Damping for smooth visuals)
                if (rawPercentage > smoothedLevel) {
                    // Instant response to loud sounds
                    smoothedLevel = rawPercentage
                } else {
                    // Smooth visual falloff (decrease by 4% each frame ~ 60fps)
                    smoothedLevel = Math.max(0, smoothedLevel - 4)
                }

                setMicLevel(Math.round(smoothedLevel))

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
