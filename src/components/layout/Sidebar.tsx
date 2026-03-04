"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    BrainCircuit,
    FileSpreadsheet,
    LayoutDashboard,
    MessageSquare,
    Settings,
    Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Files', href: '/files', icon: FileSpreadsheet },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Predictions', href: '/predictions', icon: BrainCircuit },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
    { name: 'Share', href: '/share', icon: Share2 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-muted/30">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <span className="">Nexus Analytics</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    isActive ? "bg-muted text-primary" : ""
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
