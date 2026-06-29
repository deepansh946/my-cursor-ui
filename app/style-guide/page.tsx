"use client";

import { useState } from "react";
import {
  Palette,
  Type,
  MousePointer,
  TextCursor,
  LayoutGrid,
  MessageSquare,
  Ruler,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Panel } from "../components/ui/Panel";
import { Spinner } from "../components/ui/Spinner";
import { Dialog } from "../components/ui/Dialog";

const NAV_ITEMS = [
  { id: "colors", label: "Colors", icon: Palette },
  { id: "typography", label: "Typography", icon: Type },
  { id: "buttons", label: "Buttons", icon: MousePointer },
  { id: "inputs", label: "Inputs", icon: TextCursor },
  { id: "panels", label: "Panels", icon: LayoutGrid },
  { id: "dialogs", label: "Dialogs", icon: MessageSquare },
  { id: "loading", label: "Loading", icon: Loader2 },
  { id: "tokens", label: "Tokens", icon: Ruler },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-foreground mb-6">{title}</h2>
  );
}

function ColorChip({
  label,
  hex,
  style,
}: {
  label: string;
  hex: string;
  style: React.CSSProperties;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-10 w-20 rounded-[var(--radius)] border border-border" style={style} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-[10px] font-data text-foreground-faint">{hex}</span>
    </div>
  );
}

export default function StyleGuidePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("colors");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="px-6 py-4">
          <h1 className="text-sm font-semibold tracking-tight text-foreground">Piper Style Guide</h1>
        </div>
      </header>

      <div className="flex">
        <nav className="sticky top-[53px] h-[calc(100vh-53px)] w-56 shrink-0 overflow-y-auto border-r border-border bg-surface p-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`flex w-full items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-surface-raised text-foreground"
                      : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-8 space-y-16 max-w-3xl">
          <section id="colors">
            <SectionHeader title="Colors" />
            <div className="flex flex-wrap gap-4">
              <ColorChip label="Background" hex="#09090b" style={{ background: "var(--bg)" }} />
              <ColorChip label="Surface" hex="#111113" style={{ background: "var(--surface)" }} />
              <ColorChip label="Surface raised" hex="#18181b" style={{ background: "var(--surface-raised)" }} />
              <ColorChip label="Foreground" hex="#fafafa" style={{ background: "var(--foreground)" }} />
              <ColorChip label="Muted" hex="#71717a" style={{ background: "var(--foreground-muted)" }} />
              <ColorChip label="Primary" hex="#fb923c" style={{ background: "var(--primary)" }} />
              <ColorChip label="Destructive" hex="#ef4444" style={{ background: "var(--destructive)" }} />
            </div>
          </section>

          <section id="typography">
            <SectionHeader title="Typography" />
            <div className="space-y-4">
              <p className="text-2xl font-semibold tracking-tight">Heading</p>
              <p className="text-sm text-foreground">Body — Fira Code 14px</p>
              <p className="text-xs text-muted-foreground">Muted label</p>
              <p className="font-data text-sm text-foreground-secondary">owner/repo — tabular nums</p>
            </div>
          </section>

          <section id="buttons">
            <SectionHeader title="Buttons" />
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" variant="outline">
                  <Plus size={14} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button disabled>
                  <Loader2 size={14} className="animate-spin" />
                  Loading
                </Button>
              </div>
            </div>
          </section>

          <section id="inputs">
            <SectionHeader title="Inputs" />
            <div className="max-w-sm space-y-4">
              <div>
                <Label className="block mb-1">Default</Label>
                <Input placeholder="Placeholder…" />
              </div>
              <div>
                <Label className="block mb-1">With icon</Label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input className="pl-8" placeholder="Search…" />
                </div>
              </div>
              <div>
                <Label className="block mb-1">Error</Label>
                <Input placeholder="Error" error />
              </div>
              <div>
                <Label className="block mb-1">Disabled</Label>
                <Input placeholder="Disabled" disabled />
              </div>
            </div>
          </section>

          <section id="panels">
            <SectionHeader title="Panels" />
            <Panel className="p-4">
              <p className="text-sm text-foreground">Flat bordered surface</p>
              <p className="text-xs text-muted-foreground mt-1">Borders-only depth</p>
            </Panel>
          </section>

          <section id="dialogs">
            <SectionHeader title="Dialogs" />
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} label="Example dialog">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium">Select repository</p>
                <p className="text-xs text-muted-foreground mt-1">Dialog shell pattern</p>
              </div>
              <div className="p-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
              </div>
            </Dialog>
          </section>

          <section id="loading">
            <SectionHeader title="Loading" />
            <Spinner />
          </section>

          <section id="tokens">
            <SectionHeader title="Tokens" />
            <div className="space-y-4 text-sm">
              <p>
                <span className="text-muted-foreground">Spacing:</span> 4 / 8 / 12 / 16 / 24px
              </p>
              <p>
                <span className="text-muted-foreground">Radius:</span> 4 / 6 / 8px
              </p>
              <p>
                <span className="text-muted-foreground">Transition:</span> 150ms cubic-bezier(0.25, 1, 0.5, 1)
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
