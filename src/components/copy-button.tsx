"use client";
import { useState } from "react";
export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  }
  return <button className="copy" type="button" onClick={copy}>{copied ? "Copied" : "Copy key"}</button>;
}
