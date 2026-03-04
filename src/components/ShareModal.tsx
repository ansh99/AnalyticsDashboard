"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { createShareSnapshot } from "@/lib/share";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Share2, FileImage, FileText } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface ShareModalProps {
    children: React.ReactNode;
}

export function ShareModal({ children }: ShareModalProps) {
    const state = useAppStore();
    const [shareUrl, setShareUrl] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setIsGenerating(true);
            setTimeout(() => {
                try {
                    const snapshot = createShareSnapshot(state);
                    const url = `${window.location.origin}/share?data=${snapshot}`;
                    setShareUrl(url);
                } catch (e) {
                    toast.error("Failed to generate share link. Data might be too large.");
                } finally {
                    setIsGenerating(false);
                }
            }, 100);
        }
    };

    const copyToClipboard = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
        } catch (e) {
            toast.error("Failed to copy link");
        }
    };

    const exportPNG = async () => {
        try {
            toast.info("Generating PNG...");
            // Try to capture main content element
            const element = document.querySelector('main') as HTMLElement;
            if (!element) throw new Error("Could not find content to export");

            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = imgData;
            link.download = `nexus_analytics_${Date.now()}.png`;
            link.click();
            toast.success("Dashboard exported as PNG");
        } catch (e) {
            toast.error("Export failed. Make sure you are on a dashboard page.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Analysis</DialogTitle>
                    <DialogDescription>
                        Create a read-only snapshot or export your current view.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="link" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="link">Link</TabsTrigger>
                        <TabsTrigger value="export">Export</TabsTrigger>
                    </TabsList>
                    <TabsContent value="link" className="space-y-4 py-4">
                        <div className="rounded-md bg-muted p-3">
                            <p className="text-sm font-medium mb-1 truncate">
                                {isGenerating ? "Generating link..." : shareUrl || "Data too large for URL sharing."}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                This link encodes a snapshot of your currently uploaded data.
                                Anyone with the link can view your analysis, but they cannot edit or chat with AI.
                            </p>
                        </div>
                        <Button className="w-full gap-2" onClick={copyToClipboard} disabled={isGenerating || !shareUrl}>
                            <Copy className="h-4 w-4" /> Copy Shareable Link
                        </Button>
                    </TabsContent>
                    <TabsContent value="export" className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="h-24 flex-col gap-2 relative overflow-hidden group" onClick={exportPNG}>
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <FileImage className="h-8 w-8 text-primary" />
                                <span className="font-semibold">Export as PNG</span>
                            </Button>
                            <Button variant="outline" className="h-24 flex-col gap-2 relative overflow-hidden group" disabled onClick={() => toast.info('PDF export coming soon. Use browser print for now.')}>
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <FileText className="h-8 w-8 text-primary" />
                                <span className="font-semibold text-muted-foreground line-through">Export as PDF</span>
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
