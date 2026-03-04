/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI, Schema } from "@google/generative-ai";
import { adCreativeSchema } from "./schemas/ad-creative";
import { medicalIllustrationSchema } from "./schemas/medical-illustration";
import { vectorIllustrationSchema } from "./schemas/vector-branding";
import { videoIllustrationSchema } from "./schemas/cinematic-video";
import { storyboardSchema } from "./schemas/storyboard";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = (mode: "ad" | "medical" | "vector" | "video" | "storyboard" = "ad") => {
    let schema: Schema = adCreativeSchema;
    if (mode === "medical") schema = medicalIllustrationSchema;
    if (mode === "vector") schema = vectorIllustrationSchema;
    if (mode === "video") schema = videoIllustrationSchema;
    if (mode === "storyboard") schema = storyboardSchema;

    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });
};
