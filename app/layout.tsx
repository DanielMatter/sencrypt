import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Sencrypt - Secure File Transfer",
    description: "End-to-end encrypted file sharing for professionals.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full bg-zinc-950">
            <body className={`${inter.className} h-full antialiased text-zinc-100 selection:bg-indigo-500 selection:text-white`}>
                <Providers>
                    {/* Background Effects */}
                    <div className="fixed inset-0 -z-10 h-full w-full bg-zinc-950">
                        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                    </div>

                    <Navbar />
                    <main className="min-h-full">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
