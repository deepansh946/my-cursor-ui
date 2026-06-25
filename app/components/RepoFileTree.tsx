"use client";

import { useMemo, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaFile,
  FaFolder,
  FaFolderOpen,
} from "react-icons/fa";
import type { FlatNode } from "../services/github";
import { useGithubTree } from "../hooks/useGithubTree";

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
        className="flex items-center gap-1.5 py-[3px] cursor-pointer rounded transition-colors"
        style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: 8 }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--bg-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "transparent")
        }
        onClick={() => isFolder && setOpen((o) => !o)}
      >
        {isFolder ? (
          <>
            <span style={{ color: "var(--text-dim)", fontSize: 7, flexShrink: 0 }}>
              {open ? <FaChevronDown /> : <FaChevronRight />}
            </span>
            <span style={{ color: "var(--accent)", fontSize: 10, flexShrink: 0, opacity: 0.7 }}>
              {open ? <FaFolderOpen /> : <FaFolder />}
            </span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 7, flexShrink: 0, visibility: "hidden" }}>▶</span>
            <span style={{ color: "var(--border)", fontSize: 10, flexShrink: 0 }}>
              <FaFile />
            </span>
          </>
        )}
        <span
          className="text-[11px] truncate"
          style={{ color: isFolder ? "var(--text-muted)" : "var(--text-dim)" }}
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

export function RepoFileTree({ activeRepo }: { activeRepo: string }) {
  const { data, isLoading, isError } = useGithubTree(activeRepo);
  const tree = useMemo(() => buildTree(data ?? []), [data]);
  const [owner, repoName] = activeRepo.split("/");

  return (
    <div
      className="w-56 shrink-0 flex flex-col overflow-hidden"
      style={{
        borderLeft: "1px solid var(--border)",
        background: "var(--bg-subtle)",
      }}
    >
      <div
        className="px-3 py-2.5 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <p
          className="text-[10px] tracking-[0.15em] uppercase truncate font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          {repoName}
        </p>
        <p
          className="text-[9px] mt-0.5 truncate"
          style={{ color: "var(--text-dim)", opacity: 0.6 }}
        >
          {owner}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {isLoading && (
          <div className="flex items-center gap-1.5 px-3 py-4">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1 rounded-full"
                style={{
                  background: "var(--accent)",
                  animation: `sage-pulse 1.4s ease-in-out ${i * 220}ms infinite`,
                }}
              />
            ))}
          </div>
        )}
        {isError && !isLoading && (
          <p className="text-[11px] px-3 py-3" style={{ color: "var(--error)" }}>
            Failed to load tree
          </p>
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
