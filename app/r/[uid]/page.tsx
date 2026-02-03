"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import {
    generateAESKey,
    importPublicKey,
    wrapAESKey,
    encryptChunk,
    bufferToBase64
} from "@/lib/crypto";

export default function ReceivePage({ params }: { params: Promise<{ uid: string }> }) {
    const { uid } = use(params);
    const { data: session } = useSession();
    const [recipientKeys, setRecipientKeys] = useState<{ id: string, name: string, keyData: string }[]>([]);
    const [selectedKey, setSelectedKey] = useState<string>("");

    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (!session) return;
        fetch(`/api/users/${uid}/keys`)
            .then(res => res.json())
            .then(data => {
                setRecipientKeys(data);
                if (data.length > 0) setSelectedKey(data[0].id);
            })
            .catch(err => setError("Could not load recipient keys (User might not exist or has no keys)"));
    }, [uid, session]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const startUpload = async () => {
        console.log(file, uid, selectedKey);

        if (!file || !uid || !selectedKey) return;
        setIsUploading(true);
        setStatus("Initiating transfer...");

        try {
            // 1. Prepare target key
            const targetKeyPem = recipientKeys.find(k => k.id === selectedKey)?.keyData;
            if (!targetKeyPem) throw new Error("Key not found");

            // 2. Generate and Wrap AES Key
            setStatus("Generating secure keys...");
            const aesKey = await generateAESKey();
            const publicKey = await importPublicKey(targetKeyPem);
            const wrappedKeyBuffer = await wrapAESKey(aesKey, publicKey);
            const encryptedKeyBase64 = bufferToBase64(wrappedKeyBuffer);

            // 3. Init Transmission
            const initRes = await fetch('/api/transmissions/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: uid,
                    fileName: file.name,
                    fileSize: file.size,
                    encryptedKey: encryptedKeyBase64,
                })
            });

            if (!initRes.ok) throw new Error("Failed to initiate transmission");
            const { transmissionId } = await initRes.json();

            const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB as requested
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            for (let i = 0; i < totalChunks; i++) {
                setStatus(`Encrypting and uploading chunk ${i + 1}/${totalChunks}...`);
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const chunkBuffer = await chunk.arrayBuffer();
                const encryptedData = await encryptChunk(chunkBuffer, aesKey, i);

                const uploadRes = await fetch(`/api/transmissions/${transmissionId}/chunk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/octet-stream', 'X-Chunk-Id': i.toString() },
                    body: encryptedData
                });

                if (!uploadRes.ok) throw new Error(`Failed to upload chunk ${i}`);
                setProgress(Math.round(((i + 1) / totalChunks) * 100));
            }

            setStatus("Upload complete!");
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (e: any) {
            console.log("An error occured", e)
            setStatus(`Error: ${e.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (!session) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center text-white">
                <h1 className="text-2xl font-bold mb-4">Login Required</h1>
                <p className="mb-8">You must be logged in to send files.</p>
                <button
                    onClick={() => router.push(`/auth/login?callbackUrl=/r/${uid}`)}
                    className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center space-x-4 mb-8">
                <PaperAirplaneIcon className="h-8 w-8 text-indigo-400" />
                <h1 className="text-3xl font-bold text-white">Send File to User</h1>
            </div>

            {error && (
                <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20 mb-6">
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white/5 shadow ring-1 ring-white/10 sm:rounded-lg p-6 space-y-6">

                {/* Recipient Info */}
                <div>
                    <label className="block text-sm font-medium leading-6 text-zinc-300">Recipient ID</label>
                    <div className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-zinc-400 pl-3 font-mono text-xs">
                        {uid}
                    </div>
                </div>

                {/* Key Selection */}
                <div>
                    <label className="block text-sm font-medium leading-6 text-zinc-300">Encryption Key</label>
                    {recipientKeys.length > 0 ? (
                        <select
                            className="mt-2 block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&>option]:text-black"
                            value={selectedKey}
                            onChange={(e) => setSelectedKey(e.target.value)}
                        >
                            {recipientKeys.map(k => (
                                <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                        </select>
                    ) : (
                        <p className="mt-2 text-sm text-yellow-400">Loading keys or no keys available...</p>
                    )}
                </div>

                {/* File Selection */}
                <div>
                    <label className="block text-sm font-medium leading-6 text-zinc-300">File</label>
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/25"}`}
                    >
                        {file ? (
                            <div className="text-white text-center">
                                <p className="text-sm font-semibold">{file.name}</p>
                                <p className="text-xs text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button onClick={() => setFile(null)} className="mt-2 text-xs text-red-300 hover:text-red-200">Remove</button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="mt-4 flex text-sm leading-6 text-zinc-400">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-300"
                                    >
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress & Actions (Same as before) */}
                {isUploading && (
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-200 bg-indigo-900/50">{status}</span>
                            <span className="text-xs font-semibold inline-block text-indigo-200">{progress}%</span>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-900/50">
                            <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"></div>
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="button"
                        onClick={startUpload}
                        disabled={!file || !uid || !selectedKey || isUploading}
                        className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? "Sending..." : "Encrypt & Send"}
                    </button>
                </div>

            </div>
        </div>
    );
}
