import { db } from "@/lib/db";
import { publicKeys } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const keys = await db.select({
        id: publicKeys.id,
        name: publicKeys.name,
        keyData: publicKeys.keyData
    }).from(publicKeys)
        .where(and(
            eq(publicKeys.userId, id),
            eq(publicKeys.isActive, true)
        ))
        .all();

    return NextResponse.json(keys);
}
