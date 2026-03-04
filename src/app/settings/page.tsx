"use client";

import { useAppStore } from "@/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
    const { geminiApiKey, setGeminiApiKey, clearFiles } = useAppStore();
    const [apiKeyInput, setApiKeyInput] = useState("");

    useEffect(() => {
        setApiKeyInput(geminiApiKey || "");
    }, [geminiApiKey]);

    const handleSave = () => {
        setGeminiApiKey(apiKeyInput.trim() || null);
        toast.success("Settings saved successfully.");
    };

    const handleClearData = () => {
        if (confirm("Are you sure you want to clear all uploaded files? This action cannot be undone.")) {
            clearFiles();
            toast.success("All data cleared.");
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto mt-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your application preferences and API keys.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5" />
                        Gemini AI Settings
                    </CardTitle>
                    <CardDescription>
                        Provide your Google Gemini API key to enable AI Chat and insights.
                        The key is stored locally in your browser and never sent to our servers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            placeholder="AIzaSy..."
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Don't have a key? Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave}>Save Configuration</Button>
                </CardFooter>
            </Card>

            <Card className="border-destructive/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Permanent actions that will delete your current session data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleClearData}>
                        Clear All Data
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
