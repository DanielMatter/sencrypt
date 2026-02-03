import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const receivers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email
    }).from(users).where(eq(users.canReceive, true)).all();

    return NextResponse.json(receivers);
}
