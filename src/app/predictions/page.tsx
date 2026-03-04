"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import { getNumericColumns } from "@/lib/stats";
import { runRegression, runKMeans } from "@/lib/ml";
import { ChartCard } from "@/components/ChartCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";
import { LayoutTemplate, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

export default function PredictionsPage() {
    const { files, activeFileId, setActiveFile } = useAppStore();
    const activeFile = files.find(f => f.id === activeFileId) || files[0];

    const numericColumns = useMemo(() => {
        if (!activeFile) return [];
        return getNumericColumns(activeFile.headers, activeFile.columnTypes);
    }, [activeFile]);

    // Regression State
    const [targetCol, setTargetCol] = useState<string>('');
    const [featureCol, setFeatureCol] = useState<string>('');
    const [isTraining, setIsTraining] = useState(false);
    const [regResult, setRegResult] = useState<any>(null);

    // Clustering State
    const [kClusters, setKClusters] = useState<number>(3);
    const [clusterTarget1, setClusterTarget1] = useState<string>('');
    const [clusterTarget2, setClusterTarget2] = useState<string>('');
    const [isClustering, setIsClustering] = useState(false);
    const [clusterResult, setClusterResult] = useState<any>(null);

    useMemo(() => {
        if (numericColumns.length >= 2) {
            if (!numericColumns.includes(targetCol)) setTargetCol(numericColumns[0]);
            if (!numericColumns.includes(featureCol)) setFeatureCol(numericColumns[1]);
            if (!numericColumns.includes(clusterTarget1)) setClusterTarget1(numericColumns[0]);
            if (!numericColumns.includes(clusterTarget2)) setClusterTarget2(numericColumns[1]);
        }
    }, [numericColumns]);

    const handleRunRegression = async () => {
        if (!activeFile || !targetCol || !featureCol) return;
        setIsTraining(true);
        setRegResult(null);
        try {
            // Small timeout to allow UI update
            await new Promise(r => setTimeout(r, 50));
            const res = await runRegression(activeFile.data, targetCol, [featureCol]);
            setRegResult(res);
            toast.success("Regression completed successfully");
        } catch (e: any) {
            toast.error(e.message || "Regression failed");
        } finally {
            setIsTraining(false);
        }
    };

    const handleRunClustering = async () => {
        if (!activeFile || !clusterTarget1 || !clusterTarget2) return;
        setIsClustering(true);
        setClusterResult(null);
        try {
            await new Promise(r => setTimeout(r, 50));
            const res = runKMeans(activeFile.data, [clusterTarget1, clusterTarget2], kClusters);
            setClusterResult(res);
            toast.success("Clustering completed successfully");
        } catch (e: any) {
            toast.error(e.message || "Clustering failed");
        } finally {
            setIsClustering(false);
        }
    }

    if (!activeFile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 w-full h-full relative z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full -z-10 pointer-events-none opacity-50"></div>

                <Card className="max-w-md w-full bg-background/50 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-1/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center relative z-10">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                            <div className="h-20 w-20 bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl flex items-center justify-center relative shadow-lg">
                                <LayoutTemplate className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight mb-3 text-foreground">No data to predict</h2>
                        <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                            Upload a dataset to train machine learning models and forecast future trends directly in your browser.
                        </p>
                        <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                            <a href="/files">Go to Data Sources</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Predictions & ML</h1>
                    <p className="text-muted-foreground">Run client-side machine learning models directly in your browser.</p>
                </div>
            </div>

            <Tabs defaultValue="regression" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="regression">Regression</TabsTrigger>
                    <TabsTrigger value="clustering">Clustering</TabsTrigger>
                </TabsList>
                <TabsContent value="regression" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <ChartCard title="Configuration" description="Select target and feature" className="md:col-span-1 border-primary/20 bg-primary/5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Target Variable (Y)</Label>
                                    <Select value={targetCol} onValueChange={setTargetCol}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Predictor Variable (X)</Label>
                                    <Select value={featureCol} onValueChange={setFeatureCol}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleRunRegression} disabled={isTraining} className="w-full gap-2">
                                    {isTraining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                    {isTraining ? "Training Model..." : "Run Regression"}
                                </Button>
                            </div>
                        </ChartCard>

                        <ChartCard title="Results: Predicted vs Actual" description={`Model performance for ${targetCol}`} className="md:col-span-2">
                            {regResult ? (
                                <div className="space-y-4">
                                    <div className="flex gap-6 mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">R² Score</p>
                                            <p className="text-2xl font-bold">{(regResult.r2 * 100).toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Root Mean Square Error</p>
                                            <p className="text-2xl font-bold">{regResult.rmse.toFixed(4)}</p>
                                        </div>
                                    </div>
                                    <div className="h-[250px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={regResult.chartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                                                <XAxis dataKey="actual" type="number" name="Actual" domain={['auto', 'auto']} tickLine={false} axisLine={false} fontSize={10} />
                                                <YAxis type="number" domain={['auto', 'auto']} tickLine={false} axisLine={false} fontSize={10} />
                                                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                                                <Line type="monotone" dataKey="actual" stroke="#8884d8" dot={false} name="Actual" strokeWidth={2} />
                                                <Line type="monotone" dataKey="predicted" stroke="#82ca9d" dot={false} name="Predicted" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
                                    Run the model to see results
                                </div>
                            )}
                        </ChartCard>
                    </div>
                </TabsContent>
                <TabsContent value="clustering" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <ChartCard title="Configuration" description="K-Means Clustering" className="md:col-span-1 border-primary/20 bg-primary/5">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Feature X</Label>
                                    <Select value={clusterTarget1} onValueChange={setClusterTarget1}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Feature Y</Label>
                                    <Select value={clusterTarget2} onValueChange={setClusterTarget2}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{numericColumns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Number of Clusters (k)</Label>
                                    <Input type="number" min={2} max={10} value={kClusters} onChange={e => setKClusters(e.target.valueAsNumber || 2)} />
                                </div>
                                <Button onClick={handleRunClustering} disabled={isClustering} className="w-full gap-2">
                                    {isClustering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                    {isClustering ? "Clustering..." : "Run K-Means"}
                                </Button>
                            </div>
                        </ChartCard>

                        <ChartCard title="Results: 2D Cluster Map" description="Data points grouped by cluster" className="md:col-span-2">
                            {clusterResult ? (
                                <div className="space-y-4">
                                    <div className="flex gap-4 mb-4 flex-wrap">
                                        {clusterResult.clusterStats.map((stat: any) => (
                                            <div key={stat.cluster} className="px-3 py-1 rounded-full border bg-muted text-sm font-medium">
                                                Cluster {stat.cluster}: {stat.count} items
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-[300px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                                                <XAxis dataKey="x" type="number" name={clusterTarget1} fontSize={10} />
                                                <YAxis dataKey="y" type="number" name={clusterTarget2} fontSize={10} />
                                                <ZAxis range={[50, 50]} />
                                                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                                                {Array.from({ length: kClusters }).map((_, i) => (
                                                    <Scatter
                                                        key={i}
                                                        name={`Cluster ${i + 1}`}
                                                        data={clusterResult.scatterData.filter((d: any) => d.cluster === `Cluster ${i + 1}`)}
                                                        fill={`hsl(${i * (360 / kClusters)}, 70%, 50%)`}
                                                    />
                                                ))}
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
                                    Run clustering algorithm to view groups
                                </div>
                            )}
                        </ChartCard>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
