"use client";

import { useEffect, useState } from "react";
import { PaperAirplaneIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ProgressCirlce } from "@/components/ProgressCircle";

export default function SentFileList() {
    const [files, setFiles] = useState<any[]>([]);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/transmissions/sent')
            .then(res => res.json())
            .then(data => setFiles(data))
            .catch(err => console.error(err));
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm("Are you sure you want to delete this file? It will be removed from both the database and storage on disk.")) {
            return;
        }

        try {
            const res = await fetch(`/api/transmissions/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setFiles(prev => prev.filter(f => f.id !== id));
            } else {
                console.error("Failed to delete transmission");
                alert("Failed to delete file. Please try again.");
            }
        } catch (err) {
            console.error("Error deleting transmission:", err);
            alert("An error occurred while deleting the file.");
        }
    };

    if (files.length === 0) return <p className="text-zinc-500 text-sm italic">No files sent yet.</p>;

    return (
        <ul className="divide-y divide-white/5">
            {files.map(file => (
                <li
                    key={file.id}
                    className="py-3 flex justify-between items-center bg-transparent transition-colors hover:bg-white/[0.02] rounded-lg px-2 -mx-2"
                    onMouseEnter={() => setHoveredId(file.id)}
                    onMouseLeave={() => setHoveredId(null)}
                >
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{file.fileName}</p>
                        <p className="text-xs text-zinc-500">
                            To: {file.receiverName || file.receiverEmail} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="ml-4 shrink-0">
                        <ProgressCirlce
                            progress={file.totalChunks / file.expectedChunks}
                            icon={
                                hoveredId === file.id ? (
                                    <TrashIcon
                                        className="h-5 w-5 text-red-500 cursor-pointer transition-colors hover:text-red-400"
                                        onClick={(e) => handleDelete(e, file.id)}
                                    />
                                ) : (
                                    <PaperAirplaneIcon className="h-5 w-5 text-zinc-600" />
                                )
                            }
                        />
                    </div>
                </li>
            ))}
        </ul>
    )
}
