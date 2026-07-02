"use client";

import { repoSlug } from "../lib/threadDisplay";
import { Button } from "./ui/Button";

const SUGGESTED_PROMPTS = [
  "Fix the bugs present in the index.js file",
  "Create a new file called 'README.md' and add the project description",
  "Add a new component called 'Counter' to the index.js file to increment and decrement a counter",
];

export function ChatEmptyState({
  title,
  modelName,
  repo,
  onPickPrompt,
  onSelectRepo,
}: {
  title: string;
  modelName: string;
  repo: string | null;
  onPickPrompt: (text: string) => void;
  onSelectRepo?: () => void;
}) {
  const slug = repoSlug(repo);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 sm:px-10 py-12 max-w-lg mx-auto text-center">
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {slug ? (
          <>
            Using{" "}
            <span className="font-data text-foreground-secondary">{modelName}</span> on{" "}
            <span className="font-data text-foreground-secondary">{slug}</span>
          </>
        ) : (
          <>
            Using{" "}
            <span className="font-data text-foreground-secondary">{modelName}</span>
            {" · "}
            <button
              type="button"
              className="text-primary underline underline-offset-2"
              onClick={onSelectRepo}
            >
              Select a repo
            </button>{" "}
            to get started
          </>
        )}
      </p>

      {slug && (
        <div className="mt-8 flex flex-col gap-2 w-full">
          <p className="text-xs text-foreground-faint uppercase tracking-wide font-medium mb-1">
            Suggested
          </p>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="default"
              className="w-full justify-start text-left text-sm font-normal h-auto py-2 whitespace-normal"
              onClick={() => onPickPrompt(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
