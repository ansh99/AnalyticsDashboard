"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { askGemini } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Settings, AlertTriangle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export default function ChatPage() {
    const { files, activeFileId, geminiApiKey } = useAppStore();
    const activeFile = files.find(f => f.id === activeFileId) || (files.length > 0 ? files[0] : null);

    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hello! I am your AI Data Analyst companion. How can I help you explore your data today?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !geminiApiKey) return;

        const userMsg = input;
        setInput("");
        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Exclude the first greeting message for the API history to save tokens
            const historyForApi = newMessages.slice(1, -1);
            const responseText = await askGemini(userMsg, historyForApi, geminiApiKey, activeFile);

            setMessages(prev => [...prev, { role: 'model', content: responseText }]);
        } catch (e: any) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: `Error: ${e.message || 'Failed to get a response.'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!geminiApiKey) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-center max-w-md mx-auto">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">API Key Required</h2>
                <p className="text-muted-foreground mb-6">
                    Please configure your Google Gemini API key in the settings to use the AI chat.
                </p>
                <Button asChild>
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Go to Settings
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto w-full gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">AI Chat</h1>
                    <p className="text-muted-foreground text-sm">Ask natural language questions about your active dataset.</p>
                </div>
            </div>

            <Card className="flex flex-col flex-1 overflow-hidden border-border/50 shadow-sm">
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-6 p-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Bot className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                                <div className={`px-4 py-3 rounded-lg max-w-[85%] text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted/50 border rounded-tl-none prose prose-sm dark:prose-invert max-w-none'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        msg.content
                                    ) : (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <User className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-4 justify-start">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="h-5 w-5 text-primary animate-pulse" />
                                </div>
                                <div className="px-5 py-3 rounded-lg bg-muted/50 border rounded-tl-none flex items-center gap-1">
                                    <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce"></span>
                                    <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background shrink-0">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Ask about your data... e.g. 'What is the average of sales?'"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Send</span>
                        </Button>
                    </form>
                    {activeFile && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            AI Context: Using <span className="font-semibold">{activeFile.name}</span> with {activeFile.headers.length} columns.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}
