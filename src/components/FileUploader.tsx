"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store";
import { UploadCloud, FileType, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { UploadedFile, ColumnType } from "@/lib/types";

function inferColumnTypes(data: any[], headers: string[]): Record<string, ColumnType> {
    const types: Record<string, ColumnType> = {};
    const sampleSize = Math.min(data.length, 100);

    headers.forEach((header) => {
        let numCount = 0;
        let dateCount = 0;

        for (let i = 0; i < sampleSize; i++) {
            const val = data[i][header];
            if (val === null || val === undefined || val === '') continue;

            if (!isNaN(Number(val))) {
                numCount++;
            } else if (!isNaN(Date.parse(val))) {
                dateCount++;
            }
        }

        if (numCount > sampleSize * 0.5) types[header] = 'number';
        else if (dateCount > sampleSize * 0.5) types[header] = 'date';
        else types[header] = 'string';
    });

    return types;
}

export function FileUploader() {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const addFile = useAppStore((state) => state.addFile);

    const processData = (file: File, data: any[], headers: string[]) => {
        const types = inferColumnTypes(data, headers);

        const uploadedFile: UploadedFile = {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type || file.name.split('.').pop() || 'unknown',
            uploadDate: Date.now(),
            data,
            headers,
            columnTypes: types,
        };

        addFile(uploadedFile);
        toast.success(`Successfully uploaded ${file.name}`);
    };

    const handleFile = async (file: File) => {
        setIsProcessing(true);
        try {
            if (file.name.endsWith('.csv')) {
                Papa.parse(file, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const headers = results.meta.fields || [];
                        processData(file, results.data, headers);
                        setIsProcessing(false);
                    },
                    error: (error) => {
                        toast.error(`Error parsing CSV: ${error.message}`);
                        setIsProcessing(false);
                    }
                });
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });

                if (json.length > 0) {
                    const headers = Object.keys(json[0] as object);
                    processData(file, json, headers);
                } else {
                    toast.error('Excel file is empty.');
                }
                setIsProcessing(false);
            } else {
                toast.error('Unsupported file format. Please upload CSV or Excel files.');
                setIsProcessing(false);
            }
        } catch (e) {
            toast.error('Failed to process file.');
            setIsProcessing(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            Array.from(files).forEach(handleFile);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(handleFile);
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drag and drop your files here</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Supports .csv, .xlsx, and .xls up to 50MB
            </p>
            <div className="flex justify-center">
                <label htmlFor="file-upload">
                    <Button variant="secondary" className="cursor-pointer" asChild disabled={isProcessing}>
                        <span>{isProcessing ? "Processing..." : "Browse Files"}</span>
                    </Button>
                </label>
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    multiple
                    onChange={handleFileInput}
                    disabled={isProcessing}
                />
            </div>
        </div>
    );
}
