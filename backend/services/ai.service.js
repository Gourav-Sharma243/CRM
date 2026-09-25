import {GoogleGenAI} from "@google/genai";
import {ApiError} from "../utils/ApiError.js";

let client = null;

export const getClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if(!apiKey) throw new ApiError(500, "GEMINI_API_KEY is not set in environment variables");
    if(!client) {
        client = new GoogleGenAI(apiKey);
    }
    return client;
};

const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.5-flash";
export const isAIConfigued = () => Boolean(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];

const executeWithFallback = async (runAttempt, maxAttempts = 3) => {
    const primary = MODEL();
    const modelsToTry = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];
    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const model = modelsToTry[attempt % modelsToTry.length];
        try {
            return await runAttempt(model);
        } catch (error) {
            lastError = error;
            const isTransient =
                error?.message?.includes("503") ||
                error?.message?.includes("UNAVAILABLE") ||
                error?.message?.includes("429");

            if (isTransient && attempt < maxAttempts - 1) {
                const delay = 500 * (attempt + 1);
                console.warn(`Model ${model} high demand/busy. Trying next model in ${delay}ms...`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

const generateJSON = async (prompt, schema) => {
    const ai = getClient();
    try {
        return await executeWithFallback(async (model) => {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.6,
                },
            });
            return JSON.parse(response.text);
        });
    } catch (error) {
        console.error("Gemini JSON error:", error?.message || error);
        throw new ApiError(500, "AI request failed. Please try again in a moment.");
    }
};

const generateText = async (prompt, temperature = 0.7) => {
    const ai = getClient();
    try {
        return await executeWithFallback(async (model) => {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: { temperature },
            });
            return response.text.trim();
        });
    } catch (error) {
        console.error("Gemini text error:", error?.message || error);
        throw new ApiError(500, "AI request failed. Please try again in a moment.");
    }
};

export const generateLeadSummary = async (lead) => {
    const prompt = `You are an expert B2B sales analyst for a CRM called Nexus CRM.
    Analyse the following sales lead and produce a concise assesment.
    Lead details:
    - Name: ${lead.name || "N/A"}
    - Email: ${lead.email || "N/A"}
    - Current pipeline stage: ${lead.stage || "New"}
    - Potential deal value: ${lead.value || 0}
    - Source: ${lead.source || "Unknown"}
    - Notes: ${lead.notes || "None"}

    Return JSON only.`;

    const schema = {
        type: "object",
        properties: {
            summary: { 
                type: "string",
                description: "2-3 sentence executive summary of the lead",
            },
            riskScore: {
                type: "integer",
                description: "Risk of losing this deal, 0(safe) to 100(high risk)",
            },
            suggestedPriority: {
                type: "string",
                enum: ["High", "Medium", "Low"],
            },
            nextBestAction: {
                type: "string",
                description: "One concrete recommended next step",
            },
        },
        required: ["summary", "riskScore", "suggestedPriority", "nextBestAction"],
    };

    return generateJSON(prompt, schema);
};

export const generateLeadEmail = async (lead, purpose, tone, sender) => {
    const prompt = `You are a senior sales rep writing on behalf of ${
        sender?.name || "our team"
    }${sender?.company ? ` at ${sender.company}` : ""}.
    Write a professional sales email.
    Purpose: ${purpose || "follow-up"}
    Desired tone: ${tone || "friendly and professional"}
    
    Recipient (lead) details:
    - Name: ${lead?.name || "there"}
    - Company: ${lead?.company || "N/A"}
    - Pipeline stage: ${lead?.stage || "New"}
    - Context/Notes: ${lead?.notes || "None"}

    Return JSON only with a compelling subject line and a complete email body.
    Use line breaks (\n) in the body. Keep it under 180 words. Sign off as 
    ${sender?.name || "The Nexus CRM Team"}.`;

    const schema = {
        type: "object",
        properties: {
            subject: {
                type: "string",
            },
            body: {
                type: "string",
            },
        },
        required: ["subject", "body"],
    };
    return generateJSON(prompt, schema);
};

export const generateSalesInsights = async (pipelineStats) => {
    const prompt = `You are a revenue-operations advisor. Given this snapshot of a 
    sales pipeline, identify what is working, what is at risk, and concrete actions to improve conversion.

    Pipeline snapshot (JSON):
    ${JSON.stringify(pipelineStats, null, 2)}
    Return JSON only.`;

    const schema = {
        type: "object",
        properties: {
            headline: {
                type: "string",
                description: "One sentence summary of pipeline health",
            },
            insights: {
                type: "array",
                description: "3-5 specific, data-driven observations",
                items: {
                    type: "string",
                },
            },
            recommendations: {
                type: "array",
                description: "3-5 prioritized, actionable recommendations",
                items: {
                    type: "string",
                },
            },
            healthScore: {
                type: "integer",
                description: "Overall pipeline health 0-100",
            },
        },
        required: ["headline", "insights", "recommendations", "healthScore"],
    };
    return generateJSON(prompt, schema);
};

export {generateText};
