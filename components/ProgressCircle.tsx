export function ProgressCirlce({ progress, icon, className }: { progress: number, icon: React.ReactNode, className?: string }) {
    return (
        <div className={`relative w-12 h-12 ${className}`}>
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-zinc-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className=""
                    strokeWidth="8"
                    strokeDasharray={283}
                    strokeDashoffset={283 * (1 - progress)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {icon}
            </div>
        </div>
    )
}