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
        <header className="flex h-14 items-center gap-4 border-b bg-muted/30 px-4 lg:h-[60px] lg:px-6 z-10">
            <div className="w-full flex-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {files.length > 0 ? (
                        <span className="font-medium">
                            {files.length} {files.length === 1 ? 'file' : 'files'} loaded • {totalRows.toLocaleString()} total rows
                            {activeFile && <span className="ml-2 text-primary">Active: {activeFile.name}</span>}
                        </span>
                    ) : (
                        <span>No files loaded</span>
                    )}
                </div>
            </div>
            <ShareModal>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                </Button>
            </ShareModal>
        </header>
    );
}
