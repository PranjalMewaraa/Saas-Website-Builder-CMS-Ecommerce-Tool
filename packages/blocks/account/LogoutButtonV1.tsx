"use client";

import { useState } from "react";

type Props = {
  label?: string;
  redirectTo?: string;
  variant?: "link" | "button";
};

export default function LogoutButtonV1(props: Props) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          csrfToken,
          callbackUrl: props.redirectTo || "/",
        }).toString(),
      });
    } finally {
      window.location.href = props.redirectTo || "/";
    }
  };

  const label = busy ? "Signing out…" : props.label || "Sign out";

  if (props.variant === "link") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="underline text-sm disabled:opacity-50"
      >
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="border rounded px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
    >
      {label}
    </button>
  );
}
