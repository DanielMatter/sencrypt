"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
    importPrivateKey,
    unwrapAESKey,
    decryptChunk,
    base64ToBuffer,
    generateAESKey,
    wrapAESKey
} from "@/lib/crypto";

type Transmission = {
    id: string;
    fileName: string;
    fileSize: number;
    senderName: string;
    encryptedKey: string;
    totalChunks: number;
};

type WritableFileStream = {
    write: (data: BufferSource | Blob | string) => Promise<void>;
    close: () => Promise<void>;
};

type WritableFileHandle = {
    name: string;
    createWritable: () => Promise<WritableFileStream>;
    getFile?: () => Promise<File>;
};

type WritableDirectoryHandle = {
    getFileHandle: (name: string, options?: { create?: boolean }) => Promise<WritableFileHandle>;
};

declare global {
    interface Window {
        showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<WritableDirectoryHandle>;
        showSaveFilePicker?: (options?: { suggestedName?: string }) => Promise<WritableFileHandle>;
    }
}

function getChunkFileName(chunkId: number, totalChunks: number) {
    const width = Math.max(6, String(totalChunks - 1).length);
    return `chunk-${String(chunkId).padStart(width, "0")}.part`;
}

function toBashSingleQuoted(value: string) {
    return `'${value.replace(/'/g, "'\\''")}'`;
}

function getConcatCommand(fileName: string) {
    return `cat chunk-*.part > ${toBashSingleQuoted(fileName)}`;
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

function isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === "AbortError";
}

function isOperationError(error: unknown) {
    return error instanceof DOMException && error.name === "OperationError";
}

// Self-test function to verify if the private key can decrypt what its public pair encrypts
async function verifyKeyIntegrity(privateKey: CryptoKey) {
    try {
        console.log("Starting Key Integrity Check...");
        // 1. Export Private Key to get public components (JWK)
        const jwk = await window.crypto.subtle.exportKey("jwk", privateKey);

        // 2. Import as Public Key
        // Delete private parts just to be clean, though importKey 'jwk' ignores them or treats as private if d is present
        // We strictly want to import as public to simulate send behavior
        const publicJwk = { kty: jwk.kty, n: jwk.n, e: jwk.e, ext: true };
        const publicKey = await window.crypto.subtle.importKey(
            "jwk",
            publicJwk,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
        );

        // 3. Generate a random AES key (simulating the process)
        const aesKey = await generateAESKey();

        // 4. Wrap (Encrypt) it with Public Key
        const wrappedKey = await wrapAESKey(aesKey, publicKey);
        console.log("Integrity Check: Wrapped key size:", wrappedKey.byteLength);

        // 5. Unwrap (Decrypt) it with Private Key
        await unwrapAESKey(wrappedKey, privateKey);
        console.log("Integrity Check: SUCCESS - Key pair is valid and functional.");
        return true;
    } catch (e) {
        console.error("Integrity Check: FAILED", e);
        return false;
    }
}

