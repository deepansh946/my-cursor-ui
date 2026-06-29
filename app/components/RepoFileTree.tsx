"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";
import type { FlatNode } from "../services/github";
import { useGithubTree } from "../hooks/useGithubTree";
import { Label } from "./ui/Label";
import { Spinner } from "./ui/Spinner";

type TreeNode = {
  name: string;
  path: string;
  type: "blob" | "tree";
  children: TreeNode[];
};

function buildTree(flat: FlatNode[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  const sorted = [...flat].sort((a, b) => a.path.localeCompare(b.path));

  for (const item of sorted) {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1]!;
    const node: TreeNode = {
      name,
      path: item.path,
      type: item.type === "tree" ? "tree" : "blob",
      children: [],
    };
    map.set(item.path, node);

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      map.get(parentPath)?.children.push(node);
    }
  }

  return root;
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type === "tree" && b.type !== "tree") return -1;
    if (a.type !== "tree" && b.type === "tree") return 1;
    return a.name.localeCompare(b.name);
  });
}

function TreeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth === 0);
  const isFolder = node.type === "tree";

  return (
    <div>
      <div
        className="tree-row flex items-center gap-1.5 py-0.5 cursor-pointer rounded-[var(--radius-sm)]"
        style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: 8 }}
        onClick={() => isFolder && setOpen((o) => !o)}
      >
        {isFolder ? (
          <>
            <span className="shrink-0">
              {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            </span>
            <span className="shrink-0">
              {open ? <FolderOpen size={12} /> : <Folder size={12} />}
            </span>
          </>
        ) : (
          <>
            <span className="shrink-0 invisible">
              <ChevronRight size={10} />
            </span>
            <span className="shrink-0">
              <File size={12} />
            </span>
          </>
        )}
        <span
          className={`text-xs truncate ${isFolder ? "text-foreground-secondary" : "text-muted-foreground"}`}
        >
          {node.name}
        </span>
      </div>
      {isFolder && open && (
        <div>
          {sortNodes(node.children).map((child) => (
            <TreeRow key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function RepoFileTree({
  activeRepo,
  className = "",
}: {
  activeRepo: string;
  className?: string;
}) {
  const { data, isLoading, isError } = useGithubTree(activeRepo);
  const tree = useMemo(() => buildTree(data ?? []), [data]);
  const [owner, repoName] = activeRepo.split("/");

  return (
    <div
      className={`w-56 shrink-0 flex flex-col overflow-hidden border-l border-border bg-surface ${className}`}
    >
      <div className="px-3 py-3 shrink-0 border-b border-border">
        <Label>Workspace</Label>
        <p className="text-xs mt-1 truncate font-data text-foreground-secondary">{repoName}</p>
        <p className="text-xs mt-0.5 truncate font-data text-muted-foreground">{owner}</p>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {isLoading && (
          <div className="flex items-center justify-center px-3 py-4">
            <Spinner />
          </div>
        )}
        {isError && !isLoading && (
          <p className="text-xs px-3 py-3 text-destructive">Failed to load tree</p>
        )}
        {!isLoading &&
          !isError &&
          sortNodes(tree).map((node) => (
            <TreeRow key={node.path} node={node} depth={0} />
          ))}
      </div>
    </div>
  );
}
