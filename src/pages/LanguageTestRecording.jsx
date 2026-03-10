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
        <div className="space-y-5 animate-slide-up">
            {/* Question Card */}
            <div className="card p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">
                    English Language Test
                </h2>
                <p className="text-gray-500 text-sm sm:text-base mb-6">
                    Please answer the following question in English:
                </p>

                {/* Question Block */}
                <div className="relative pl-5 py-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full" />
                    <p className="text-gray-700 text-base sm:text-lg font-medium italic leading-relaxed">
                        "Question 1: What aspects of language learning do you find most enjoyable, and why?"
                    </p>
                </div>
            </div>

            {/* Error Display */}
            {displayError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in">
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

            {/* Camera Preview Card */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl relative">
                {/* Settings icon */}
                <button className="absolute top-4 left-4 z-20 w-10 h-10 bg-gray-700/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600/80 transition-all duration-300">
                    <Settings size={20} />
                </button>

                {/* Camera Preview Area */}
                <div className="relative aspect-video sm:aspect-[16/10] flex items-center justify-center">
                    {/* Real Camera Feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`absolute inset-0 w-full h-full object-cover ${isReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
                        style={{ transform: 'scaleX(-1)' }}
                    />

                    {/* Fallback when camera not ready */}
                    {!isReady && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            {cameraError ? (
                                <div className="text-gray-500 flex flex-col items-center gap-3">
                                    <VideoOff size={32} />
                                    <span className="text-sm font-medium">Camera unavailable</span>
                                    <button
                                        onClick={startCamera}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                                    >
                                        <Camera size={16} />
                                        Enable Camera
                                    </button>
                                </div>
                            ) : (
                                <div className="text-gray-500 flex items-center gap-2">
                                    <Loader2 size={20} className="animate-spin" />
                                    <span className="text-sm font-medium">Starting camera...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Countdown / Recording Status overlay */}
                    {isReady && (
                        <div className="relative z-10 text-center">
                            {isRecording ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-red-400 font-semibold text-sm tracking-wide uppercase">
                                            Recording
                                        </span>
                                    </div>
                                    <p className="text-white/80 text-sm bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
                                        Answer the question clearly and naturally.
                                    </p>
                                </div>
                            ) : isCountingDown ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-20 h-20 rounded-full bg-primary-500/30 backdrop-blur-sm border-2 border-primary-400 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">{countdown}</span>
                                    </div>
                                    <p className="text-white/80 text-sm font-medium bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
                                        Recording starts in {countdown}s...
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Uploading overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 z-30 bg-gray-900/80 flex flex-col items-center justify-center gap-3">
                            <Loader2 size={32} className="text-primary-400 animate-spin" />
                            <span className="text-white font-medium text-sm">Uploading recording...</span>
                        </div>
                    )}

                    {/* Bottom overlay with mic + controls */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-gradient-to-t from-gray-900/90 to-transparent z-20">
                        {/* Mic icon + level */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${micActive ? 'bg-green-600/60' : 'bg-gray-700/60'}`}>
                                <Mic size={16} className={micActive ? 'text-green-300' : 'text-gray-300'} />
                            </div>
                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-150"
                                    style={{ width: `${micLevel}%` }}
                                />
                            </div>
                        </div>

                        {/* Start Now Button */}
                        {!isRecording ? (
                            <button
                                onClick={handleStartNow}
                                disabled={isCountingDown || !isReady || isUploading}
                                className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base
                           rounded-2xl shadow-btn flex items-center justify-center gap-2
                           transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
                           active:translate-y-0
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <Play size={18} fill="white" />
                                {isCountingDown ? `Starting in ${countdown}s...` : 'Start now'}
                            </button>
                        ) : (
                            <button
                                onClick={handleFinishRecording}
                                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-base
                           rounded-2xl shadow-lg flex items-center justify-center gap-2
                           transition-all duration-300 hover:-translate-y-0.5
                           active:translate-y-0"
                            >
                                Stop Recording & Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Microphone Status Bar */}
            <div className="card px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${micActive ? 'bg-green-500 animate-pulse shadow-sm shadow-green-300' : 'bg-gray-300'}`} />
                        <span className="text-sm font-medium text-gray-700">
                            {micActive ? 'Microphone active' : 'Microphone inactive'}
                        </span>
                    </div>
                </div>
                <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 rounded-full transition-all duration-150"
                        style={{ width: `${micLevel}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

export default LanguageTestRecording
