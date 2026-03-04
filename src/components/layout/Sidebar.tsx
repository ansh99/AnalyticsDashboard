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
        <div className="flex h-full w-64 flex-col border-r border-border/50 bg-sidebar/70 backdrop-blur-xl shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all">
            <div className="flex h-14 items-center border-b border-border/50 px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="flex items-center justify-center p-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_15px_-3px_var(--primary)] text-primary">
                        <BrainCircuit className="h-5 w-5" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent font-bold">Nexus Analytics</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-300 hover:text-foreground",
                                    isActive
                                        ? "bg-primary/15 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-primary/20 backdrop-blur-md"
                                        : "hover:bg-muted/50 border border-transparent"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
