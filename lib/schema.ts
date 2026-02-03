import { sqliteTable, text, integer, int, primaryKey } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import type { AdapterAccount } from "next-auth/adapters";

export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
    image: text("image"),
    role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),
    canReceive: integer("can_receive", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const accounts = sqliteTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = sqliteTable("session", {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);

export const publicKeys = sqliteTable("public_keys", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    name: text("name").notNull(),
    keyData: text("key_data").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const transmissions = sqliteTable("transmissions", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    senderId: text("sender_id").references(() => users.id).notNull(),
    receiverId: text("receiver_id").references(() => users.id).notNull(),
    fileName: text("file_name").notNull(),
    fileSize: int("file_size").notNull(),
    totalChunks: int("total_chunks").notNull(),
    encryptedKey: text("encrypted_key"), // The AES key encrypted with the recipient's public key
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
