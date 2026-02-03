import Link from "next/link";
import { ShieldCheckIcon, PaperAirplaneIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="relative isolate pt-14">
      {/* Hero Section */}
      <div className="py-24 sm:py-32 lg:pb-40 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-zinc-400 ring-1 ring-white/10 hover:ring-white/20">
                On-device encryption now active.{" "}
                <Link href="/dashboard" className="font-semibold text-indigo-400">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-linear-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Secure File Transfer, Reimagined.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Sencrypt enables lightning-fast, end-to-end encrypted file sharing.
              Your files are encrypted on-device before they ever touch our servers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200"
              >
                Start Sending
              </Link>
              <Link href="/dashboard" className="text-sm font-semibold leading-6 text-white hover:text-zinc-300">
                View Dashboard <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div id="features" className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-400">Secure by Design</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything You Need for Secure Transfer
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3 text-left">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <LockClosedIcon className="h-5 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    On-Device Encryption
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                    <p className="flex-auto">
                      Files are encrypted using AES-256 directly in your browser. We never see your raw data or your keys.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <PaperAirplaneIcon className="h-5 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    Massive Chunking
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                    <p className="flex-auto">
                      Large files are split into 10MB encrypted chunks for reliable, resumable uploads.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <ShieldCheckIcon className="h-5 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    Verified Recipients
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-zinc-400">
                    <p className="flex-auto">
                      Only users with a verified public key can receive files, ensuring your data always reaches the right hands.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Background Blob */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}