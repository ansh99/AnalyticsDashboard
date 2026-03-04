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
      <div className="flex flex-col gap-6 max-w-4xl mx-auto mt-8 px-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Nexus Analytics Platform</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your data, instantly visualize it, and forecast the future using powerful client-side AI and ML.
          </p>
        </div>

        <FileUploader />

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader className="pb-2">
              <FileSpreadsheet className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Fast Processing</CardTitle>
              <CardDescription>Parse massive CSVs & Excel directly in your browser without lag.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <BarChart3 className="h-8 w-8 text-emerald-500 mb-2" />
              <CardTitle>Instant Analytics</CardTitle>
              <CardDescription>Generates beautiful statistics, heatmaps, and distributions instantly.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <BrainCircuit className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle>AI & Predictions</CardTitle>
              <CardDescription>Chat with Gemini about your data or run TensorFlow.js forecasting.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Overview</h1>
          <p className="text-muted-foreground">Welcome back. Continue your analysis on {activeFile.name}.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/files">Manage Data</Link>
          </Button>
          <Button asChild>
            <Link href="/analytics" className="gap-2">
              Explore Analytics <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dataset</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate" title={activeFile.name}>{activeFile.name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(activeFile.size / 1024 / 1024).toFixed(2)} MB • {activeFile.data.length.toLocaleString()} rows
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dimensions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFile.headers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Columns / Features</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Models</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">Regression, Clustering, Gemini, Stats</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">AI Chat Readiness</CardTitle>
            <BrainCircuit className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Ready</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/chat" className="underline underline-offset-2 hover:text-primary transition-colors">
                Start a conversation now
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity Overview</CardTitle>
            <CardDescription>Visual summary of the dataset structure</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="mx-auto h-10 w-10 mb-4 opacity-50" />
                <p>Visit the <Link href="/analytics" className="text-primary hover:underline">Analytics tab</Link> to view detailed charts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>Previously uploaded datasets in this session.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.data.length.toLocaleString()} rows • {new Date(f.uploadDate).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
