import React from "react";
import { ThemeSwitcher } from "./theme-switcher";

export default function index() {
    return (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-8">
            <ThemeSwitcher />
            <p>IRREPLACABLE</p>
        </nav>
    );
}
