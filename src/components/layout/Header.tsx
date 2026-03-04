"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { ShareModal } from "@/components/ShareModal";

export function Header() {
    const files = useAppStore((state) => state.files);
    const activeFileId = useAppStore((state) => state.activeFileId);
    const activeFile = files.find(f => f.id === activeFileId);

    const totalRows = files.reduce((acc, file) => acc + (file.data?.length || 0), 0);

    return (
        <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-background/60 backdrop-blur-xl px-4 lg:h-[60px] lg:px-6 z-10 sticky top-0 shadow-sm">
            <div className="w-full flex-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {files.length > 0 ? (
                        <div className="flex items-center px-3 py-1.5 rounded-full bg-secondary/50 border border-border/40 text-xs font-medium">
                            <span className="flex h-2 w-2 rounded-full bg-chart-2 mr-2 animate-pulse"></span>
                            {files.length} {files.length === 1 ? 'file' : 'files'} loaded • {totalRows.toLocaleString()} total rows
                            {activeFile && (
                                <>
                                    <span className="mx-2 text-border">|</span>
                                    <span className="text-primary font-semibold">Active: {activeFile.name}</span>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center px-3 py-1.5 rounded-full bg-secondary/50 border border-border/40 text-xs font-medium">
                            <span className="flex h-2 w-2 rounded-full bg-muted-foreground/50 mr-2"></span>
                            No files loaded
                        </div>
                    )}
                </div>
            </div>
            <ShareModal>
                <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-md border-border/50 hover:bg-primary/10 hover:text-primary transition-all">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                </Button>
            </ShareModal>
        </header>
    );
}
