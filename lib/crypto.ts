/**
 * Utility functions for on-device encryption/decryption using Web Crypto API.
 */

// Generate a random AES key
export async function generateAESKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

// Export AES key to raw bytes
export async function exportAESKey(key: CryptoKey): Promise<ArrayBuffer> {
    return await window.crypto.subtle.exportKey("raw", key);
}

// Import AES key from raw bytes
export async function importAESKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    return await window.crypto.subtle.importKey(
        "raw",
        keyData,
        "AES-GCM",
        true,
        ["encrypt", "decrypt"]
    );
}

// Encrypt a chunk using AES-GCM
// Using chunkId as IV for simplicity and deterministic IV per chunk
export async function encryptChunk(chunk: BufferSource, key: CryptoKey, chunkId: number): Promise<ArrayBuffer> {
    const iv = new Uint8Array(12);
    const view = new DataView(iv.buffer);
    view.setUint32(0, chunkId, false); // Big-endian chunk ID as IV

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        chunk
    );

    return encrypted;
}

// Decrypt a chunk using AES-GCM
export async function decryptChunk(encryptedChunk: ArrayBuffer, key: CryptoKey, chunkId: number): Promise<ArrayBuffer> {
    const iv = new Uint8Array(12);
    const view = new DataView(iv.buffer);
    view.setUint32(0, chunkId, false);

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encryptedChunk
    );

    return decrypted;
}

// Helper to convert Uint8Array to Base64URL
function base64UrlEncode(buffer: Uint8Array): string {
    const binary = String.fromCharCode(...buffer);
    return window.btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

// Simple SSH Public Key Parser for RSA
async function parseSSHRsa(sshKey: string): Promise<JsonWebKey> {
    const parts = sshKey.trim().split(/\s+/);
    if (parts.length < 2) throw new Error("Invalid SSH key format");

    const keyData = parts[1];
    const binary = window.atob(keyData);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
    }

    let offset = 0;
    const readString = () => {
        const length = new DataView(buffer.buffer).getUint32(offset);
        offset += 4;
        const str = new TextDecoder().decode(buffer.slice(offset, offset + length));
        offset += length;
        return str;
    };

    const readBuffer = () => {
        const length = new DataView(buffer.buffer).getUint32(offset);
        offset += 4;
        const buf = buffer.slice(offset, offset + length);
        offset += length;
        return buf;
    };

    const type = readString();
    if (type !== "ssh-rsa") throw new Error("Only ssh-rsa keys are supported");

    const exponent = readBuffer();
    const modulus = readBuffer();

    return {
        kty: "RSA",
        e: base64UrlEncode(exponent),
        n: base64UrlEncode(modulus),
        alg: "PS256", // Use PS256 or RSA-OAEP depending on what you need, but JWK for OAEP requires specific alg
        ext: true
    };
}

// Import Public Key (PEM or SSH to CryptoKey)
export async function importPublicKey(pem: string): Promise<CryptoKey> {
    console.log("Importing public key", pem);

    if (pem.trim().startsWith("ssh-")) {
        const jwk = await parseSSHRsa(pem);
        // Remove alg from JWK as we'll specify it in importKey
        delete jwk.alg;

        return await window.crypto.subtle.importKey(
            "jwk",
            jwk,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["encrypt"]
        );
    }

    // Remove headers, footers, and ALL whitespace (including \r and \n)
    const cleanPem = pem
        .replace(/---.*---/g, "")
        .replace(/\s/g, "");

    const binary = window.atob(cleanPem);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        view[i] = binary.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
        "spki",
        buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

// Helper to wrap PKCS#1 (RSA) private key into PKCS#8
function wrapPkcs1ToPkcs8(pkcs1Buffer: ArrayBuffer): ArrayBuffer {
    const pkcs1Uint8 = new Uint8Array(pkcs1Buffer);

    // PKCS#8 header for RSA: 
    // - Version (0)
    // - AlgorithmIdentifier (rsaEncryption)
    // - Octet String wrapper for the PKCS#1 data
    // This is a simplified ASN.1 encoding for a fixed RSA OID.
    const header = new Uint8Array([
        0x30, 0x82, 0x00, 0x00, // Sequence (Total Length - to be filled)
        0x02, 0x01, 0x00, // Version 0
        0x30, 0x0d, // Sequence (AlgorithmIdentifier)
        0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, // OID 1.2.840.113549.1.1.1 (rsaEncryption)
        0x05, 0x00, // Null parameters
        0x04, 0x82, 0x00, 0x00, // Octet String (Length - to be filled)
    ]);

    const totalLen = header.length + pkcs1Uint8.length - 4;
    const octetLen = pkcs1Uint8.length;

    // Fill lengths (big-endian 16-bit)
    const view = new DataView(header.buffer);
    view.setUint16(2, totalLen, false);
    view.setUint16(24, octetLen, false);

    const result = new Uint8Array(header.length + pkcs1Uint8.length);
    result.set(header);
    result.set(pkcs1Uint8, header.length);
    return result.buffer;
}

// Import Private Key (PEM to CryptoKey)
export async function importPrivateKey(pem: string): Promise<CryptoKey> {
    const isPkcs1 = pem.includes("BEGIN RSA PRIVATE KEY");

    // Remove headers, footers, and ALL whitespace (including \r and \n)
    const cleanPem = pem
        .replace(/---.*---/g, "")
        .replace(/\s/g, "");

    const binary = window.atob(cleanPem);
    let buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        view[i] = binary.charCodeAt(i);
    }

    if (isPkcs1) {
        buffer = wrapPkcs1ToPkcs8(buffer);
    }

    return await window.crypto.subtle.importKey(
        "pkcs8",
        buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );
}

// Encrypt the AES key with an RSA Public Key
export async function wrapAESKey(aesKey: CryptoKey, publicKey: CryptoKey): Promise<ArrayBuffer> {
    const rawAesKey = await exportAESKey(aesKey);
    return await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        rawAesKey
    );
}

// Decrypt the AES key with an RSA Private Key
export async function unwrapAESKey(encryptedKey: ArrayBuffer, privateKey: CryptoKey): Promise<CryptoKey> {
    const rawAesKey = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        privateKey,
        encryptedKey
    );
    return await importAESKey(rawAesKey);
}

// Helper to convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
    // Also strip whitespace here just in case
    const cleanBase64 = base64.replace(/\s/g, "");
    const binary = window.atob(cleanBase64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return buffer;
}
