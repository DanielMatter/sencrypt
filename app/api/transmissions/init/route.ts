import { db } from "@/lib/db";
import { transmissions } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
// @ts-ignore
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { receiverId, fileName, fileSize, encryptedKey } = await req.json();
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB as requested
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

    // Create DB record
    const [transmission] = await db.insert(transmissions).values({
        // @ts-ignore
        senderId: session.user.id,
        receiverId,
        fileName,
        fileSize,
        totalChunks,
        encryptedKey,
    }).returning();

    // Create directory
    const transmissionDir = path.join(process.cwd(), "storage", transmission.id);
    if (!fs.existsSync(transmissionDir)) {
        fs.mkdirSync(transmissionDir, { recursive: true });
    }

    return NextResponse.json({ transmissionId: transmission.id });
}
