"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function ErrorPageSuspense() {
    return <Suspense>
        <ErrorPage />
    </Suspense>
}

function ErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration. Check if your options are correct.",
        AccessDenied: "You do not have permission to sign in.",
        Verification: "The sign in link is no longer valid. It may have been used already or it may have expired.",
        Default: "An unexpected error occurred. Please try again later.",
    };

    const errorMessage = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12 lg:px-8 text-white">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Authentication Error
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-400">
                    {errorMessage}
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <Link
                    href="/auth/login"
                    className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
