import { useState, useEffect, useRef } from 'react'
import { Settings, Mic, Play, Video, VideoOff } from 'lucide-react'

function LanguageTestRecording({ onNext }) {
    const [countdown, setCountdown] = useState(5)
    const [isCountingDown, setIsCountingDown] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [micLevel, setMicLevel] = useState(30)
    const micIntervalRef = useRef(null)

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

    const handleStartNow = () => {
        if (!isCountingDown && !isRecording) {
            setIsCountingDown(true)
        }
    }

    const handleFinishRecording = () => {
        setIsRecording(false)
        onNext()
    }

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
                    {/* Blue left border */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full" />
                    <p className="text-gray-700 text-base sm:text-lg font-medium italic leading-relaxed">
                        "Question 1: What aspects of language learning do you find most enjoyable, and why?"
                    </p>
                </div>
            </div>

            {/* Camera Preview Card */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl relative">
                {/* Settings icon */}
                <button className="absolute top-4 left-4 z-20 w-10 h-10 bg-gray-700/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600/80 transition-all duration-300">
                    <Settings size={20} />
                </button>

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
                                        Recording
                                    </span>
                                </div>
                                <p className="text-white/70 text-sm">
                                    Answer the question clearly and naturally.
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
                                The recording will start in {countdown} seconds
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

                        {/* Start Now Button */}
                        {!isRecording ? (
                            <button
                                onClick={handleStartNow}
                                disabled={isCountingDown}
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

export default LanguageTestRecording
