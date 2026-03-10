import { useState, useEffect, useRef } from 'react'
import { Mail, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function EmailConfirmation({ onNext }) {
    const [isVerified, setIsVerified] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [userEmail, setUserEmail] = useState('')
    const [error, setError] = useState('')
    const pollRef = useRef(null)

    // Get current user email
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                setUserEmail(user.email)
                if (user.email_confirmed_at) {
                    setIsVerified(true)
                }
            }
        }
        getUser()
    }, [])

    // Poll for email verification every 5 seconds
    useEffect(() => {
        if (isVerified) return

        const checkVerification = async () => {
            setIsChecking(true)
            try {
                // Refresh the session to get updated user data
                const { data: { user }, error } = await supabase.auth.getUser()
                if (error) {
                    console.error('Verification check error:', error)
                    return
                }
                if (user?.email_confirmed_at) {
                    setIsVerified(true)
                    // Update the teachers table
                    await supabase.from('teachers').update({ email_verified: true }).eq('id', user.id)
                }
            } catch (err) {
                console.error('Poll error:', err)
            } finally {
                setIsChecking(false)
            }
        }

        // Check immediately
        checkVerification()

        // Then poll every 5 seconds
        pollRef.current = setInterval(checkVerification, 5000)

        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [isVerified])

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendCooldown])

    const handleResend = async () => {
        if (resendCooldown > 0 || isResending) return

        setIsResending(true)
        setError('')

        try {
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: userEmail,
            })

            if (resendError) {
                setError(resendError.message)
            } else {
                setResendCooldown(60) // 60 second cooldown
            }
        } catch (err) {
            setError('Failed to resend email. Please try again.')
        } finally {
            setIsResending(false)
        }
    }

    const handleContinue = () => {
        if (isVerified) {
            onNext()
        }
    }

    return (
        <div className="card p-8 max-w-lg mx-auto text-center animate-fade-in">
            {isVerified ? (
                /* Verified State */
                <div className="animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        Email Verified!
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Your email has been confirmed successfully. You can now proceed to the next step.
                    </p>
                    <button className="btn-primary" onClick={handleContinue}>
                        Continue to Language Test
                    </button>
                </div>
            ) : (
                /* Waiting for Verification */
                <div>
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={36} className="text-primary-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        Check Your Email
                    </h2>
                    <p className="text-gray-500 mb-2">
                        We've sent a confirmation link to:
                    </p>
                    <p className="text-primary-600 font-semibold text-lg mb-6">
                        {userEmail || 'your email address'}
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Click the link in the email to verify your account.
                            If you don't see it, check your <span className="font-semibold">spam folder</span>.
                        </p>
                    </div>

                    {/* Checking indicator */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
                        {isChecking ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                        )}
                        <span>Waiting for email verification...</span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {/* Resend Button */}
                    <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || isResending}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary-600 
                           bg-primary-50 hover:bg-primary-100 rounded-xl transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
                        {isResending
                            ? 'Sending...'
                            : resendCooldown > 0
                                ? `Resend in ${resendCooldown}s`
                                : 'Resend confirmation email'
                        }
                    </button>
                </div>
            )}
        </div>
    )
}

export default EmailConfirmation
