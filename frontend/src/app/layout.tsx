import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import "material-symbols/outlined.css";
import { Providers } from "@/app/providers";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    display: "swap",
});

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
    display: "swap",
});

export const metadata: Metadata = {
    title: "SortMail — AI Email Intelligence",
    description:
        "AI-powered intelligence layer for your inbox. Summarize, categorize, and automate your email flow.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}
        >
            <body className="font-body antialiased bg-background text-on-surface">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
