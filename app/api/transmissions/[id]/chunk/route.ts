import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
// @ts-ignore
import fs from "fs";
import path from "path";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const chunkId = req.headers.get("X-Chunk-Id");

    if (!chunkId) {
        return new NextResponse("Missing Chunk ID", { status: 400 });
    }

    const storagePath = path.join(process.cwd(), "storage", id);
    if (!fs.existsSync(storagePath)) {
        return new NextResponse("Transmission not found", { status: 404 });
    }

    const chunkPath = path.join(storagePath, chunkId);

    // Read stream and write to file
    const blob = await req.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    fs.writeFileSync(chunkPath, buffer);

    return NextResponse.json({ success: true });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const chunkId = searchParams.get("chunkId");

    if (!chunkId) {
        return new NextResponse("Missing chunkId query param", { status: 400 });
    }

    const chunkPath = path.join(process.cwd(), "storage", id, chunkId);
    if (!fs.existsSync(chunkPath)) {
        return new NextResponse("Chunk not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(chunkPath);
    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Length": fileBuffer.length.toString(),
        }
    });
}
