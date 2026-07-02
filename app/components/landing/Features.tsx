import {
  FolderGit2,
  FileSearch,
  Terminal,
  GitPullRequest,
  Radio,
  Gauge,
} from "lucide-react";
import { Panel } from "../ui/Panel";

const features = [
  {
    icon: FolderGit2,
    title: "Repo-aware",
    description:
      "Clone and work inside bound GitHub repos without leaving the chat.",
  },
  {
    icon: FileSearch,
    title: "Code navigation",
    description:
      "Indexer plus read/write files — never guess paths or hallucinate structure.",
  },
  {
    icon: Terminal,
    title: "Terminal",
    description:
      "Run shell commands in the workspace to inspect, build, and test.",
  },
  {
    icon: GitPullRequest,
    title: "Git workflow",
    description:
      "Commit changes and open pull requests when you explicitly ask.",
  },
  {
    icon: Radio,
    title: "Streaming chat",
    description:
      "Real-time SSE responses as Piper thinks, tools run, and replies stream in.",
  },
  {
    icon: Gauge,
    title: "Token usage",
    description:
      "Per-request input, output, and total token counts for every turn.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border">
      <div className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Features
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Everything Piper can do today — grounded in tools, not guesses.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Panel key={title} className="p-4 flex flex-col gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border bg-surface-raised text-primary">
              <Icon size={16} strokeWidth={1.75} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </section>
  );
}
