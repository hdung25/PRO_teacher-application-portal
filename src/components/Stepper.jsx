import { Check, Lock } from 'lucide-react'

function Stepper({ steps, currentStep, completedSteps = new Set(), onStepClick }) {
    return (
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100 py-4 px-4">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between relative">
                    {/* Connecting line (background) */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 mx-8" />

                    {/* Completed line overlay */}
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-primary-500 mx-8 transition-all duration-500 ease-in-out"
                        style={{
                            width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}%`,
                            maxWidth: 'calc(100% - 4rem)',
                        }}
                    />

                    {steps.map((step) => {
                        const isCompleted = completedSteps.has(step.id)
                        const isActive = currentStep === step.id
                        const isAccessible = isCompleted || isActive
                        const isFuture = !isAccessible

                        return (
                            <button
                                key={step.id}
                                onClick={() => isAccessible && onStepClick(step.id)}
                                disabled={isFuture}
                                className={`flex flex-col items-center relative z-10 group ${isFuture ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {/* Circle */}
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300 ease-in-out border-2
                    ${isCompleted && !isActive
                                            ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-200'
                                            : isActive
                                                ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-300 scale-110'
                                                : 'bg-gray-100 border-gray-200 text-gray-300'
                                        }
                    ${isAccessible ? 'group-hover:scale-110' : ''}
                  `}
                                >
                                    {isCompleted && !isActive ? (
                                        <Check size={18} strokeWidth={3} />
                                    ) : isFuture ? (
                                        <Lock size={14} strokeWidth={2.5} />
                                    ) : (
                                        step.id
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`
                    mt-2 text-xs font-medium transition-colors duration-300
                    ${isActive
                                            ? 'text-primary-600 font-semibold'
                                            : isCompleted
                                                ? 'text-primary-500'
                                                : 'text-gray-300'
                                        }
                  `}
                                >
                                    {step.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Stepper
