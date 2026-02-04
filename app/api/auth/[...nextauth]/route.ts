import NextAuth, { AuthOptions } from "next-auth";
import EmailProvider, { SendVerificationRequestParams } from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/schema";
import { eq } from "drizzle-orm";
import nodemailer from 'nodemailer';
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const port = parseInt(process.env.EMAIL_SERVER_PORT || '465');

const transporterConfig: SMTPTransport.Options = {
    host: process.env.EMAIL_SERVER_HOST,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
};
const transporter = nodemailer.createTransport(transporterConfig);

// Send the mail via nodemailer
async function sendMail(params: SendVerificationRequestParams) {
    const loginUrl = params.url;
    const email = params.identifier;
    const expires = params.expires;

    const textVersion = `
        Welcome to Sencrypt!

        You requested to sign in to Sencrypt on ${process.env.NEXTAUTH_URL}

        Click here to sign in: ${loginUrl}

        This link will expire in ${expires.toISOString()}.
    `;

    const htmlVersion = `
        <h1>Welcome to Sencrypt!</h1>

        <p>You requested to sign in to Sencrypt.</p>

        <a href="${loginUrl}">Click here to sign in</a>

        <p>This link will expire in ${expires.toISOString()}.</p>
    `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Sign in to Sencrypt",
        text: textVersion,
        html: htmlVersion,
    });
}

export const authOptions: AuthOptions = {
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }) as any,
    // We cast to any because of potential minor type mismatches with the Adapter interface 
    // vs SQLite schema definitions, but structurally it matches.

    providers: [
        EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest(params) {
                await sendMail(params);
            },
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            // Explicitly prevent sign in if user doesn't exist in our 'users' table.
            // Note: The adapter might create the user entry in the DB *before* this callback 
            // if configured to do so for new users, but for Email provider, 
            // the user must usually exist or be created during the flow.
            // However, we want to restrict to *pre-existing* admins/users.

            if (!user.email) return false;
            const existingUser = await db.select().from(users).where(eq(users.email, user.email)).get();
            if (!existingUser) {
                console.log(`Login attempt rejected for non-existent user: ${user.email}`);
                return false;
            }

            return true;
        },
        async session({ session }) {
            if (session.user?.email) {
                const dbUser = await db.select().from(users).where(eq(users.email, session.user.email)).get();
                if (dbUser) {
                    // @ts-ignore
                    session.user.id = dbUser.id;
                    // @ts-ignore
                    session.user.role = dbUser.role;
                    // @ts-ignore
                    session.user.canReceive = dbUser.canReceive;
                }
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
