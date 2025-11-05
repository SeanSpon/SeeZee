/**
 * ProjectCard - Premium project card component
 * Used in Overview and Projects list
 */

import Link from "next/link";
import { StatusPill } from "./StatusPill";
import { ProgressBar } from "./ProgressBar";

export function ProjectCard({
  id,
  name,
  status,
  percent,
  eta,
  repoName,
}: {
  id: string;
  name: string;
  status: string;
  percent: number;
  eta?: string;
  repoName?: string;
}) {
  return (
    <Link href={`/client/projects/${id}`} className="block">
      <div className="card hover:bg-white/7 hover-glow smooth-transition buttery-tap">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="text-base md:text-lg font-semibold tracking-tight text-white truncate">
              {name}
            </div>
            <div className="text-xs subtle truncate mt-0.5">
              {repoName ?? "—"}
            </div>
          </div>
          <div className="ml-3 flex-shrink-0">
            <StatusPill status={status} />
          </div>
        </div>
        <ProgressBar percent={percent} eta={eta} />
      </div>
    </Link>
  );
}
