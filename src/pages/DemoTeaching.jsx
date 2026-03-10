import { useState, useEffect, useRef } from 'react'
import { Settings, Mic, Play, Video, VideoOff, Square } from 'lucide-react'

function DemoTeaching({ onNext }) {
    const [countdown, setCountdown] = useState(5)
    const [isCountingDown, setIsCountingDown] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [micLevel, setMicLevel] = useState(30)
    const micIntervalRef = useRef(null)
    const recordingTimerRef = useRef(null)

    // Simulated mic level animation
    useEffect(() => {
        micIntervalRef.current = setInterval(() => {
            setMicLevel(Math.floor(Math.random() * 40) + 15)
        }, 300)
        return () => clearInterval(micIntervalRef.current)
    }, [])

    // Countdown logic
    useEffect(() => {
        if (!isCountingDown) return
        if (countdown <= 0) {
            setIsRecording(true)
            setIsCountingDown(false)
            return
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [isCountingDown, countdown])

    // Recording timer
    useEffect(() => {
        if (!isRecording) return
        recordingTimerRef.current = setInterval(() => {
            setRecordingTime((t) => t + 1)
        }, 1000)
        return () => clearInterval(recordingTimerRef.current)
    }, [isRecording])

    const handleStartRecording = () => {
        if (!isCountingDown && !isRecording) {
            setIsCountingDown(true)
        }
    }

    const handleStopRecording = () => {
        setIsRecording(false)
        clearInterval(recordingTimerRef.current)
        onNext()
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getTimerColor = () => {
        if (recordingTime >= 180 && recordingTime <= 300) return 'text-green-400' // 3-5 min sweet spot
        if (recordingTime > 300) return 'text-yellow-400' // over 5 min
        return 'text-white/80' // under 3 min
    }

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

                {/* Instruction Block */}
                <div className="relative pl-5 py-4 mb-2">
                    {/* Blue left border */}
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

                {/* Tips */}
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

            {/* Camera Preview Card */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl relative">
                {/* Settings icon */}
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
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="w-full h-full" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                        }} />
                    </div>

                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-gray-600/30 flex items-center gap-2">
                            <VideoOff size={28} />
                            <span className="text-sm font-medium tracking-wide">Camera Feed Placeholder</span>
                        </div>
                    </div>

                    {/* Countdown / Recording Status */}
                    <div className="relative z-10 text-center">
                        {isRecording ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-red-400 font-semibold text-sm tracking-wide uppercase">
                                        Recording Demo Lesson
                                    </span>
                                </div>
                                <p className="text-white/70 text-sm">
                                    Teach your lesson naturally. Aim for 3–5 minutes.
                                </p>
                            </div>
                        ) : isCountingDown ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-20 h-20 rounded-full bg-primary-500/20 border-2 border-primary-400 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">{countdown}</span>
                                </div>
                                <p className="text-white/80 text-sm font-medium">
                                    Recording starts in {countdown}s...
                                </p>
                            </div>
                        ) : (
                            <p className="text-white/70 text-sm font-medium">
                                Press "Start Demo Recording" when you're ready
                            </p>
                        )}
                    </div>

                    {/* Bottom overlay with mic + controls */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8 bg-gradient-to-t from-gray-900/90 to-transparent">
                        {/* Mic icon + level */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gray-700/60 rounded-lg flex items-center justify-center">
                                <Mic size={16} className="text-gray-300" />
                            </div>
                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-200"
                                    style={{ width: `${micLevel}%` }}
                                />
                            </div>
                        </div>

                        {/* Start / Stop Button */}
                        {!isRecording ? (
                            <button
                                onClick={handleStartRecording}
                                disabled={isCountingDown}
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
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-300" />
                        <span className="text-sm font-medium text-gray-700">Microphone active</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 tracking-wider">
                            DB LEVEL: <span className="text-gray-600 font-semibold">{micLevel}</span>
                        </span>
                    </div>
                </div>
                <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full transition-all duration-200"
                        style={{ width: `${micLevel}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

export default DemoTeaching
