import Link from "next/link";
import { NAV_GROUPS } from "@/lib/admin/nav-data";
export default function WorkspacePage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-red-400">
          SeeZee workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Everything has a place.</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Start with the submission inbox, qualify a lead, create a project,
          assign delivery work, then invoice. Use this directory whenever you
          need to find a tool.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "01",
            "Review",
            "Read client submissions and qualify leads.",
            "/admin/requests",
          ],
          [
            "02",
            "Plan",
            "Approve the lead and prepare a project quote.",
            "/admin/projects",
          ],
          [
            "03",
            "Deliver",
            "Assign tasks, collect content and log hours.",
            "/admin/tasks",
          ],
          [
            "04",
            "Bill",
            "Send invoices and track payments.",
            "/admin/invoices",
          ],
        ].map(([number, title, description, href]) => (
          <Link
            key={number}
            href={href}
            className="rounded-xl border border-white/10 bg-slate-900 p-5 transition hover:border-red-400/40"
          >
            <span className="text-xs text-red-400">{number}</span>
            <h2 className="mt-2 font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {NAV_GROUPS.filter((group) => group.id !== "command").map((group) => (
          <section
            key={group.id}
            className="rounded-xl border border-white/10 bg-slate-900/60 p-5"
          >
            <h2 className="mb-4 text-lg font-semibold">{group.title}</h2>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg p-3 transition hover:bg-white/5"
                  >
                    <span className="text-sm font-medium">{item.label} →</span>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
