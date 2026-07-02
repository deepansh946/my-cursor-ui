"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function GetStartedCta({ className }: { className: string }) {
  const { data: session } = useSession();

  return (
    <Link href={session ? "/chat" : "/login"} className={className}>
      {session ? "Open app" : "Get started"}
    </Link>
  );
}
