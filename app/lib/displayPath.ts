export function stripWorkspacePath(text: string): string {
  if (!text) return text;
  return text.replace(
    /(?:\/[\w.-]+)*\/?tmp\/piper\/[^/\s]+\/[^/\s]+\//g,
    "",
  );
}

export function stripWorkspacePathInText(text: string): string {
  if (!text) return text;
  return text
    .split("\n")
    .map((line) => stripWorkspacePath(line))
    .join("\n");
}
