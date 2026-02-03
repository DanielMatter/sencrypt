"use client";

import {
    LockClosedIcon,
    KeyIcon,
    CloudArrowUpIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    ArrowLongDownIcon
} from "@heroicons/react/24/outline";

const steps = [
    {
        title: "Client-Side Encryption",
        description: "Your file is split into 10MB chunks and encrypted using AES-256-GCM directly in your browser. Raw data never leaves your device.",
        icon: LockClosedIcon,
    },
    {
        title: "Secure Key Wrapping",
        description: "A random session key is generated and then 'wrapped' using the recipient's RSA-OAEP Public Key. Only they can unlock it.",
        icon: KeyIcon,
    },
    {
        title: "Encrypted Transfer",
        description: "Only encrypted blobs and the wrapped session key are uploaded to our servers. We have zero knowledge of your content.",
        icon: CloudArrowUpIcon,
    },
    {
        title: "Peer-to-Peer Privacy",
        description: "The recipient uses their Private Key to unwrap the session key and decrypt chunks back into the original file.",
        icon: ShieldCheckIcon,
    },
];

export default function EncryptionFlow() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-base font-semibold leading-7 text-indigo-400">Deep Dive</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        How Sencrypt Protects Your Data
                    </p>
                    <p className="mt-6 text-lg leading-8 text-zinc-400">
                        We use industry-standard hybrid encryption to ensure that your files are only accessible to you and your intended recipient.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line (Desktop) */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 hidden lg:block" />

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 relative group">
                        {steps.map((step, index) => (
                            <div key={step.title} className="relative flex flex-col items-center text-center">
                                {/* Icon Container */}
                                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all duration-300 shadow-2xl backdrop-blur-xl">
                                    <step.icon className="h-10 w-10 text-indigo-400" aria-hidden="true" />
                                </div>

                                {/* Step Content */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm leading-6 text-zinc-400">{step.description}</p>
                                </div>

                                {/* Mobile Arrow */}
                                {index < steps.length - 1 && (
                                    <div className="lg:hidden mt-8 text-zinc-700">
                                        <ArrowLongDownIcon className="h-8 w-8 animate-bounce" />
                                    </div>
                                )}

                                {/* Desktop Arrow Overlay (Optional/Decorative) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-10 -right-6 z-20 text-indigo-500/30">
                                        <ArrowRightIcon className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
