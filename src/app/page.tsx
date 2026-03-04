"use client";

import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, BarChart3, BrainCircuit, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FileUploader } from "@/components/FileUploader";

export default function Dashboard() {
  const files = useAppStore((state) => state.files);
  const activeFileId = useAppStore((state) => state.activeFileId);

  if (files.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-8 px-4 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-primary/20 blur-[100px] rounded-full -z-10 pointer-events-none opacity-50"></div>

        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-br from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent drop-shadow-sm">Nexus Analytics Platform</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your data, instantly visualize it, and forecast the future using powerful client-side AI and ML.
          </p>
        </div>

        <div className="bg-background/40 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-4 sm:p-8">
          <FileUploader />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-background/50 backdrop-blur-md border border-border/40 shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Fast Processing</CardTitle>
              <CardDescription className="text-sm mt-2">Parse massive CSVs & Excel directly in your browser without lag.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-background/50 backdrop-blur-md border border-border/40 shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Instant Analytics</CardTitle>
              <CardDescription className="text-sm mt-2">Generates beautiful statistics, heatmaps, and distributions instantly.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-background/50 backdrop-blur-md border border-border/40 shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="pb-4 relative z-10">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-500 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">AI & Predictions</CardTitle>
              <CardDescription className="text-sm mt-2">Chat with Gemini about your data or run TensorFlow.js forecasting.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  return (
    <div className="flex flex-col gap-6 pb-10 relative z-10">
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none opacity-60"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Overview</h1>
          <p className="text-muted-foreground font-medium">Welcome back. Continue your analysis on <span className="text-foreground">{activeFile.name}</span>.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="bg-background/50 backdrop-blur-md border-border/60 hover:bg-muted/50">
            <Link href="/files">Manage Data</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-primary-foreground">
            <Link href="/analytics" className="gap-2">
              Explore Analytics <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background/60 backdrop-blur-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Dataset</CardTitle>
            <div className="p-1.5 bg-blue-500/10 rounded-md text-blue-500 border border-blue-500/20">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate tracking-tight text-foreground" title={activeFile.name}>{activeFile.name}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              <span className="text-foreground/80">{(activeFile.size / 1024 / 1024).toFixed(2)} MB</span> • {activeFile.data.length.toLocaleString()} rows
            </p>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Dimensions</CardTitle>
            <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-500 border border-emerald-500/20">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">{activeFile.headers.length}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Columns / Features</p>
          </CardContent>
        </Card>
        <Card className="bg-background/60 backdrop-blur-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Models</CardTitle>
            <div className="p-1.5 bg-chart-1/10 rounded-md text-chart-1 border border-chart-1/20">
              <BrainCircuit className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">4</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Regression, Clustering, Gemini...</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 backdrop-blur-xl border border-primary/20 shadow-sm shadow-primary/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-primary">AI Chat Readiness</CardTitle>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl font-bold text-primary tracking-tight">Ready</div>
            <p className="text-xs font-medium mt-1">
              <Link href="/chat" className="text-primary/80 hover:text-primary hover:underline underline-offset-2 transition-colors flex items-center gap-1">
                Start a conversation <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4 bg-background/50 backdrop-blur-xl border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity Overview</CardTitle>
            <CardDescription>Visual summary of the dataset structure</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-border/60 rounded-xl bg-background/30 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-chart-1/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="text-center text-muted-foreground relative z-10">
                <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-40 text-primary" />
                <p className="font-medium">Visit the <Link href="/analytics" className="text-primary hover:text-primary/80 hover:underline transition-colors font-semibold">Analytics tab</Link> to view detailed charts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-background/50 backdrop-blur-xl border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>Previously uploaded datasets in this session.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{f.data.length.toLocaleString()} rows • {new Date(f.uploadDate).toLocaleTimeString()}</p>
                  </div>
                  {f.id === activeFileId && (
                    <span className="flex h-2 w-2 rounded-full bg-primary shrink-0"></span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
