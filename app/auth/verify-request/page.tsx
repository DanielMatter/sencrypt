"use client";

export default function VerifyRequestPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12 lg:px-8 text-white">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Check your email
                </h2>
                <p className="mt-4 text-center text-base text-zinc-300">
                    A sign-in link has been sent to your email address.
                </p>
                <p className="mt-2 text-center text-sm text-zinc-400">
                    Please click the link in the email to sign in to your account.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="rounded-md bg-indigo-500/10 p-4 border border-indigo-500/20">
                    <div className="flex">
                        <div className="shrink-0">
                            <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-indigo-300">
                                If you don't see the email, check your spam folder.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
