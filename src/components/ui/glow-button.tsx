import { cn } from "../../lib/utils"

interface GlowButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function GlowButton({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button'
}: GlowButtonProps) {
  const baseClasses = "relative font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 focus:ring-blue-500",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:shadow-lg focus:ring-white/50"
  }
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  )
}