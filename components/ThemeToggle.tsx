"use client";

import {Tabs, Tab} from "@heroui/tabs";
import { Sun, Moon, Monitor } from "lucide-react";
import {useTheme} from "@heroui/use-theme";
import {useEffect} from "react";

export default function ThemeTabs() {
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        document.documentElement.classList.remove("light", "dark");
        setTheme(theme)
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
        >
            <Tab key="light" title={<Sun className="w-5 h-5"/> } />
            <Tab key="dark" title={<Moon className="w-5 h-5"/> } />
            <Tab key="system" title={<Monitor className="w-5 h-5"/> } />
        </Tabs>
    );
}
