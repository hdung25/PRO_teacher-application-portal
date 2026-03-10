import { useState, useEffect, useCallback } from 'react'
import Stepper from './components/Stepper'
import Header from './components/Header'
import ApplicationForm from './pages/ApplicationForm'
import EmailConfirmation from './pages/EmailConfirmation'
import LanguageTestRecording from './pages/LanguageTestRecording'
import DemoTeaching from './pages/DemoTeaching'
import { supabase } from './lib/supabaseClient'

const STEPS = [
    { id: 1, label: 'Registration', shortLabel: 'Register' },
    { id: 2, label: 'Video Test', shortLabel: 'Video' },
    { id: 3, label: 'Language', shortLabel: 'Language' },
    { id: 4, label: 'Demo Teaching', shortLabel: 'Demo' },
    { id: 5, label: 'Done!', shortLabel: 'Done' },
]

function App() {
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState(new Set())
    const [userId, setUserId] = useState(null)

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUserId(session.user.id)
            }
        }
        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleNext = useCallback(() => {
        setCompletedSteps((prev) => new Set([...prev, currentStep]))
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }, [currentStep])

    const handleBack = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }, [])

    const goToStep = useCallback((step) => {
        if (completedSteps.has(step) || step === currentStep) {
            setCurrentStep(step)
        }
    }, [completedSteps, currentStep])

    const renderPage = () => {
        switch (currentStep) {
            case 1:
                return <ApplicationForm onNext={handleNext} />
            case 2:
                return <EmailConfirmation onNext={handleNext} />
            case 3:
                return <LanguageTestRecording onNext={handleNext} onBack={handleBack} userId={userId} />
            case 4:
                return <DemoTeaching onNext={handleNext} userId={userId} />
            case 5:
                return (
                    <div className="card p-8 max-w-lg mx-auto text-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Application Complete!</h2>
                        <p className="text-gray-500">Thank you for applying. We will review your application and get back to you soon.</p>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <Stepper steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />
            <main className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-2xl">
                    {renderPage()}
                </div>
            </main>
            <footer className="py-6 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} 123 ENGLISH. All rights reserved.
            </footer>
        </div>
    )
}

export default App
