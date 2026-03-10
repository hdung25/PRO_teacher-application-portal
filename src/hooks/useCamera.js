import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook to access camera + microphone via WebRTC getUserMedia.
 * Returns the media stream, a ref for <video>, permission status, and error.
 */
export function useCamera() {
    const [stream, setStream] = useState(null)
    const [error, setError] = useState(null)
    const [isReady, setIsReady] = useState(false)
    const [permissionState, setPermissionState] = useState('prompt') // 'prompt' | 'granted' | 'denied'
    const videoRef = useRef(null)

    const startCamera = useCallback(async () => {
        try {
            setError(null)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
                audio: true,
            })
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

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop())
            setStream(null)
            setIsReady(false)
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
    }, [stream])

    // Attach stream to video element when ref or stream changes
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [stream])

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
