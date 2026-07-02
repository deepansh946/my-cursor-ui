import { LandingNav } from "./components/landing/LandingNav";
import { Hero } from "./components/landing/Hero";
import { Features } from "./components/landing/Features";
import { DemoVideo } from "./components/landing/DemoVideo";
import { GetStartedCta } from "./components/landing/GetStartedCta";

const btnLg =
  "inline-flex items-center justify-center font-medium rounded-[var(--radius)] transition-[background,color,opacity] duration-150 h-10 px-4 text-sm gap-2";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <Features />
        <DemoVideo />
        <section className="mx-auto max-w-5xl px-6 py-16 border-t border-border">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Ready to try Piper?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Connect GitHub and start chatting with your codebase in minutes.
            </p>
            <GetStartedCta
              className={`${btnLg} bg-primary text-background border border-primary hover:bg-[var(--primary-hover)]`}
            />
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          Piper — AI coding assistant
        </p>
      </footer>
    </div>
  );
}
