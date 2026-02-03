import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { KeyIcon, ShieldCheckIcon, PaperAirplaneIcon, InboxArrowDownIcon, LinkIcon } from "@heroicons/react/24/outline";
import ReceivedFileList from "./received-list";
import SentFileList from "./sent-list";
import CopyButton from "@/components/CopyButton";
import { headers } from "next/headers";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/auth/login");
    }

    // @ts-ignore
    const userId = session.user.id;
    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const receiveUrl = `${protocol}://${host}/r/${userId}`;

    // @ts-ignore
    const isAdmin = session.user.role === "admin";
    // @ts-ignore
    const canReceive = session.user.canReceive;

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="md:flex md:items-center md:justify-between mb-12">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Welcome, {session.user.name || session.user.email}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Receive URL Card */}
                {canReceive && (
                    <div className="col-span-1 divide-y divide-white/10 rounded-lg bg-indigo-500/5 shadow ring-1 ring-white/10 transition hover:bg-indigo-500/10">
                        <div className="flex w-full items-center justify-between space-x-6 p-6">
                            <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                    <h3 className="truncate text-sm font-medium text-white">My Receive URL</h3>
                                    <span className="inline-flex shrink-0 items-center rounded-full bg-indigo-400/10 px-1.5 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/20">Active</span>
                                </div>
                                <p className="mt-2 text-sm text-zinc-400 font-mono truncate">{receiveUrl}</p>
                            </div>
                            <LinkIcon className="h-10 w-10 text-indigo-400/50" aria-hidden="true" />
                        </div>
                        <div className="-mt-px flex divide-x divide-white/10">
                            <div className="flex w-0 flex-1">
                                <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4">
                                    <CopyButton text={receiveUrl} />
                                </div>
                            </div>
                            <div className="-ml-px flex w-0 flex-1">
                                <Link href={`/r/${userId}`} className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-white hover:text-indigo-400">
                                    View Page
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Send Files Card */}
                <div className="col-span-1 divide-y divide-white/10 rounded-lg bg-white/5 shadow ring-1 ring-white/10 transition hover:bg-white/10">
                    <div className="flex w-full items-center justify-between space-x-6 p-6">
                        <div className="flex-1 truncate">
                            <div className="flex items-center space-x-3">
                                <h3 className="truncate text-sm font-medium text-white">Send Files</h3>
                                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-400/10 px-1.5 py-0.5 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/20">Secure</span>
                            </div>
                            <p className="mt-1 truncate text-sm text-zinc-400">Encrypt and send files to verified users.</p>
                        </div>
                        <PaperAirplaneIcon className="h-10 w-10 text-zinc-400" aria-hidden="true" />
                    </div>
                    <div className="-mt-px flex divide-x divide-white/10">
                        <div className="flex w-0 flex-1">
                            <Link href="/send" className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-white hover:text-indigo-400">
                                Start Transfer
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Manage Keys Card */}
                {canReceive && (
                    <div className="col-span-1 divide-y divide-white/10 rounded-lg bg-white/5 shadow ring-1 ring-white/10 transition hover:bg-white/10">
                        <div className="flex w-full items-center justify-between space-x-6 p-6">
                            <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                    <h3 className="truncate text-sm font-medium text-white">My Keys</h3>
                                </div>
                                <p className="mt-1 truncate text-sm text-zinc-400">Manage your public keys for receiving files.</p>
                            </div>
                            <KeyIcon className="h-10 w-10 text-zinc-400" aria-hidden="true" />
                        </div>
                        <div className="-mt-px flex divide-x divide-white/10">
                            <div className="flex w-0 flex-1">
                                <Link href="/keys" className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-white hover:text-indigo-400">
                                    Manage Keys
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Admin Card */}
                {isAdmin && (
                    <div className="col-span-1 divide-y divide-white/10 rounded-lg bg-white/5 shadow ring-1 ring-white/10 transition hover:bg-white/10">
                        <div className="flex w-full items-center justify-between space-x-6 p-6">
                            <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                    <h3 className="truncate text-sm font-medium text-white">Admin</h3>
                                </div>
                                <p className="mt-1 truncate text-sm text-zinc-400">Manage users and permissions.</p>
                            </div>
                            <ShieldCheckIcon className="h-10 w-10 text-zinc-400" aria-hidden="true" />
                        </div>
                        <div className="-mt-px flex divide-x divide-white/10">
                            <div className="flex w-0 flex-1">
                                <Link href="/admin" className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-white hover:text-indigo-400">
                                    Admin Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* File Lists Section */}
            <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Received Files Section (for receivers) */}
                {canReceive && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <h3 className="text-xl font-bold text-white">Received Files</h3>
                            <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">Incoming</span>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm shadow-inner">
                            <ReceivedFileList />
                        </div>
                    </div>
                )}

                {/* Sent Files Section */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white">Sent Files</h3>
                        <span className="inline-flex items-center rounded-full bg-indigo-400/10 px-2 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/20">Outgoing</span>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm shadow-inner">
                        <SentFileList />
                    </div>
                </div>
            </div>
        </div>
    );
}
