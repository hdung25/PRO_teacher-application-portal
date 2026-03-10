import { useState, useEffect, useCallback } from 'react'
import { Settings, Mic, Play, Video, VideoOff, Square, Loader2, AlertCircle, Camera } from 'lucide-react'
import { useCamera } from '../hooks/useCamera'
import { useMicrophone } from '../hooks/useMicrophone'
import { useRecorder } from '../hooks/useRecorder'
import { supabase } from '../lib/supabaseClient'

function DemoTeaching({ onNext, userId }) {
    const [countdown, setCountdown] = useState(5)
    const [isCountingDown, setIsCountingDown] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
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

    // Recording timer
    useEffect(() => {
        if (!isRecording) return
        const interval = setInterval(() => {
            setRecordingTime((t) => t + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [isRecording])

    // Handle upload when recording stops
    useEffect(() => {
        if (recordedBlob && !isRecording) {
            handleUpload(recordedBlob)
        }
    }, [recordedBlob, isRecording])

    const handleStartRecording = () => {
        if (!isCountingDown && !isRecording && isReady) {
            setCountdown(5)
            setIsCountingDown(true)
            setRecordingTime(0)
        }
    }

    const handleStopRecording = () => {
        stopRecording()
    }

    const handleUpload = async (blob) => {
        if (!userId) {
            stopCamera()
            onNext()
            return
        }

        setIsUploading(true)
        setUploadError('')

        try {
            const fileName = `${userId}/demo-teaching-${Date.now()}.webm`
            const { error: uploadErr } = await supabase.storage
                .from('recordings')
                .upload(fileName, blob, {
                    contentType: 'video/webm',
                    upsert: true,
                })

            if (uploadErr) {
                console.error('Upload error:', uploadErr)
                setUploadError('Failed to upload recording. You can proceed anyway.')
            } else {
                await supabase.from('teachers').update({
                    demo_teaching_url: fileName,
                    status: 'submitted',
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

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getTimerColor = () => {
        if (recordingTime >= 180 && recordingTime <= 300) return 'text-green-400'
        if (recordingTime > 300) return 'text-yellow-400'
        return 'text-white/80'
    }

    const displayError = cameraError || recorderError || uploadError

    return (
        <div className="space-y-5 animate-slide-up">
            {/* Instruction Card */}
            <div className="card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Video size={20} className="text-primary-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                        Demo Teaching
                    </h2>
                </div>

                <p className="text-gray-500 text-sm sm:text-base mb-5">
                    Please record a short demo lesson (3–5 minutes).
                </p>

                <div className="relative pl-5 py-4 mb-2">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full" />
                    <p className="text-gray-700 text-base sm:text-lg font-medium leading-relaxed">
                        Teach a simple English topic as if you are teaching a beginner student.
                    </p>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                        We want to evaluate your <span className="font-semibold text-gray-700">teaching style</span>,{' '}
                        <span className="font-semibold text-gray-700">clarity</span>, and{' '}
                        <span className="font-semibold text-gray-700">interaction</span>.
                    </p>
                </div>

                <div className="bg-primary-50/60 rounded-xl p-4 mt-4">
                    <p className="text-xs font-semibold text-primary-700 mb-2 uppercase tracking-wider">Tips for a great demo</p>
                    <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-sm text-primary-800/80">
                            <span className="mt-1 w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                            Choose a simple topic (greetings, colors, daily routines, etc.)
                        </li>
                        <li className="flex items-start gap-2 text-sm text-primary-800/80">
                            <span className="mt-1 w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                            Speak clearly and at a natural pace
                        </li>
                        <li className="flex items-start gap-2 text-sm text-primary-800/80">
                            <span className="mt-1 w-1.5 h-1.5 bg-primary-400 rounded-full flex-shrink-0" />
                            Engage as if a real student is listening
                        </li>
                    </ul>
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
                <button className="absolute top-4 left-4 z-20 w-10 h-10 bg-gray-700/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600/80 transition-all duration-300">
                    <Settings size={20} />
                </button>

                {/* Recording timer badge */}
                {isRecording && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-gray-900/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        <span className={`text-sm font-mono font-semibold ${getTimerColor()}`}>
                            {formatTime(recordingTime)}
                        </span>
                    </div>
                )}

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

                    {/* Countdown / Recording Status */}
                    {isReady && (
                        <div className="relative z-10 text-center">
                            {isRecording ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-red-400 font-semibold text-sm tracking-wide uppercase">
                                            Recording Demo Lesson
                                        </span>
                                    </div>
                                    <p className="text-white/80 text-sm bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
                                        Teach your lesson naturally. Aim for 3–5 minutes.
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
                            ) : (
                                <p className="text-white/70 text-sm font-medium bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5">
                                    Press "Start Demo Recording" when you're ready
                                </p>
                            )}
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

                        {!isRecording ? (
                            <button
                                onClick={handleStartRecording}
                                disabled={isCountingDown || !isReady || isUploading}
                                className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base
                           rounded-2xl shadow-btn flex items-center justify-center gap-2
                           transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg
                           active:translate-y-0
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                <Play size={18} fill="white" />
                                {isCountingDown ? `Starting in ${countdown}s...` : 'Start Demo Recording'}
                            </button>
                        ) : (
                            <button
                                onClick={handleStopRecording}
                                className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-base
                           rounded-2xl shadow-lg flex items-center justify-center gap-2
                           transition-all duration-300 hover:-translate-y-0.5
                           active:translate-y-0"
                            >
                                <Square size={16} fill="white" />
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

export default DemoTeaching
