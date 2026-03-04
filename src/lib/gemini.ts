import { GoogleGenerativeAI } from "@google/generative-ai";
import { UploadedFile } from "./types";
import { computeStats } from "./stats";

export async function askGemini(prompt: string, history: any[], apiKey: string, activeFile: UploadedFile | null) {
    if (!apiKey) {
        throw new Error("No Gemini API key configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let contextInjection = "";

    if (activeFile) {
        // Generate context summary
        const numRows = activeFile.data.length;
        let sampleRows = activeFile.data.slice(0, 3).map(r => JSON.stringify(r)).join("\n");

        // Quick stats for a couple numeric columns
        const numericCols = Object.entries(activeFile.columnTypes).filter(([col, type]) => type === 'number').map(([col]) => col).slice(0, 3);
        let statsStr = "";
        for (const col of numericCols) {
            const stats = computeStats(activeFile.data, col);
            statsStr += `- ${col}: Mean=${stats.mean.toFixed(2)}, Min=${stats.min.toFixed(2)}, Max=${stats.max.toFixed(2)}\n`;
        }

        contextInjection = `
SYSTEM PROMPT INJECTION:
You are an expert data analyst AI inside "Nexus Analytics" dashboard. 
The user is currently exploring a dataset named "${activeFile.name}".
Dataset details: 
- Total Rows: ${numRows}
- Total Columns: ${activeFile.headers.length}
- Column Names: ${activeFile.headers.join(", ")}

Data Sample (first 3 rows):
${sampleRows}

Quick Stats for key columns:
${statsStr}

Please answer the user's questions truthfully based on the data. Do not make up facts.
If writing a formula or code, use markdown. Provide clear, concise answers.
-----------------
`;
    }

    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.content }]
        })),
    });

    const fullPrompt = history.length === 0 ? contextInjection + prompt : prompt;

    const result = await chat.sendMessage(fullPrompt);
    return result.response.text();
}
