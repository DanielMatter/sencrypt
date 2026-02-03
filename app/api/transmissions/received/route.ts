import { db } from "@/lib/db";
import { transmissions, users } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
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
        senderName: users.name,
        senderEmail: users.email,
        createdAt: transmissions.createdAt,
        totalChunks: transmissions.totalChunks,
        encryptedKey: transmissions.encryptedKey,
    })
        .from(transmissions)
        .leftJoin(users, eq(transmissions.senderId, users.id))
        .where(eq(transmissions.receiverId, userId))
        .orderBy(desc(transmissions.createdAt))
        .all();

    return NextResponse.json(data);
}
