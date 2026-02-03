# sencrypt

Sencrypt is a Next.js web app for sending encrypted files between approved users. Files are chunked and encrypted on-device, uploaded as encrypted chunks, and decrypted locally by the receiver with a private key. The server never stores private keys.

## Stack

- Next.js + Tailwind
- NextAuth magic-link auth (NodeMailer)
- Drizzle ORM + SQLite
- File System Access API for persistent local chunk storage

## Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local` and set values.
3. Create your first user:

```bash
node scripts/seed.mjs --email you@example.com --username you --can-receive
```

## Running

```bash
npm run dev
```

## Environment variables

Required:

- `DB_PATH`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`
 
Optional (dev only):

- `STUB_LOGIN_ENABLED` (set `true` to enable credentials-based stub login)
- `STUB_LOGIN_EMAIL` (email to auto-login as)
- `STUB_LOGIN_CAN_RECEIVE` (whether the stub user can receive files)
- `NEXT_PUBLIC_STUB_LOGIN` (set `true` to show the stub login button)

Optional:

- `STORAGE_PATH` (defaults to `./storage`)

## Notes

- Public keys must be OpenSSH `ssh-rsa` format.
- For decryption, private keys must be PKCS#8. OpenSSH private keys are converted client-side using a WASM helper when available.
