import Link from "next/link";
import { ShieldCheckIcon, PaperAirplaneIcon, LockClosedIcon, CheckIcon } from "@heroicons/react/24/outline";
import EncryptionFlow from "@/components/EncryptionFlow";

const highlights = [
  "No account required for recipients",
  "Files automatically expire",
  "Unlimited file size (chunked transfer)",
  "Works on all modern browsers",
  "Open source & transparent",
  "No data tracking or cookies"
];

export default function Home() {
  return (
    <div className="relative isolate pt-14 bg-zinc-950 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-500/10 via-zinc-950 to-zinc-950" />

      {/* Hero Section */}
      <div className="py-24 sm:py-32 lg:pb-40 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-zinc-400 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300 backdrop-blur-sm">
                On-device encryption now active.{" "}
                <Link href="/dashboard" className="font-semibold text-indigo-400 ml-1">
                  Read more <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-7xl bg-linear-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent pb-2">
              Secure File Transfer, Reimagined.
            </h1>
            <p className="mt-8 text-lg leading-8 text-zinc-400 max-w-xl mx-auto">
              Sencrypt enables lightning-fast, end-to-end encrypted file sharing.
              Your files are encrypted on-device before they ever touch our servers.
            </p>
            <div className="mt-12 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-full bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-300 hover:scale-105"
              >
                Start Sending Files
              </Link>
              <Link
                href="https://github.com/danielmatter/sencrypt"
                target="_blank"
                className="rounded-full bg-white/5 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-white/10 ring-1 ring-inset ring-white/10 transition-all duration-300"
              >
                View on GitHub
              </Link>
              <Link href="#features" className="hidden sm:block text-sm font-semibold leading-6 text-zinc-300 hover:text-white transition-colors">
                How it works <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-4 items-center justify-center opacity-40 grayscale filter hover:grayscale-0 transition-all duration-700">
            {/* Mock "Trusted by" or tech labels */}
            <div className="text-center font-mono text-sm">WEB CRYPTO</div>
            <div className="text-center font-mono text-sm">AES-GCM</div>
            <div className="text-center font-mono text-sm">RSA-OAEP</div>
            <div className="text-center font-mono text-sm">TYPESCRIPT</div>
            <div className="text-center font-mono text-sm">NEXT.JS</div>
            <div className="text-center font-mono text-sm">OPEN SOURCE</div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div id="features" className="py-24 sm:py-32 bg-white/5 backdrop-blur-3xl ring-1 ring-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">Security First</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything You Need for Secure Transfer
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col bg-zinc-900/50 p-8 rounded-2xl ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <LockClosedIcon className="h-6 w-6 flex-none text-indigo-400" aria-hidden="true" />
                  On-Device Encryption
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                  <p className="flex-auto">
                    Files are encrypted using AES-256 directly in your browser. Our servers only see encrypted blobs. Your privacy is mathematically guaranteed.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col bg-zinc-900/50 p-8 rounded-2xl ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <PaperAirplaneIcon className="h-6 w-6 flex-none text-indigo-400" aria-hidden="true" />
                  Large File Support
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                  <p className="flex-auto">
                    Sending a 4GB file? No problem. Sencrypt splits large files into 10MB encrypted chunks for reliable, resumable, and ultra-fast uploads.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col bg-zinc-900/50 p-8 rounded-2xl ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all duration-300">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <ShieldCheckIcon className="h-6 w-6 flex-none text-indigo-400" aria-hidden="true" />
                  Verified Recipients
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                  <p className="flex-auto">
                    Only users with a registered public key can receive files. This ensures your data doesn't just go to a link, it goes to a person.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Flow Visualization Section */}
      <EncryptionFlow />

      {/* Trust Checklist */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl bg-indigo-600/5 p-8 ring-1 ring-indigo-500/20 lg:p-12">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Why choose Sencrypt?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-x-3">
                  <div className="flex-none rounded-full bg-indigo-500/10 p-1">
                    <CheckIcon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                  </div>
                  <span className="text-zinc-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-x-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Create your first secure link <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Sencrypt. Built with security in mind.
          </div>
          <div className="flex gap-x-8">
            <Link href="https://github.com/danielmatter/sencrypt" className="text-zinc-400 hover:text-white transition-colors">GitHub</Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Decorative Background Blobs */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 px-24"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-indigo-500 to-cyan-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}