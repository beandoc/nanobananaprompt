import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { safetySettings } from "@/lib/config/generation";

export class GenerationService {
  private static genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
  private static groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

  static async expandBrief(brief: string, systemPrompt: string, image?: string) {
    let refinedText = "";
    let providerHistory: any[] = [];
    let error: Error | null = null;

    if (this.genAI) {
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash"];
      for (const m of modelsToTry) {
        try {
          const model = this.genAI.getGenerativeModel({
            model: m,
            generationConfig: {
              temperature: 0.6,
              topP: 0.9,
              ...(m === "gemini-2.5-flash" ? { thinkingConfig: { thinkingBudget: 512 } } : {}),
            },
            safetySettings,
          });
          const userParts: any[] = [`CONVERT TO MASTERCLASS SPEC: ${brief}`];
          if (image) {
            const base64Data = image.split(",")[1];
            const mimeType = image.split(";")[0].split(":")[1];
            userParts.push({ inlineData: { data: base64Data, mimeType } });
          }
          
          let result = await model.generateContent([systemPrompt, ...userParts]);
          let firstDraft = result.response.text().trim();
          
          // --- SOVEREIGN RECURSIVE HARDENER ---
          const lexicalDensity = (firstDraft.match(/texture|lighting|optics|refraction|scattering|detailed|anatomy|clinical|specular/gi) || []).length;
          const wordCount = firstDraft.split(/\s+/).length;

          if (wordCount < 120 || lexicalDensity < 4) {
            console.log(`[Sovereign Hardener] Up-sampling thin prompt (Words: ${wordCount}, Density: ${lexicalDensity})...`);
            const reworkResult = await model.generateContent([
                systemPrompt,
                { text: `EXISTING DRAFT: ${firstDraft}\n\nCRITICAL FEEDBACK: This draft is too thin. Increase prose density by 2x. Add highly specific detail about subsurface scattering, fluid visosity, and clinical micro-textures.` }
            ]);
            refinedText = reworkResult.response.text().trim();
          } else {
            refinedText = firstDraft;
          }

          if (refinedText) {
            providerHistory.push({ phase: "expansion", model: m, status: "success", stats: { words: wordCount, density: lexicalDensity } });
            break;
          }
        } catch (err: any) {
          const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota");
          providerHistory.push({ phase: "expansion", model: m, status: "fail", error: err.message, isQuota });
          if (isQuota) break;
        }
      }
    }

    if (!refinedText && this.groq) {
      try {
        const completion = await this.groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `REFINE THIS BRIEF: ${brief}` },
          ],
          model: "llama-3.1-8b-instant",
        });
        refinedText = completion.choices[0]?.message?.content?.trim() || "";
        if (refinedText) providerHistory.push({ phase: "expansion", model: "groq-llama-3", status: "success" });
      } catch (err: any) {
        providerHistory.push({ phase: "expansion", model: "groq-error", status: "fail", error: err.message });
        error = err;
      }
    }

    return { refinedText, providerHistory, error };
  }

  static async generateJson(prompt: string, systemInstruction: string, schemaStr: string, lightweight: boolean) {
    let adData: any = null;
    let providerHistory: any[] = [];
    let error: Error | null = null;

    if (this.genAI) {
      const jsonModels = lightweight ? ["gemini-2.5-flash-lite"] : ["gemini-2.5-flash", "gemini-2.0-flash"];
      for (const m of jsonModels) {
        try {
          const model = this.genAI.getGenerativeModel({
            model: m,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.15,
              topP: 0.8,
              ...(m.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
            },
            safetySettings,
          });
          const result = await model.generateContent([systemInstruction, `GENERATE JSON BLUEPRINT FOR: ${prompt}`]);
          adData = JSON.parse(result.response.text());
          if (adData) {
            providerHistory.push({ phase: "json", model: m, status: "success" });
            break;
          }
        } catch (err: any) {
          const isQuota = err.message?.includes("429") || err.message?.toLowerCase().includes("quota") || err.message?.includes("limit");
          const isNotFound = err.message?.includes("404") || err.message?.toLowerCase().includes("not found");
          const isDecommissioned = err.message?.includes("400") || err.message?.toLowerCase().includes("decommissioned");

          providerHistory.push({ phase: "json", model: m, status: "fail", error: err.message, isQuota, isNotFound, isDecommissioned });
          if (isQuota) break;
          if (isNotFound || isDecommissioned) continue;
          error = err;
        }
      }
    }

    if (!adData && this.groq) {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "gemma2-9b-it"];
      const groqSystemPrompt = [systemInstruction, `SCHEMA STRUCTURE:`, schemaStr, `CRITICAL: Return ONLY valid JSON. No markdown. No chatter.`].join("\n\n");

      for (const gm of groqModels) {
        try {
          const completion = await this.groq.chat.completions.create({
            messages: [
              { role: "system", content: groqSystemPrompt },
              { role: "user", content: `GENERATE JSON BLUEPRINT: ${prompt}` },
            ],
            model: gm,
            response_format: { type: "json_object" },
            temperature: 0.1,
          });
          adData = JSON.parse(completion.choices[0]?.message?.content || "{}");
          if (adData) {
            providerHistory.push({ phase: "json", model: gm, status: "success" });
            break;
          }
        } catch (err: any) {
          providerHistory.push({ phase: "json", model: gm, status: "fail", error: err.message });
        }
      }
    }

    return { adData, providerHistory, error };
  }
}
