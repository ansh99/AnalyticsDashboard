import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.argv[2];

if (!apiKey) {
    console.error("Please provide an API key as an argument.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("SUPPORTED MODELS FOR THIS API KEY:");
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.error("Failed to fetch models: ", data);
        }
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}

listModels();
