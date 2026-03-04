"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import { computeStats, computeCorrelation, getNumericColumns, getHistogramData, getMissingValuesAnalysis } from "@/lib/stats";
import { ChartCard } from "@/components/ChartCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Activity, Sigma, Hash, Percent, FunctionSquare, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: any, description?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}

export default function AnalyticsPage() {
    const { files, activeFileId, setActiveFile } = useAppStore();
    const activeFile = files.find(f => f.id === activeFileId) || files[0];

    const [selectedColumn, setSelectedColumn] = useState<string>('');
    const [distColumn, setDistColumn] = useState<string>('');

    const numericColumns = useMemo(() => {
        if (!activeFile) return [];
        return getNumericColumns(activeFile.headers, activeFile.columnTypes);
    }, [activeFile]);

    // Set default columns when file changes
    useMemo(() => {
        if (numericColumns.length > 0) {
            if (!numericColumns.includes(selectedColumn)) setSelectedColumn(numericColumns[0]);
            if (!numericColumns.includes(distColumn)) setDistColumn(numericColumns[0]);
        } else {
            setSelectedColumn('');
            setDistColumn('');
        }
    }, [numericColumns]);

    const stats = useMemo(() => {
        if (!activeFile || !selectedColumn) return null;
        return computeStats(activeFile.data, selectedColumn);
    }, [activeFile, selectedColumn]);

    const histogramData = useMemo(() => {
        if (!activeFile || !distColumn) return [];
        return getHistogramData(activeFile.data, distColumn, 15);
    }, [activeFile, distColumn]);

    const missingValues = useMemo(() => {
        if (!activeFile) return [];
        return getMissingValuesAnalysis(activeFile.data, activeFile.headers);
    }, [activeFile]);

    const correlationMatrix = useMemo(() => {
        if (!activeFile || numericColumns.length === 0) return { columns: [], matrix: [] };
        const maxCols = numericColumns.slice(0, 8); // Limit to 8 for UI simplicity
        const matrix = maxCols.map(colA => {
            return maxCols.map(colB => computeCorrelation(activeFile.data, colA, colB));
        });
        return { columns: maxCols, matrix };
    }, [activeFile, numericColumns]);

    if (!activeFile) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-center">
                <LayoutTemplate className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold">No data to analyze</h2>
                <p className="text-muted-foreground">Please upload a file in the Files section first.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
                    <p className="text-muted-foreground">Explore statistics, distributions, and correlations.</p>
                </div>

                {files.length > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Dataset:</span>
                        <Select value={activeFile.id} onValueChange={setActiveFile}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select dataset" />
                            </SelectTrigger>
                            <SelectContent>
                                {files.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {numericColumns.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    No numeric columns found in this dataset for continuous analysis.
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="col-span-full mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Column to analyze:</span>
                                <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                                    <SelectTrigger className="w-[250px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {stats && (
                            <>
                                <StatCard title="Mean (Average)" value={stats.mean.toFixed(2)} icon={Sigma} />
                                <StatCard title="Median" value={stats.median.toFixed(2)} icon={Activity} />
                                <StatCard title="Standard Deviation" value={stats.stdDev.toFixed(2)} icon={FunctionSquare} />
                                <StatCard title="Min / Max" value={`${stats.min.toFixed(1)} / ${stats.max.toFixed(1)}`} icon={Hash} />
                            </>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <ChartCard title="Data Distribution" description="Histogram of the selected variable">
                            <div className="flex justify-end mb-4">
                                <Select value={distColumn} onValueChange={setDistColumn}>
                                    <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="h-[300px] w-full mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={histogramData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                                        <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #ccc' }}
                                        />
                                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard title="Correlation Matrix" description="Pearson correlation between key numeric fields">
                            <div className="overflow-x-auto mt-2 h-[300px]">
                                <div className="inline-block min-w-full rounded-md border">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th className="p-2 border-b border-r bg-muted/50 font-medium"></th>
                                                {correlationMatrix.columns.map(c => (
                                                    <th key={c} className="p-2 border-b bg-muted/50 font-medium max-w-[100px] truncate" title={c}>{c}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {correlationMatrix.matrix.map((row, i) => (
                                                <tr key={i}>
                                                    <td className="p-2 border-b border-r bg-muted/50 font-medium max-w-[100px] truncate" title={correlationMatrix.columns[i]}>
                                                        {correlationMatrix.columns[i]}
                                                    </td>
                                                    {row.map((val, j) => {
                                                        const isSelf = i === j;
                                                        // Tailwind approach to color mapping based on value (-1 to 1)
                                                        const hue = val > 0 ? 210 : 0; // blue for positive, red for negative
                                                        const intensity = Math.abs(val) * 60 + 20; // 20% to 80% lightness 
                                                        const cellStyle = isSelf ? {} : {
                                                            backgroundColor: `hsla(${hue}, 80%, ${Math.max(100 - intensity, 30)}%, ${Math.abs(val) * 0.8 + 0.1})`,
                                                            color: Math.abs(val) > 0.6 ? 'white' : 'inherit'
                                                        };
                                                        return (
                                                            <td key={j} className="p-2 border-b text-center" style={cellStyle}>
                                                                {val.toFixed(2)}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </ChartCard>
                    </div>

                    <ChartCard title="Missing Values Analysis" description="Percentage of empty cells per column" className="w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 max-h-[300px] overflow-y-auto">
                            {missingValues.map((mv) => (
                                <div key={mv.column} className="flex flex-col gap-1 p-3 rounded-lg border bg-card text-card-foreground">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium truncate max-w-[120px]" title={mv.column}>{mv.column}</span>
                                        <span className={cn("font-medium", mv.percentage > 0 ? "text-destructive" : "text-emerald-500")}>
                                            {mv.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full", mv.percentage > 20 ? "bg-destructive" : (mv.percentage > 0 ? "bg-amber-500" : "bg-emerald-500"))}
                                            style={{ width: `${Math.max(mv.percentage, 1)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{mv.missing} missing</span>
                                </div>
                            ))}
                        </div>
                    </ChartCard>
                </>
            )}
        </div>
    );
}
