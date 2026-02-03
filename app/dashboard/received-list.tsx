"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function ReceivedFileList() {
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/transmissions/received')
            .then(res => res.json())
            .then(data => setFiles(data))
            .catch(err => console.error(err));
    }, []);

    if (files.length === 0) return <p>No files received yet.</p>;

    return (
        <ul className="divide-y divide-yellow-400/20 mt-2">
            {files.map(file => (
                <li key={file.id} className="py-2 flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-yellow-500">{file.fileName}</p>
                        <p className="text-xs text-yellow-600">From: {file.senderName} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Link href={`/download/${file.id}`} className="p-2 bg-yellow-400/20 rounded-full hover:bg-yellow-400/40 text-yellow-600">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </Link>
                </li>
            ))}
        </ul>
    )
}
