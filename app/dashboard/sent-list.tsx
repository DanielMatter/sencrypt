"use client";

import { useEffect, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function SentFileList() {
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/transmissions/sent')
            .then(res => res.json())
            .then(data => setFiles(data))
            .catch(err => console.error(err));
    }, []);

    if (files.length === 0) return <p className="text-zinc-500 text-sm italic">No files sent yet.</p>;

    return (
        <ul className="divide-y divide-white/5">
            {files.map(file => (
                <li key={file.id} className="py-3 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{file.fileName}</p>
                        <p className="text-xs text-zinc-500">
                            To: {file.receiverName || file.receiverEmail} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <PaperAirplaneIcon className="h-5 w-5 text-zinc-600" />
                    </div>
                </li>
            ))}
        </ul>
    )
}
