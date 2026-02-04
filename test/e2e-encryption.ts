
import fs from 'fs';
import path from 'path';
import { webcrypto } from 'node:crypto';

// Polyfill window and crypto for the library
const globalAny = global as any;
globalAny.window = {
    crypto: webcrypto,
    btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
    atob: (str: string) => Buffer.from(str, 'base64').toString('binary'),
};

// Import library functions after polyfilling
// We need to use require or dynamic import if we were not using ts-node/tsx handling ESM/CJS correctly.
// Assuming we run with `npx tsx` which handles TS and ESM.
import {
    importPublicKey,
    generateAESKey,
    wrapAESKey,
    encryptChunk,
    importPrivateKey,
    unwrapAESKey,
    decryptChunk
} from '../lib/crypto';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

async function runTest() {
    console.log("Starting End-to-End Encryption Test...");

    const testDir = path.join(__dirname, '../test');
    const pubKeyPath = path.join(testDir, 'id_test.pub');
    const privKeyPath = path.join(testDir, 'id_test');
    const testFilePath = path.join(testDir, 'testFile.txt');

    // 1. Load Keys
    if (!fs.existsSync(pubKeyPath) || !fs.existsSync(privKeyPath)) {
        console.error("Error: Test keys not found in 'test' directory.");
        process.exit(1);
    }
    const pubKeyStr = fs.readFileSync(pubKeyPath, 'utf-8');
    const privKeyStr = fs.readFileSync(privKeyPath, 'utf-8');

    console.log("Loaded keys.");

    // 2. Load Test File
    if (!fs.existsSync(testFilePath)) {
        console.error("Error: Test file not found.");
        process.exit(1);
    }
    const fileBuffer = fs.readFileSync(testFilePath);
    console.log(`Loaded test file (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB).`);

    // --- ENCRYPTION SIDE ---
    console.log("\n--- Starting Encryption ---");

    // Import Public Key
    const publicKey = await importPublicKey(pubKeyStr);
    console.log("Public key imported.");

    // Generate AES Key
    const aesKey = await generateAESKey();
    console.log("AES key generated.");

    // Wrap AES Key
    const wrappedKey = await wrapAESKey(aesKey, publicKey);
    console.log("AES key wrapped.");

    // Chunk and Encrypt
    const encryptedChunks: ArrayBuffer[] = [];
    const totalChunks = Math.ceil(fileBuffer.length / CHUNK_SIZE);

    const startTime = Date.now();

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, fileBuffer.length);
        const chunk = fileBuffer.subarray(start, end);

        // Convert Buffer to ArrayBuffer (handled by typed array constructor or buffer.buffer property usually)
        // Note: fs.readFileSync returns a Buffer, which is a Uint8Array subclass.
        // Copying to ensure clean ArrayBuffer if needed, though usually unnecessary if careful.
        const chunkArrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);

        const encryptedChunk = await encryptChunk(chunkArrayBuffer, aesKey, i);
        encryptedChunks.push(encryptedChunk);

        process.stdout.write(`\rEncrypted chunk ${i + 1}/${totalChunks}`);
    }
    console.log(`\nEncryption complete in ${Date.now() - startTime}ms.`);


    // --- DECRYPTION SIDE ---
    console.log("\n--- Starting Decryption ---");

    // Import Private Key
    const privateKey = await importPrivateKey(privKeyStr);
    console.log("Private key imported.");

    // Unwrap AES Key
    const unwrappedAesKey = await unwrapAESKey(wrappedKey, privateKey);
    console.log("AES key unwrapped.");

    // Decrypt Chunks
    const decryptedChunks: Buffer[] = [];

    for (let i = 0; i < encryptedChunks.length; i++) {
        const decryptedBuffer = await decryptChunk(encryptedChunks[i], unwrappedAesKey, i);
        decryptedChunks.push(Buffer.from(decryptedBuffer));
        process.stdout.write(`\rDecrypted chunk ${i + 1}/${totalChunks}`);
    }
    console.log("\nDecryption complete.");

    // Reassemble
    const fullDecryptedBuffer = Buffer.concat(decryptedChunks);

    // --- VERIFICATION ---
    console.log("\n--- Verification ---");
    if (fullDecryptedBuffer.equals(fileBuffer)) {
        console.log("✅ SUCCESS: Decrypted file matches original file exactly.");
    } else {
        console.error("❌ FAILURE: Decrypted file does NOT match original file.");
        console.log(`Original size: ${fileBuffer.length}`);
        console.log(`Decrypted size: ${fullDecryptedBuffer.length}`);
        process.exit(1);
    }
}

runTest().catch(err => {
    console.error("An error occurred during the test:", err);
    process.exit(1);
});
