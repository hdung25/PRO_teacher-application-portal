import { useState, useEffect, useRef, useCallback } from 'react'

let globalStream = null;

/**
 * Hook to access camera + microphone via WebRTC getUserMedia.
 * Returns the media stream, a ref for <video>, permission status, and error.
 */
export function useCamera() {
    const [stream, setStream] = useState(globalStream)
    const [error, setError] = useState(null)
    const [isReady, setIsReady] = useState(!!globalStream)
    const [permissionState, setPermissionState] = useState(globalStream ? 'granted' : 'prompt') // 'prompt' | 'granted' | 'denied'
    const videoRef = useRef(null)

    const startCamera = useCallback(async () => {
        try {
            setError(null)
            
            // If we already have a live stream, reuse it to prevent iOS Safari freezing
            if (globalStream && globalStream.active) {
                setStream(globalStream)
                setIsReady(true)
                setPermissionState('granted')
                if (videoRef.current) {
                    videoRef.current.srcObject = globalStream
                }
                return
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
                audio: true,
            })
            
            globalStream = mediaStream
            setStream(mediaStream)
            setIsReady(true)
            setPermissionState('granted')

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
        } catch (err) {
            setIsReady(false)
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionState('denied')
                setError('Camera/microphone permission denied. Please allow access in your browser settings.')
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera or microphone found. Please connect a device and try again.')
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera or microphone is already in use by another application.')
            } else {
                setError(`Failed to access camera: ${err.message}`)
            }
        }
    }, [])

    const stopCamera = useCallback((hardStop = false) => {
        // ONLY stop tracks if hardStop is requested (e.g., at the very end of the application)
        // Otherwise, leave it running in the background for the next page to pick up instantly
        if (hardStop && globalStream) {
            globalStream.getTracks().forEach((track) => track.stop())
            globalStream = null
            setStream(null)
            setIsReady(false)
        }
        
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
    }, [])

    // Attach stream to video element when ref or stream changes
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    // Cleanup on unmount (Do NOT destroy stream, just detach video ref)
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.srcObject = null
            }
        }
    }, [])

    return {
        stream,
        videoRef,
        isReady,
        error,
        permissionState,
        startCamera,
        stopCamera,
    }
}
