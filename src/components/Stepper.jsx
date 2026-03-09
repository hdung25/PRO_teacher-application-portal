import { Check } from 'lucide-react'

function Stepper({ steps, currentStep, onStepClick }) {
    return (
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100 py-4 px-4">
            <div className="max-w-md mx-auto">
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
                        const isCompleted = currentStep > step.id
                        const isActive = currentStep === step.id
                        const isFuture = currentStep < step.id

                        return (
                            <button
                                key={step.id}
                                onClick={() => onStepClick(step.id)}
                                className="flex flex-col items-center relative z-10 group"
                            >
                                {/* Circle */}
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300 ease-in-out border-2
                    ${isCompleted
                                            ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-200'
                                            : isActive
                                                ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-300 scale-110'
                                                : 'bg-white border-gray-300 text-gray-400'
                                        }
                    ${!isFuture ? 'cursor-pointer' : 'cursor-default'}
                    group-hover:${!isFuture ? 'scale-110' : ''}
                  `}
                                >
                                    {isCompleted ? <Check size={18} strokeWidth={3} /> : step.id}
                                </div>

                                {/* Label */}
                                <span
                                    className={`
                    mt-2 text-xs font-medium transition-colors duration-300
                    ${isActive
                                            ? 'text-primary-600 font-semibold'
                                            : isCompleted
                                                ? 'text-primary-500'
                                                : 'text-gray-400'
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
