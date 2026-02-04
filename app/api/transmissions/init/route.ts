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

    const { receiverId, fileName, fileSize, encryptedKey, expectedChunks, chunkSize } = await req.json();

    // Create DB record
    const [transmission] = await db.insert(transmissions).values({
        // @ts-ignore
        senderId: session.user.id,
        receiverId,
        fileName,
        fileSize,
        totalChunks: 0,
        encryptedKey,
        chunkSize,
        expectedChunks
    }).returning();

    // Create directory
    const transmissionDir = path.join(process.cwd(), "storage", transmission.id);
    if (!fs.existsSync(transmissionDir)) {
        fs.mkdirSync(transmissionDir, { recursive: true });
    }

    return NextResponse.json({ transmissionId: transmission.id });
}
