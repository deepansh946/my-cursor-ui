"use client";

import { signIn } from "next-auth/react";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <Panel className="w-full max-w-sm p-6 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-sm font-semibold tracking-tight text-foreground">Piper</h1>
          <p className="text-sm text-foreground-secondary">Sign in to continue</p>
          <p className="text-xs text-muted-foreground">GitHub authentication required</p>
        </div>
        <Button
          variant="default"
          size="lg"
          className="w-full"
          onClick={() => signIn("github", { callbackUrl: "/chat" })}
        >
          Continue with GitHub
        </Button>
      </Panel>
    </div>
  );
}
