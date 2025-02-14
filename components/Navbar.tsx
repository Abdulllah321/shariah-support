"use client";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import ThemeTabs from "@/components/ThemeToggle";

export const AcmeLogo = ({ size, className }: { size: string; className?: string }) => {
    return (
        <svg
            fill="none"
            height={size}
            viewBox="0 0 32 32"
            width={size}
            className={className}
        >
            <path
                clipRule="evenodd"
                d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
                fill="currentColor"
                fillRule="evenodd"
            />
        </svg>
    );
};

export default function AppNavbar() {
    return (
        <Navbar isBordered className={`fixed`}>
            <NavbarBrand className="flex items-center md:gap-2 gap-1 max-w-1/2">
                <AcmeLogo size="48" className="w-16 h-16" />
                <p className="font-bold text-xs md:text-sm  md:text-left whitespace-normal">
                    Shariah Support and Services
                </p>
            </NavbarBrand>

            <NavbarContent justify="end">
                <ThemeTabs />
            </NavbarContent>
        </Navbar>
    );
}
