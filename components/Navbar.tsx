"use client";
import {Navbar, NavbarBrand, NavbarContent} from "@heroui/react";
import ThemeTabs from "@/components/ThemeToggle";
import Image from "next/image";


export default function AppNavbar() {
    return (
        <Navbar isBordered className={`fixed`}>
            <NavbarBrand className="flex items-center md:gap-2 gap-1 max-w-1/2">
                <Image src={'/logo.png'} width={80} height={80} className="w-12 h-12 bg-white rounded-full shadow-primary shadow-2xl" alt={'Logo'}/>
                <p className="font-bold text-xs md:text-sm  md:text-left whitespace-normal">
                    Shariah Support and Services
                </p>
            </NavbarBrand>

            <NavbarContent justify="end">
                <ThemeTabs/>
            </NavbarContent>
        </Navbar>
    );
}
