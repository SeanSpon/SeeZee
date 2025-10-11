export default function ActivityList({ items }: { items: { id: number; who: string; text: string; ago: string }[] }) {
  return (
    <div className="backdrop-blur-xl bg-white/[0.08] border border-white/10 rounded-2xl p-8 shadow-2xl h-full flex flex-col">
      <h3 className="text-xl font-medium mb-6 text-white">Recent Activity</h3>
      <div className="flex-1 overflow-y-auto space-y-4">
        {items.length > 0 ? (
          items.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {a.who.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/90">
                  <span className="font-medium text-white">{a.who}</span> {a.text}
                </p>
                <p className="text-xs text-white/50 mt-1">{a.ago}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-white/60">
                <p className="font-medium">No Recent Activity</p>
                <p className="text-sm">Activity will appear here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}