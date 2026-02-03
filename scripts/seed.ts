import { db } from "../lib/db";
import { users } from "../lib/schema";
import { eq } from "drizzle-orm";

async function main() {
    const email = "daniel.matter@tum.de";
    const existing = await db.select().from(users).where(eq(users.email, email)).get();

    if (!existing) {
        await db.insert(users).values({
            name: "Daniel Matter",
            email: email,
            role: "admin",
            canReceive: true,
        });
        console.log(`Created admin user: ${email}`);
    } else {
        console.log(`Admin user already exists: ${email}`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
