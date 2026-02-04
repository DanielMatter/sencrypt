import { db } from "@/lib/db";
import { publicKeys } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { addPublicKey, deletePublicKey, togglePublicKey } from "../actions";
import { eq, desc } from "drizzle-orm";

export default async function KeysPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/auth/login");
    }

    // @ts-ignore
    const userKeys = await db.select().from(publicKeys).where(eq(publicKeys.userId, session.user.id)).orderBy(desc(publicKeys.createdAt)).all();

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">My Public Keys</h2>
                </div>
            </div>

            <div className="bg-white/5 shadow ring-1 ring-white/10 sm:rounded-lg p-6 mb-8">
                <h3 className="text-base font-semibold leading-7 text-white mb-4">How to Generate RSA Keys</h3>
                <p>
                    To receive files via Sencrypt, you need at least one pair public / private RSA keypair.
                </p>
            </div>

            <div className="bg-white/5 shadow ring-1 ring-white/10 sm:rounded-lg p-6 mb-8">
                <h3 className="text-base font-semibold leading-7 text-white mb-4">Add New Key</h3>
                <form action={async (formData) => {
                    "use server";
                    const name = formData.get("name") as string;
                    const keyData = formData.get("keyData") as string;
                    await addPublicKey(name, keyData);
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium leading-6 text-zinc-300">Key Name</label>
                        <input name="name" type="text" required placeholder="e.g. My Laptop" className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-3" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium leading-6 text-zinc-300">SSH Public Key</label>
                        <textarea name="keyData" rows={3} required placeholder="ssh-rsa AAAAB3Nza..." className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-3 font-mono text-xs" />
                    </div>
                    <button type="submit" className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Add Key</button>
                </form>
            </div>

            <ul role="list" className="divide-y divide-white/10 rounded-md border border-white/10 bg-white/5">
                {userKeys.map((key) => (
                    <li key={key.id} className="flex items-center justify-between gap-x-6 py-5 px-6">
                        <div className="min-w-0">
                            <div className="flex items-start gap-x-3">
                                <p className="text-sm font-semibold leading-6 text-white">{key.name}</p>
                                <p className={`rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${key.isActive ? 'text-green-400 bg-green-400/10 ring-green-400/20' : 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20'}`}>
                                    {key.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-zinc-400">
                                <p className="truncate font-mono max-w-md">{key.keyData.substring(0, 50)}...</p>
                            </div>
                        </div>
                        <div className="flex flex-none items-center gap-x-4">
                            <form action={async () => {
                                "use server";
                                await togglePublicKey(key.id, !key.isActive);
                            }}>
                                <button type="submit" className="hidden rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 sm:block">
                                    {key.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </form>
                            <form action={async () => {
                                "use server";
                                await deletePublicKey(key.id);
                            }}>
                                <button type="submit" className="hidden rounded-md bg-red-500/10 px-2.5 py-1.5 text-sm font-semibold text-red-400 shadow-sm hover:bg-red-500/20 sm:block">Delete</button>
                            </form>
                        </div>
                    </li>
                ))}
                {userKeys.length === 0 && (
                    <li className="py-5 px-6 text-center text-sm text-zinc-500">No public keys added yet.</li>
                )}
            </ul>
        </div>
    );
}
