import Link from "next/link";

export default function PanelCard({ title, desc, href, footer }: { title: string; desc: string; href: string; footer?: string }) {
  return (
    <Link 
      href={href} 
      className="group backdrop-blur-xl bg-white/[0.08] border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/[0.12] hover:shadow-[0_0_40px_rgba(124,92,255,0.15)] transition-all duration-300 block h-32 flex flex-col justify-between"
    >
      <div className="space-y-2">
        <h4 className="text-white font-medium text-lg group-hover:text-white/90 transition-colors">{title}</h4>
        <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
      </div>
      {footer && (
        <div className="text-xs text-white/40 font-medium uppercase tracking-wide">{footer}</div>
      )}
    </Link>
  );
}