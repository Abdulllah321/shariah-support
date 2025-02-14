import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeProvider";
import { ReactNode } from "react";

// Importing the Raleway font
const raleway = Raleway({
    variable: "--font-raleway",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"], // Adjust weights as needed
});

export const metadata: Metadata = {
    title: "Shariah Support and Services",
    description: "Comprehensive Shariah compliance support and services for businesses and individuals.",
    keywords: [
        "Shariah compliance",
        "Islamic finance",
        "Halal certification",
        "Shariah advisory",
        "Islamic services",
    ],
    authors: [{ name: "Abdullah Sufyan" }],
    creator: "Abdullah Sufyan",
    publisher: "Roshan Digital Hub",
    openGraph: {
        title: "Shariah Support and Services",
        description: "Expert Shariah compliance support and services for your needs.",
        url: "https://www.shariahsupportservices.com", // Replace with your actual URL
        siteName: "Shariah Support and Services",
        images: [
            {
                url: "https://www.shariahsupportservices.com/og-image.jpg", // Replace with your actual image URL
                width: 1200,
                height: 630,
                alt: "Shariah Support and Services",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Shariah Support and Services",
        description: "Expert Shariah compliance support and services for your needs.",
        creator: "@AbdullahSufyan", // Replace with your actual Twitter handle
        images: ["https://www.shariahsupportservices.com/twitter-image.jpg"], // Replace with your actual image URL
    },
    robots: {
        index: true,
        follow: true,
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
        shortcut: "/shortcut-icon.png",
    },
    manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <body
            className={`${raleway.variable} bg-background min-h-screen`}
        >
        <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
