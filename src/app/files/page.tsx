"use client";

import { useAppStore } from "@/store";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, FileSpreadsheet, Database } from "lucide-react";

export default function FilesPage() {
    const files = useAppStore((state) => state.files);
    const removeFile = useAppStore((state) => state.removeFile);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Data Source</h1>
                <p className="text-muted-foreground">Upload and manage your datasets for analysis.</p>
            </div>

            <FileUploader />

            {files.length > 0 && (
                <div className="grid gap-4 mt-4">
                    <h2 className="text-xl font-semibold">Uploaded Files</h2>
                    {files.map((file) => (
                        <Card key={file.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                                        {file.name}
                                    </CardTitle>
                                    <CardDescription>
                                        {formatFileSize(file.size)} • Uploaded {new Date(file.uploadDate).toLocaleTimeString()}
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)} className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <Database className="h-4 w-4" />
                                        {file.data.length.toLocaleString()} rows
                                    </div>
                                    <div>
                                        {file.headers.length} columns
                                    </div>
                                </div>

                                <div className="rounded-md border overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {file.headers.slice(0, 8).map((header, i) => (
                                                        <TableHead key={i} className="whitespace-nowrap">
                                                            {header}
                                                            <span className="block text-[10px] text-muted-foreground font-normal">
                                                                {file.columnTypes[header]}
                                                            </span>
                                                        </TableHead>
                                                    ))}
                                                    {file.headers.length > 8 && (
                                                        <TableHead>...</TableHead>
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {file.data.slice(0, 3).map((row, rowIndex) => (
                                                    <TableRow key={rowIndex}>
                                                        {file.headers.slice(0, 8).map((header, colIndex) => (
                                                            <TableCell key={colIndex} className="whitespace-nowrap truncate max-w-[150px]">
                                                                {String(row[header] ?? '')}
                                                            </TableCell>
                                                        ))}
                                                        {file.headers.length > 8 && (
                                                            <TableCell>...</TableCell>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
