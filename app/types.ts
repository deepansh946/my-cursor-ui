export type MessageType =
  | "HumanMessage"
  | "AIMessage"
  | "AIMessageChunk"
  | "ToolMessage"
  | "error";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  toolName?: string;
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
}
