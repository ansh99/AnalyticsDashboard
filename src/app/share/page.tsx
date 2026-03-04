"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { decodeShareSnapshot } from "@/lib/share";
import { AppState, UploadedFile } from "@/lib/types";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function SharePageContent() {
    const searchParams = useSearchParams();
    const dataParam = searchParams.get('data');
    const [snapshot, setSnapshot] = useState<Partial<AppState> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (dataParam) {
            setTimeout(() => {
                const decoded = decodeShareSnapshot(dataParam);
                setSnapshot(decoded);
                setIsLoading(false);
            }, 500); // simulate loading
        } else {
            setIsLoading(false);
        }
    }, [dataParam]);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-center">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold">Loading Shared Context...</h2>
            </div>
        );
    }

    if (!snapshot || !snapshot.files || snapshot.files.length === 0) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-center max-w-md mx-auto">
                <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">Invalid or Missing Share Link</h2>
                <p className="text-muted-foreground mb-6">
                    The provided data snapshot could not be loaded or is corrupted.
                </p>
                <Button asChild>
                    <Link href="/">
                        Go to Dashboard
                    </Link>
                </Button>
            </div>
        );
    }

    const activeFile = snapshot.files.find(f => f.id === snapshot.activeFileId) || snapshot.files[0];

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto mt-4 px-4 pb-12">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">VIEW ONLY</span>
                        Shared Analysis Snapshot
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        You are viewing a shared snapshot. AI features and editing are disabled.
                    </p>
                </div>
                <Button asChild variant="default">
                    <Link href="/">Create Your Own Analysis</Link>
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Dataset Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Filename</p>
                                <p className="font-medium">{activeFile.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Rows</p>
                                <p className="font-medium">{activeFile.data.length.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Columns</p>
                                <p className="font-medium">{activeFile.headers.length.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Generated</p>
                                <p className="font-medium">{new Date(activeFile.uploadDate).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {activeFile.headers.slice(0, 10).map((header, i) => (
                                                <TableHead key={i} className="whitespace-nowrap">{header}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeFile.data.slice(0, 5).map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {activeFile.headers.slice(0, 10).map((header, colIndex) => (
                                                    <TableCell key={colIndex} className="whitespace-nowrap truncate max-w-[150px]">
                                                        {String(row[header] ?? '')}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                            Showing first 5 rows of {activeFile.data.length.toLocaleString()} total rows.
                            Sign up or upload your own file to run full analytics.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SharePage() {
    return (
        <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>}>
            <SharePageContent />
        </Suspense>
    )
}
