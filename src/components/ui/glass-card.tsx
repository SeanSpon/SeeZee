import { cn } from "../../lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-lg",
        hover && "transition-all duration-300 hover:bg-white/20 hover:shadow-xl hover:scale-105",
        className
      )}
    >
      {children}
    </div>
  )
}