"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LockClosedIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
    importPrivateKey,
    unwrapAESKey,
    decryptChunk,
    base64ToBuffer
} from "@/lib/crypto";

export default function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();

    const [transmission, setTransmission] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");
    const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null); // For future implementation
    const [privateKeyText, setPrivateKeyText] = useState("");

    // Fetch transmission details (I need an API for this, or reuse received API with filtering?)
    // Ideally `api/transmissions/[id]`
    // I'll assume I have the data passed or I fetch it.
    // I haven't implemented `api/transmissions/[id]` GET yet, only list. 
    // I'll implement a `useEffect` to find it from the list or add a specific endpoint. 
    // For now, I'll fetch the list and find it.

    useEffect(() => {
        if (!session) return;
        fetch('/api/transmissions/received')
            .then(res => res.json())
            .then(data => {
                const tx = data.find((t: any) => t.id === id);
                if (tx) setTransmission(tx);
                else setStatus("Transmission not found or you don't have access.");
            });
    }, [id, session]);

    const handleDownload = async () => {
        if (!transmission) return;
        if (!privateKeyText && !privateKeyFile) {
            alert("Please provide your Private Key!");
            return;
        }

        setIsDownloading(true);
        setStatus("Starting download...");

        try {
            const totalChunks = transmission.totalChunks;

            // 1. Prepare Private Key and AES Key
            setStatus("Decrypting secure keys...");
            const privateKey = await importPrivateKey(privateKeyText);
            const encryptedKeyBuffer = base64ToBuffer(transmission.encryptedKey);
            const aesKey = await unwrapAESKey(encryptedKeyBuffer, privateKey);

            const canUseSavePicker = 'showSaveFilePicker' in window;

            if (canUseSavePicker) {
                // @ts-ignore
                const handle = await window.showSaveFilePicker({
                    suggestedName: transmission.fileName,
                });
                const writable = await handle.createWritable();

                for (let i = 0; i < totalChunks; i++) {
                    setStatus(`Downloading & Decrypting chunk ${i + 1}/${totalChunks}...`);
                    const res = await fetch(`/api/transmissions/${id}/chunk?chunkId=${i}`);
                    if (!res.ok) throw new Error("Failed to fetch chunk");
                    const encryptedBuffer = await res.arrayBuffer();
                    const decryptedBuffer = await decryptChunk(encryptedBuffer, aesKey, i);
                    await writable.write(decryptedBuffer);
                    setProgress(Math.round(((i + 1) / totalChunks) * 100));
                }
                await writable.close();
            } else {
                // Fallback for browsers without showSaveFilePicker
                const chunks: ArrayBuffer[] = [];
                for (let i = 0; i < totalChunks; i++) {
                    setStatus(`Downloading & Decrypting chunk ${i + 1}/${totalChunks}...`);
                    const res = await fetch(`/api/transmissions/${id}/chunk?chunkId=${i}`);
                    if (!res.ok) throw new Error("Failed to fetch chunk");
                    const encryptedBuffer = await res.arrayBuffer();
                    const decryptedBuffer = await decryptChunk(encryptedBuffer, aesKey, i);
                    chunks.push(decryptedBuffer);
                    setProgress(Math.round(((i + 1) / totalChunks) * 100));
                }

                const blob = new Blob(chunks, { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = transmission.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            setStatus("Download Complete!");

        } catch (err: any) {
            console.error(err);
            // Don't show error if user cancelled the picker
            if (err.name !== 'AbortError') {
                setStatus(`Error: ${err.message}`);
                alert("Download failed: " + err.message);
            } else {
                setStatus("Download cancelled.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    if (!session) return <p className="text-white text-center mt-10">Please log in.</p>;

    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center space-x-4 mb-8">
                <ArrowDownTrayIcon className="h-8 w-8 text-green-400" />
                <h1 className="text-3xl font-bold text-white">Download File</h1>
            </div>

            <div className="bg-white/5 shadow ring-1 ring-white/10 sm:rounded-lg p-6 space-y-6">
                {transmission ? (
                    <>
                        <div>
                            <p className="text-lg font-medium text-white">{transmission.fileName}</p>
                            <p className="text-sm text-zinc-400">{(transmission.fileSize / 1024 / 1024).toFixed(2)} MB • Sent by {transmission.senderName}</p>
                        </div>

                        {/* Private Key Input */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-zinc-300">Private Key (PEM format)</label>
                            <div className="mt-2">
                                <textarea
                                    rows={4}
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 font-mono text-xs"
                                    placeholder="-----BEGIN RSA PRIVATE KEY----- ..."
                                    value={privateKeyText}
                                    onChange={(e) => setPrivateKeyText(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Progress */}
                        {isDownloading && (
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-200 bg-green-900/50">{status}</span>
                                    <span className="text-xs font-semibold inline-block text-green-200">{progress}%</span>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-900/50">
                                    <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"></div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? "Processing..." : "Decrypt & Download"}
                        </button>
                    </>
                ) : (
                    <p className="text-zinc-400">Loading details...</p>
                )}
            </div>
        </div>
    );
}
