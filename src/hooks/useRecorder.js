import { useState, useRef, useCallback } from 'react'

/**
 * Hook to record video+audio from a MediaStream using MediaRecorder API.
 * Returns controls and the recorded blob when done.
 */
export function useRecorder(stream) {
    const [isRecording, setIsRecording] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState(null)
    const [error, setError] = useState(null)
    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])

    const getSupportedMimeType = () => {
        const types = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4',
        ]
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) return type
        }
        return ''
    }

    const startRecording = useCallback(() => {
        if (!stream) {
            setError('No media stream available. Please allow camera access first.')
            return
        }

        try {
            setError(null)
            setRecordedBlob(null)
            chunksRef.current = []

            const mimeType = getSupportedMimeType()
            const options = mimeType ? { mimeType } : {}

            const mediaRecorder = new MediaRecorder(stream, options)

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: mimeType || 'video/webm',
                })
                setRecordedBlob(blob)
                setIsRecording(false)
            }

            mediaRecorder.onerror = (event) => {
                setError(`Recording error: ${event.error?.message || 'Unknown error'}`)
                setIsRecording(false)
            }

            mediaRecorder.start(1000) // collect data every second
            mediaRecorderRef.current = mediaRecorder
            setIsRecording(true)
        } catch (err) {
            setError(`Failed to start recording: ${err.message}`)
        }
    }, [stream])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
    }, [])

    return {
        isRecording,
        recordedBlob,
        error,
        startRecording,
        stopRecording,
    }
}
