"use server";

import { db } from "@/lib/db";
import { publicKeys, users } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- User Management (Admin Only) ---

export async function createUser(data: { name: string; email: string; canReceive: boolean }) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.insert(users).values({
        name: data.name,
        email: data.email,
        canReceive: data.canReceive,
    });

    revalidatePath("/admin");
}

export async function deleteUser(userId: string) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== "admin") {
        throw new Error("Unauthorized");
    }

    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin");
}

// --- Public Key Management ---

export async function addPublicKey(name: string, keyData: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    await db.insert(publicKeys).values({
        // @ts-ignore
        userId: session.user.id,
        name,
        keyData,
        isActive: true,
    });
    revalidatePath("/dashboard");
    revalidatePath("/keys");
}

export async function togglePublicKey(keyId: string, isActive: boolean) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    await db.update(publicKeys).set({ isActive }).where(eq(publicKeys.id, keyId));
    revalidatePath("/dashboard");
    revalidatePath("/keys");
}

export async function deletePublicKey(keyId: string) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    await db.delete(publicKeys).where(eq(publicKeys.id, keyId));
    revalidatePath("/dashboard");
    revalidatePath("/keys");
}
