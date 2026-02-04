import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const info = await db.select({
        id: users.id,
        name: users.name,
    }).from(users)
        .where(eq(users.id, id))
        .get();

    return NextResponse.json(info);
}
