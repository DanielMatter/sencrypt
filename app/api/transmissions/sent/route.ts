import { db } from "@/lib/db";
import { transmissions, users } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // @ts-ignore
    const userId = session.user.id;

    const data = await db.select({
        id: transmissions.id,
        fileName: transmissions.fileName,
        fileSize: transmissions.fileSize,
        receiverName: users.name,
        receiverEmail: users.email,
        createdAt: transmissions.createdAt,
        totalChunks: transmissions.totalChunks,
        expectedChunks: transmissions.expectedChunks,
        chunkSize: transmissions.chunkSize,
    })
        .from(transmissions)
        .leftJoin(users, eq(transmissions.receiverId, users.id))
        .where(eq(transmissions.senderId, userId))
        .orderBy(desc(transmissions.createdAt))
        .all();

    return NextResponse.json(data);
}
