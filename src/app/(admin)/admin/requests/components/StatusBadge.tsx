export default function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    pending: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
    "in progress": "bg-blue-400/20 text-blue-300 border-blue-400/30",
    review: "bg-purple-400/20 text-purple-300 border-purple-400/30",
    delivered: "bg-green-400/20 text-green-300 border-green-400/30",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full capitalize border ${colors[status] || "bg-white/10 text-white/70 border-white/20"}`}>
      {status}
    </span>
  );
}