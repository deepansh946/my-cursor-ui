export type MessageType =
  | "HumanMessage"
  | "AIMessage"
  | "AIMessageChunk"
  | "ToolMessage"
  | "error";

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  toolName?: string;
  toolTarget?: string;
  toolCallId?: string;
  /** e.g. backend marks terminal tool output */
  subtype?: string;
  isError?: boolean;
  retryText?: string;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
  repo: string | null;
  model?: string;
}

export interface LlmModel {
  id: string;
  name: string;
  description: string;
}
