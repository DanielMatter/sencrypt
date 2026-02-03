"use client";

import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-x-2 rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors"
        >
            {copied ? (
                <>
                    <CheckIcon className="h-4 w-4 text-green-400" />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <ClipboardIcon className="h-4 w-4 text-zinc-400" />
                    <span>Copy URL</span>
                </>
            )}
        </button>
    );
}
