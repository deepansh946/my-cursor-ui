import { marked } from "marked";

export type ContentSegment =
  | { kind: "html"; html: string }
  | { kind: "code"; lang: string; code: string };

export function parseContent(text: string): ContentSegment[] {
  const tokens = marked.lexer(text);
  const segments: ContentSegment[] = [];
  type LexToken = (typeof tokens)[number];
  let pendingTokens: LexToken[] = [];

  const flushPending = () => {
    if (pendingTokens.length === 0) return;
    segments.push({ kind: "html", html: marked.parser(pendingTokens) });
    pendingTokens = [];
  };

  for (const token of tokens) {
    if (token.type === "code") {
      flushPending();
      segments.push({ kind: "code", lang: token.lang || "text", code: token.text });
    } else {
      pendingTokens.push(token);
    }
  }

  flushPending();
  return segments;
}
