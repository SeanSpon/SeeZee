interface TimelineEvent {
  id: string;
  kind: string;
  title: string;
  description?: string | null;
  createdAt: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
        <p className="text-slate-400">No recent activity</p>
      </div>
    );
  }

  const getIcon = (kind: string) => {
    switch (kind) {
      case "commit":
        return "💻";
      case "milestone":
        return "🎯";
      case "deploy":
        return "🚀";
      case "release":
        return "📦";
      default:
        return "📝";
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-lg">
                {getIcon(event.kind)}
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-full bg-slate-700 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-semibold">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-slate-400 mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(event.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
