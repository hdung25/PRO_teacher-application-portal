import { useState } from 'react'
import { Eye, EyeOff, ChevronDown, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const COUNTRIES = [
    'Vietnam', 'United States', 'United Kingdom', 'Canada', 'Australia',
    'Philippines', 'South Africa', 'India', 'Japan', 'South Korea',
    'Thailand', 'Malaysia', 'Singapore', 'Indonesia', 'Germany',
    'France', 'Brazil', 'Mexico', 'Nigeria', 'Kenya',
]

const NATIONALITIES = [
    'Vietnamese', 'American', 'British', 'Canadian', 'Australian',
    'Filipino', 'South African', 'Indian', 'Japanese', 'Korean',
    'Thai', 'Malaysian', 'Singaporean', 'Indonesian', 'German',
    'French', 'Brazilian', 'Mexican', 'Nigerian', 'Kenyan',
]

function ApplicationForm({ onNext }) {
    const [formData, setFormData] = useState({
        country: '',
        nationality: '',
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }))
        }
        if (submitError) setSubmitError('')
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.country) newErrors.country = 'Please select your country'
        if (!formData.nationality) newErrors.nationality = 'Please select your nationality'
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        }
        if (!agreed) newErrors.agreed = 'You must agree to the terms'
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)
        setSubmitError('')

        try {
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            })

            if (authError) {
                if (authError.message.includes('already registered')) {
                    setSubmitError('This email is already registered. Please log in or use a different email.')
                } else {
                    setSubmitError(authError.message)
                }
                setIsSubmitting(false)
                return
            }

            const userId = authData.user?.id
            if (!userId) {
                setSubmitError('Registration failed. Please try again.')
                setIsSubmitting(false)
                return
            }

            // Save pending profile to localStorage to insert AFTER email confirmation
            localStorage.setItem('pendingApplication', JSON.stringify({
                id: userId,
                first_name: formData.firstName.trim(),
                middle_name: formData.middleName.trim() || null,
                last_name: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                country: formData.country,
                nationality: formData.nationality,
            }))

            onNext()
        } catch (err) {
            setSubmitError('An unexpected error occurred. Please try again.')
            console.error('Submit error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="animate-slide-up">
            <div className="card p-6 sm:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        Application
                    </h2>
                    <p className="mt-2 text-gray-500 text-sm sm:text-base">
                        Please provide your details to start your journey as a tutor.
                    </p>
                </div>

                {/* Global Submit Error */}
                {submitError && (
                    <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Country of Residence */}
                    <div>
                        <label htmlFor="country" className="label-text">
                            Country of Residence
                        </label>
                        <div className="relative">
                            <select
                                id="country"
                                value={formData.country}
                                onChange={handleChange('country')}
                                disabled={isSubmitting}
                                className={`select-field ${errors.country ? 'border-red-400 focus:ring-red-300' : ''} ${formData.country ? 'text-gray-800' : ''}`}
                            >
                                <option value="">Select country</option>
                                {COUNTRIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronDown
                                size={18}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                        {errors.country && (
                            <p className="mt-1.5 text-xs text-red-500 animate-fade-in">{errors.country}</p>
                        )}
                    </div>

                    {/* Nationality */}
                    <div>
                        <label htmlFor="nationality" className="label-text">
                            Nationality
                        </label>
                        <div className="relative">
                            <select
                                id="nationality"
                                value={formData.nationality}
                                onChange={handleChange('nationality')}
                                disabled={isSubmitting}
                                className={`select-field ${errors.nationality ? 'border-red-400 focus:ring-red-300' : ''} ${formData.nationality ? 'text-gray-800' : ''}`}
                            >
                                <option value="">Select nationality</option>
                                {NATIONALITIES.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                            <ChevronDown
                                size={18}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                        </div>
                        {errors.nationality && (
                            <p className="mt-1.5 text-xs text-red-500 animate-fade-in">{errors.nationality}</p>
                        )}
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="label-text">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={handleChange('firstName')}
                                disabled={isSubmitting}
                                className={`input-field ${errors.firstName ? 'border-red-400 focus:ring-red-300' : ''}`}
                            />
                            {errors.firstName && (
                                <p className="mt-1.5 text-xs text-red-500 animate-fade-in">{errors.firstName}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="middleName" className="label-text">
                                Middle Name
                            </label>
                            <input
                                id="middleName"
                                type="text"
                                placeholder="Optional"
                                value={formData.middleName}
                                onChange={handleChange('middleName')}
                                disabled={isSubmitting}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastName" className="label-text">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            placeholder="Enter last name"
                            value={formData.lastName}
                            onChange={handleChange('lastName')}
                            disabled={isSubmitting}
                            className={`input-field ${errors.lastName ? 'border-red-400 focus:ring-red-300' : ''}`}
                        />
                        {errors.lastName && (
                            <p className="mt-1.5 text-xs text-red-500 animate-fade-in">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="label-text">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange('email')}
                            disabled={isSubmitting}
                            className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
                        />
                        {errors.email && (
                            <p className="mt-1.5 text-xs text-red-500 animate-fade-in">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="label-text">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={handleChange('password')}
                                disabled={isSubmitting}
                                className={`input-field pr-12 ${errors.password ? 'border-red-400 focus:ring-red-300' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1.5 text-xs text-red-500 animate-fade-in">{errors.password}</p>
                        )}
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3 pt-1">
                        <div className="relative mt-0.5">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => {
                                    setAgreed(e.target.checked)
                                    if (errors.agreed) setErrors((prev) => ({ ...prev, agreed: '' }))
                                }}
                                disabled={isSubmitting}
                                className="w-5 h-5 rounded-md border-gray-300 text-primary-600 
                           focus:ring-2 focus:ring-primary-400/50 cursor-pointer
                           transition-colors duration-200"
                            />
                        </div>
                        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                            I agree to the{' '}
                            <a href="#" className="text-primary-600 font-medium hover:text-primary-700 hover:underline transition-colors duration-200">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-primary-600 font-medium hover:text-primary-700 hover:underline transition-colors duration-200">
                                Privacy Policy
                            </a>.
                        </label>
                    </div>
                    {errors.agreed && (
                        <p className="text-xs text-red-500 animate-fade-in -mt-2">{errors.agreed}</p>
                    )}

                    {/* Submit Button */}
                    <div className="pt-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary text-base flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Continue to Video Test'
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Links */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <a
                        href="#"
                        className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors duration-200"
                    >
                        Log in
                    </a>
                </p>
            </div>
        </div>
    )
}

export default ApplicationForm
