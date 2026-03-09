import { Menu, Globe } from 'lucide-react'

function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                {/* Menu icon */}
                <button
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    aria-label="Menu"
                >
                    <Menu size={20} />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-xs">123</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">
                        <span className="text-primary-600">123</span>
                        <span className="text-gray-800"> ENGLISH</span>
                    </h1>
                </div>

                {/* Globe icon */}
                <button
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    aria-label="Language"
                >
                    <Globe size={20} />
                </button>
            </div>
        </header>
    )
}

export default Header
