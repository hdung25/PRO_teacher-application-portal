import { useState, useEffect, useCallback } from 'react'
import { Settings, Mic, Play, VideoOff, Loader2, AlertCircle, Camera } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'
import { useMicrophone } from '../hooks/useMicrophone'
import { useRecorder } from '../hooks/useRecorder'
import { supabase } from '../lib/supabaseClient'

function LanguageTestRecording({ onNext, userId }) {
    const [countdown, setCountdown] = useState(5)
    const [isCountingDown, setIsCountingDown] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')

    const { stream, videoRef, isReady, error: cameraError, startCamera, stopCamera } = useCamera()
    const { micLevel, isActive: micActive } = useMicrophone(stream)
    const { isRecording, recordedBlob, error: recorderError, startRecording, stopRecording } = useRecorder(stream)

    // Auto-start camera on mount
    useEffect(() => {
        startCamera()
        return () => stopCamera()
    }, [])

    // Countdown logic
    useEffect(() => {
        if (!isCountingDown) return
        if (countdown <= 0) {
            startRecording()
            setIsCountingDown(false)
            return
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [isCountingDown, countdown, startRecording])

    // Handle upload when recording stops
    useEffect(() => {
        if (recordedBlob && !isRecording) {
            handleUpload(recordedBlob)
        }
    }, [recordedBlob, isRecording])

    const handleStartNow = () => {
        if (!isCountingDown && !isRecording && isReady) {
            setCountdown(5)
            setIsCountingDown(true)
        }
    }

    const handleFinishRecording = () => {
        stopRecording()
    }

    const handleUpload = async (blob) => {
        if (!userId) {
            // No user ID — skip upload, proceed
            stopCamera()
            onNext()
            return
        }

        setIsUploading(true)
        setUploadError('')

        try {
            const fileName = `${userId}/language-test-${Date.now()}.webm`
            const { error: uploadErr } = await supabase.storage
                .from('recordings')
                .upload(fileName, blob, {
                    contentType: 'video/webm',
                    upsert: true,
                })

            if (uploadErr) {
                console.error('Upload error:', uploadErr)
                setUploadError('Failed to upload recording. You can proceed anyway.')
                // Still allow proceeding
            } else {
                // Save the file path to the teacher's record
                const { data: { publicUrl } } = supabase.storage
                    .from('recordings')
                    .getPublicUrl(fileName)

                await supabase.from('teachers').update({
                    language_test_url: fileName,
                    updated_at: new Date().toISOString(),
                }).eq('id', userId)
            }

            stopCamera()
            onNext()
        } catch (err) {
            console.error('Upload exception:', err)
            setUploadError('Upload failed. You can proceed anyway.')
            stopCamera()
            onNext()
        } finally {
            setIsUploading(false)
        }
    }

    const displayError = cameraError || recorderError || uploadError

    return (
        <div className="space-y-6 animate-slide-up pb-28">
            {/* Header Section */}
            <section className="space-y-2 pl-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 tracking-tight flex items-center gap-2">
                    <Mic size={24} className="text-primary-500" />
                    Language Test
                </h1>

                {/* Mic Status Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit border transition-colors ${micActive ? 'bg-green-50 text-green-700 border-green-200 shadow-sm' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    <span className="relative flex h-2 w-2">
                        {micActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${micActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        {micActive ? 'Microphone Active' : 'Mic Inactive'}
                    </span>
                    {/* Integrated mini visualizer */}
                    <div className="ml-1 w-12 h-1 bg-gray-200/50 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-150" style={{ width: `${micLevel}%` }} />
                    </div>
                </div>
            </section>

            {/* Error Display */}
            {displayError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in shadow-sm">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700">{displayError}</p>
                        {cameraError && (
                            <button
                                onClick={startCamera}
                                className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
                            >
                                Try again
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Instructions & Question Section */}
            <section className="bg-primary-50/50 rounded-xl p-5 border border-primary-100/50 shadow-sm">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <div className="w-full">
                        <h3 className="font-bold text-gray-900 text-sm mb-1">Instructions</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Please answer the following question in English. Speak clearly and naturally.
                        </p>
                        
                        <div className="relative pl-4 py-3 bg-white rounded-lg border border-primary-100/60 shadow-sm">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-l-lg" />
                            <p className="text-gray-800 text-sm sm:text-base font-medium italic">
                                "Question 1: What aspects of language learning do you find most enjoyable, and why?"
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Preview Section */}
            <section className="space-y-2">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-200 aspect-video sm:aspect-[4/3] flex items-center justify-center isolate">
                    
                    <button className="absolute top-3 right-3 z-30 p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:bg-black/60 transition-colors">
                        <Settings size={18} />
                    </button>

                    {/* Recording timer badge */}
                    {isRecording && (
                        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 shadow-sm border border-white/10">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-mono font-semibold tracking-wide text-red-400">
                                Recording
                            </span>
                        </div>
                    )}

                    {/* Real Camera Feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        webkit-playsinline="true"
                        muted
                        className={`absolute inset-0 w-full h-full object-cover ${isReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 z-10`}
                        style={{ transform: 'scaleX(-1)' }}
                    />

                    {/* Fallback when camera not ready */}
                    {!isReady && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            {cameraError ? (
                                <div className="text-gray-400 flex flex-col items-center gap-3 bg-black/40 p-6 rounded-2xl backdrop-blur-sm">
                                    <VideoOff size={32} />
                                    <span className="text-sm font-medium">Camera unavailable</span>
                                </div>
                            ) : (
                                <div className="text-gray-400 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span className="text-sm font-medium">Starting camera...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Centered Overlays (Countdown, Uploading) */}
                    {isReady && isCountingDown && (
                        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                            <div className="w-24 h-24 rounded-full bg-primary-500/80 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl animate-bounce-subtle">
                                <span className="text-5xl font-bold text-white drop-shadow-md">{countdown}</span>
                            </div>
                        </div>
                    )}

                    {/* Uploading overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 z-40 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                            <Loader2 size={32} className="text-primary-400 animate-spin" />
                            <span className="text-white font-medium text-sm">Uploading recording...</span>
                        </div>
                    )}
                    
                    {/* Add a subtle gradient overlay at the bottom so it doesn't look cut off */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent z-20 pointer-events-none" />
                </div>
                <p className="text-center text-xs text-gray-500 font-medium">Video Preview: Position yourself in the center</p>
            </section>

            {/* Sticky Footer CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-50">
                <div className="max-w-xl mx-auto flex gap-3">
                    {!isRecording ? (
                        <button
                            onClick={handleStartNow}
                            disabled={isCountingDown || !isReady || isUploading}
                            className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base
                           rounded-xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2
                           transition-all duration-300 active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />
                            {isCountingDown ? `Starting in ${countdown}s...` : 'Start Language Test'}
                        </button>
                    ) : (
                        <button
                            onClick={handleFinishRecording}
                            className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-base
                           rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center gap-2
                           transition-all duration-300 active:scale-[0.98]"
                        >
                            <Mic size={18} fill="currentColor" />
                            Stop Recording & Submit
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LanguageTestRecording
