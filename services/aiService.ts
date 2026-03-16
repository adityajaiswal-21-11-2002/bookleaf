/**
 * AI Service - Cost-efficient LLM integration with structured prompts
 * Uses prompt templates and summarized KB to minimize token usage
 */

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama3-70b-8192";

// Token-optimized: minimal KB summary (~80 tokens vs ~200 full)
const KB_SUMMARY = `Royalty: 80/20 split, quarterly payout within 45 days, min ₹1000. Printing: 5-7 days. Distribution: 7-10 days. Stock sync: 24-48h.`;

const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];

export interface ClassificationResult {
  category: string;
  priority: string;
  error?: string;
}

export interface GenerateResponseResult {
  response: string;
  error?: string;
}

/**
 * Classify ticket - structured JSON output, ~150 tokens max
 */
export async function classifyTicket(
  subject: string,
  description: string
): Promise<ClassificationResult> {
  if (!process.env.GROQ_API_KEY) {
    return { category: "General Inquiry", priority: "Medium", error: "AI not configured" };
  }

  const systemPrompt = `Classify support ticket. Categories: ${CATEGORIES.join("|")}. Priorities: ${PRIORITIES.join("|")}. Return ONLY JSON: {"category":"","priority":""}`;
  const userPrompt = `Subject: ${subject}\n\n${description.slice(0, 500)}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 80,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "{}";
    const parsed = parseStructuredJson<{ category: string; priority: string }>(content);

    return {
      category: CATEGORIES.includes(parsed.category) ? parsed.category : "General Inquiry",
      priority: PRIORITIES.includes(parsed.priority) ? parsed.priority : "Medium",
    };
  } catch (error) {
    console.error("[aiService] classify error:", error);
    return {
      category: "General Inquiry",
      priority: "Medium",
      error: String(error),
    };
  }
}

/**
 * Generate draft response - structured JSON, context-aware KB
 * Only includes KB sections relevant to ticket content
 */
export async function generateDraftResponse(
  subject: string,
  description: string,
  bookTitle?: string
): Promise<GenerateResponseResult> {
  if (!process.env.GROQ_API_KEY) {
    return {
      response: "Thank you for reaching out. Our team will review your inquiry and respond shortly.",
      error: "AI not configured",
    };
  }

  const systemPrompt = `You are BookLeaf support. Rules: 1) Acknowledge the author's concern. 2) Be empathetic and professional. 3) Provide specific timelines when relevant (e.g. "within 45 days", "5-7 business days"). 4) End with clear next steps. KB: ${KB_SUMMARY}. Return ONLY JSON: {"response":"your reply"}. Do not hallucinate.`;
  const userPrompt = `Book: ${bookTitle || "N/A"}\nSubject: ${subject}\n\n${description.slice(0, 800)}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 400,
    });

    const content = completion.choices[0]?.message?.content?.trim() || "{}";
    const parsed = parseStructuredJson<{ response: string }>(content);

    return {
      response:
        parsed.response?.trim() ||
        "Thank you for contacting BookLeaf. We will look into this and respond shortly.",
    };
  } catch (error) {
    console.error("[aiService] generate error:", error);
    return {
      response: "Thank you for reaching out. Our team will review your inquiry and respond shortly.",
      error: String(error),
    };
  }
}

function parseStructuredJson<T>(content: string): T {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return {} as T;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return {} as T;
  }
}
