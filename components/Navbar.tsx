"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
    HomeIcon,
    PaperAirplaneIcon,
    KeyIcon,
    ShieldCheckIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    if (!session) return null;

    // @ts-ignore
    const isAdmin = session.user?.role === "admin";
    // @ts-ignore
    const canReceive = session.user?.canReceive;

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
        { name: "Send Files", href: "/send", icon: PaperAirplaneIcon },
    ];

    if (canReceive) {
        navigation.push({ name: "My Keys", href: "/keys", icon: KeyIcon });
    }

    if (isAdmin) {
        navigation.push({ name: "Admin", href: "/admin", icon: ShieldCheckIcon });
    }

    const isActive = (href: string) => pathname === href;

    return (
        <nav className="bg-zinc-950 border-b border-white/10 sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="shrink-0 items-center flex">
                            <Link href="/" className="text-xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                Sencrypt
                            </Link>
                        </div>
                        <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${isActive(item.href)
                                        ? "border-indigo-500 text-white"
                                        : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="flex items-center gap-x-2 rounded-md bg-white/5 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/10 ring-1 ring-inset ring-white/10 transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 text-zinc-400" />
                            Sign Out
                        </button>
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-white focus:outline-none"
                        >
                            {isOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden bg-zinc-900 border-b border-white/10">
                    <div className="space-y-1 pb-3 pt-2 px-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-x-3 rounded-md px-3 py-2 text-base font-medium ${isActive(item.href)
                                    ? "bg-indigo-500/10 text-indigo-400"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <item.icon className="h-6 w-6" aria-hidden="true" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
                        >
                            <ArrowRightOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}
