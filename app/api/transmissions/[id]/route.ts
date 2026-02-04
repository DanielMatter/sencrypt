
import { db } from "@/lib/db";
import { transmissions } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
// @ts-ignore
import fs from "fs";
import path from "path";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    // @ts-ignore
    const userId = session.user.id;

    // Verify ownership and existence
    const [transmission] = await db.select()
        .from(transmissions)
        .where(
            and(
                eq(transmissions.id, id),
                eq(transmissions.senderId, userId)
            )
        )
        .limit(1);

    if (!transmission) {
        return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    try {
        // Delete from DB
        await db.delete(transmissions)
            .where(eq(transmissions.id, id));

        // Delete from disk
        const transmissionDir = path.join(process.cwd(), "storage", transmission.id);
        if (fs.existsSync(transmissionDir)) {
            fs.rmSync(transmissionDir, { recursive: true, force: true });
        }

        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        console.error("Error deleting transmission:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
