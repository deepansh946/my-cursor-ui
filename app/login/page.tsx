"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <p
            className="text-xs font-semibold tracking-[0.25em] uppercase mb-2"
            style={{ color: "var(--accent)" }}
          >
            Piper
          </p>
          <h1 className="text-lg font-medium" style={{ color: "var(--text)" }}>
            Sign in to continue
          </h1>
          <p className="text-xs mt-2" style={{ color: "var(--text-dim)" }}>
            Coding assistant — GitHub only
          </p>
        </div>
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full py-3 px-4 text-xs font-medium tracking-wider uppercase rounded-lg transition-opacity hover:opacity-90"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            border: "1px solid var(--accent)",
          }}
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
