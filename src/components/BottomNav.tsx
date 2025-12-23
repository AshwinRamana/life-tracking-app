"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, Heart, BookOpen, MessageSquare } from "lucide-react";
import { clsx } from "clsx";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/home", label: "Home", icon: Home },
        { href: "/food", label: "Food Log", icon: Utensils },
        { href: "/health", label: "Health", icon: Heart },
        { href: "/journal", label: "Journal", icon: BookOpen },
        { href: "/ai", label: "AI Assistant", icon: MessageSquare },
    ];

    if (pathname === "/") return null;

    return (
        <div className="absolute bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white pb-safe pt-2">
            <nav className="flex items-center justify-around px-2 pb-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center space-y-1 p-2 transition-colors",
                                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