export default function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();

    const [transmission, setTransmission] = useState<Transmission | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("");
    const [privateKeyText, setPrivateKeyText] = useState("");
    const [lastConcatCommand, setLastConcatCommand] = useState("");

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
            .then((data: Transmission[]) => {
                const tx = data.find((t) => t.id === id);
                if (tx) setTransmission(tx);
                else setStatus("Transmission not found or you don't have access.");
            });
    }, [id, session]);

    const prepareAesKey = async () => {
        if (!transmission) throw new Error("Transmission not loaded.");

        setStatus("Decrypting secure keys...");

        let privateKey: CryptoKey;

        try {
            console.log("Importing private key...");
            privateKey = await importPrivateKey(privateKeyText);

            // Debug: Check if the key matches expectation
            const jwk = await window.crypto.subtle.exportKey("jwk", privateKey);
            console.log("Private Key Modulus start:", jwk.n?.substring(0, 20));

            // Verify integrity
            await verifyKeyIntegrity(privateKey);

        } catch (e: unknown) {
            console.error("Private key import failed:", e);
            throw new Error("Invalid Private Key format or password protected keys not supported.");
        }

        try {
            console.log("Unwrapping AES key...");
            const encryptedKeyBuffer = base64ToBuffer(transmission.encryptedKey);
            console.log("Encrypted key size:", encryptedKeyBuffer.byteLength);
            console.log("Encrypted key start:", transmission.encryptedKey.substring(0, 20));

            return await unwrapAESKey(encryptedKeyBuffer, privateKey);
        } catch (e: unknown) {
            console.error("AES Key unwrap failed:", e);
            // Check if it's OperationError
            if (isOperationError(e)) {
                throw new Error("Decryption failed. Please check if you are using the correct Private Key.");
            }
            throw e;
        }
    };

    const handleFolderDownload = async () => {
        if (!transmission) return;
        if (!privateKeyText) {
            alert("Please provide your Private Key!");
            return;
        }

        if (!("showDirectoryPicker" in window)) {
            alert("Folder downloads require Chrome or another browser with the File System Access API.");
            return;
        }

        setIsDownloading(true);
        setProgress(0);
        setLastConcatCommand("");
        setStatus("Starting folder download...");

        try {
            const totalChunks = transmission.totalChunks;
            const aesKey = await prepareAesKey();
            const concatCommand = getConcatCommand(transmission.fileName);

            setStatus("Choose an empty output folder...");
            const directoryHandle = await window.showDirectoryPicker?.({ mode: "readwrite" });
            if (!directoryHandle) throw new Error("Folder picker is not available in this browser.");

            for (let i = 0; i < totalChunks; i++) {
                const chunkFileName = getChunkFileName(i, totalChunks);
                setStatus(`Downloading & decrypting ${chunkFileName} (${i + 1}/${totalChunks})...`);

                const res = await fetch(`/api/transmissions/${id}/chunk?chunkId=${i}`);
                if (!res.ok) throw new Error("Failed to fetch chunk");

                const encryptedBuffer = await res.arrayBuffer();
                const decryptedBuffer = await decryptChunk(encryptedBuffer, aesKey, i);

                const fileHandle = await directoryHandle.getFileHandle(chunkFileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(decryptedBuffer);
                await writable.close();

                setProgress(Math.round(((i + 1) / totalChunks) * 100));
            }

            const commandHandle = await directoryHandle.getFileHandle("CONCAT_COMMAND.txt", { create: true });
            const commandWritable = await commandHandle.createWritable();
            await commandWritable.write(`${concatCommand}\n`);
            await commandWritable.close();

            setLastConcatCommand(concatCommand);
            setStatus("Chunk download complete. Run the concat command inside the selected folder.");
        } catch (err: unknown) {
            console.error(err);
            if (!isAbortError(err)) {
                const message = getErrorMessage(err);
                setStatus(`Error: ${message}`);
                alert("Folder download failed: " + message);
            } else {
                setStatus("Download cancelled.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownload = async () => {
        if (!transmission) return;
        if (!privateKeyText) {
            alert("Please provide your Private Key!");
            return;
        }

        setIsDownloading(true);
        setProgress(0);
        setLastConcatCommand("");
        setStatus("Starting download...");

        try {
            const totalChunks = transmission.totalChunks;

            // 1. Prepare Private Key and AES Key
            const aesKey = await prepareAesKey();

            let writableStream: WritableFileStream | null = null;
            let fileHandleForUniqueOpfs: WritableFileHandle | null = null;
            const canUseSavePicker = 'showSaveFilePicker' in window;

            // Strategy 1: Native File System Access (User Saves File directly)
            if (canUseSavePicker) {
                try {
                    const handle = await window.showSaveFilePicker?.({
                        suggestedName: transmission.fileName,
                    });
                    if (!handle) throw new Error("Save picker is not available in this browser.");
                    writableStream = await handle.createWritable();
                } catch (err: unknown) {
                    if (isAbortError(err)) {
                        throw err; // Stop if user cancelled
                    }
                    console.warn("showSaveFilePicker failed, trying fallback", err);
                }
            }

            // Strategy 2: OPFS (Origin Private File System) - ideal for large files if Save Picker is unavailable
            if (!writableStream && navigator.storage?.getDirectory) {
                try {
                    const root = await navigator.storage.getDirectory();
                    // Create a unique temp file
                    const tempName = `sencrypt-${id}-${Date.now()}.part`;
                    fileHandleForUniqueOpfs = await root.getFileHandle(tempName, { create: true });
                    writableStream = await fileHandleForUniqueOpfs.createWritable();
                    console.log("Using OPFS for download buffering");
                } catch (err) {
                    console.warn("OPFS failed, falling back to RAM", err);
                }
            }

            // Execute Download
            if (writableStream) {
                // Streaming Mode (Low Memory)
                try {
                    for (let i = 0; i < totalChunks; i++) {
                        setStatus(`Downloading & Decrypting chunk ${i + 1}/${totalChunks}...`);
                        const res = await fetch(`/api/transmissions/${id}/chunk?chunkId=${i}`);
                        if (!res.ok) throw new Error("Failed to fetch chunk");

                        const encryptedBuffer = await res.arrayBuffer();
                        const decryptedBuffer = await decryptChunk(encryptedBuffer, aesKey, i);

                        await writableStream.write(decryptedBuffer);
                        setProgress(Math.round(((i + 1) / totalChunks) * 100));
                    }
                    await writableStream.close();

                    // If OPFS, we now export it to the user
                    if (fileHandleForUniqueOpfs) {
                        setStatus("Saving file...");
                        if (!fileHandleForUniqueOpfs.getFile) throw new Error("Temporary file export is not available.");
                        const file = await fileHandleForUniqueOpfs.getFile();
                        const url = URL.createObjectURL(file);

                        const a = document.createElement('a');
                        a.href = url;
                        a.download = transmission.fileName;
                        document.body.appendChild(a);
                        a.click();

                        console.log("Download started");
                        // Wait a bit for the download to start
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        // Cleanup
                        try {
                            const root = await navigator.storage.getDirectory();
                            await root.removeEntry(fileHandleForUniqueOpfs.name);
                        } catch (cleanupErr) {
                            console.warn("Failed to cleanup temp file", cleanupErr);
                        }
                    }
                } catch (downloadErr) {
                    console.error(downloadErr);
                    // Try to close stream if open
                    try { await writableStream.close(); } catch { }
                    throw downloadErr;
                }

            } else {
                // Strategy 3: RAM Fallback (Legacy) - High Memory Usage
                console.warn("Falling back to RAM buffering. Large files may crash.");
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

        } catch (err: unknown) {
            console.error(err);
            // Don't show error if user cancelled the picker
            if (!isAbortError(err)) {
                const message = getErrorMessage(err);
                setStatus(`Error: ${message}`);
                alert("Download failed: " + message);
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
                            className="flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? "Processing..." : "Decrypt & Download"}
                        </button>

                        <div className="space-y-3 rounded-md bg-white/5 p-4 ring-1 ring-white/10">
                            <div>
                                <p className="text-sm font-medium text-white">Chrome large-file fallback</p>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Choose a folder and Sencrypt will write decrypted chunk files there. The rebuild command appears after all chunks are downloaded.
                                </p>
                            </div>

                            {lastConcatCommand && (
                                <code className="block overflow-x-auto rounded bg-black/40 px-3 py-2 font-mono text-xs text-green-200">
                                    {lastConcatCommand}
                                </code>
                            )}

                            <button
                                type="button"
                                onClick={handleFolderDownload}
                                disabled={isDownloading}
                                className="flex w-full justify-center rounded-md bg-zinc-700 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDownloading ? "Processing..." : "Decrypt Chunks to Folder"}
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-zinc-400">Loading details...</p>
                )}
            </div>
        </div>
    );
}
