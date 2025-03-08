"use client";

import { Tabs, Tab } from "@heroui/tabs";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@heroui/use-theme";
import { useEffect } from "react";

export default function ThemeTabs() {
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        document.documentElement.classList.remove("light", "dark");
        setTheme(theme);
    }, []);

    const handleThemeChange = (key: string) => {
        document.documentElement.classList.remove("light", "dark");
        setTheme(key);
    };

    return (
        <Tabs
            aria-label="Theme Switcher"
            selectedKey={theme}
            onSelectionChange={(key) => handleThemeChange(key as string)}
            variant="bordered"
            className="space-x-1 sm:space-x-2" // Reduce spacing between tabs on small screens
        >
            <Tab
                key="light"
                title={<Sun className="w-4 h-4 sm:w-5 sm:h-5" />} // Smaller icon on mobile
                className="px-2 py-1 sm:px-3 sm:py-2" // Smaller padding on mobile
            />
            <Tab
                key="dark"
                title={<Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="px-2 py-1 sm:px-3 sm:py-2"
            />
            <Tab
                key="system"
                title={<Monitor className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="px-2 py-1 sm:px-3 sm:py-2"
            />
        </Tabs>
    );
}
