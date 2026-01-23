import { cn } from "../../lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

export function GlassCard({ 
  children, 
  className, 
  hover = false,
  padding = "md" 
}: GlassCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-lg transition-all duration-300",
        paddingClasses[padding],
        hover && "hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  )
}