// app/providers.tsx
"use client";

import {HeroUIProvider} from '@heroui/react'
import {ThemeProvider as NextThemesProvider} from "next-themes";
import {ReactNode} from "react";

export function ThemeProvider({children}: { children: ReactNode }) {
    return (
        <HeroUIProvider>
            <NextThemesProvider attribute="class" defaultTheme={`system`}>
                {children}
            </NextThemesProvider>
        </HeroUIProvider>
    )
}
