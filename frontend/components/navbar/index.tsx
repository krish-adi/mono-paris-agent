import React from "react";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";

export default function index() {
    return (
        <nav className="w-full flex justify-between items-center border-b border-b-foreground/10 py-2 px-4">
            <div className="text-md font-bold">IRREPLACABLE</div>
            <div className="flex items-center gap-2">
                <Link href="/">Home</Link>
                <Link href="/sign-in">Sign In</Link>
                <Link href="/sign-up">Sign Up</Link>
                <Link href="/u">Console</Link>
                <ThemeSwitcher />
            </div>
        </nav>
    );
}
