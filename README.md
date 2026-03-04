# 🍌 Nano Banana Prompt

> **Elite Multimodal Intelligence Pipeline**
> Transform raw creative briefs into professional, technical blueprints and high-fidelity renders across multiple AI models.

## 🚀 Overview

Nano Banana Prompt is a production-grade AI creative workbench designed for **Performance Creative Directors**, **Medical Illustrators**, and **Brand Designers**. It features a robust multi-model waterfall architecture to ensure 100% uptime and the highest quality output for scientific and commercial assets.

### Key Capabilities

-   🎨 **Commercial Ad Creative**: ROI-focused design generation with hero product emphasis.
-   🩺 **Medical Illustration**: BioRender-standard scientific accuracy with 2.5D matte finish.
-   📐 **Scalable Branding**: Flat vector-style illustrations with automatic SVG tracing.
-   🎬 **Storyboard Engine**: Automated 12-segment script-to-visual breakdown for video production.
-   🛡️ **Identity Lock**: Native Indian subject silhouette enforcement for human interaction scenes.

## 🛠️ Architecture

### AI Infrastructure (Waterfall Architecture)

The system is built on a resilient "Waterfall" pattern to prevent quota exhaustion and downtime:

1.  **Generation Engine**: `Gemini 2.0 Flash` → `Groq (Llama 3.3 70B)` → `Anthropic Claude 3.5`.
2.  **Rendering Pipeline**: `Imagen 4.0` → `Gemini 2.0` → `Replicate` → `Pollinations`.
3.  **Persistence**: Cloud-native prompt library powered by **Upstash Redis**.
4.  **Edge Runtime**: All API operations run on **Vercel Edge** for sub-second latency.

## 📦 Deployment

### Local Development
```bash
npm install
cp .env.example .env.local # Fill in your API keys
npm run dev
```

### Docker Support (Containerized)
```bash
docker build -t nano-banana .
docker run -p 3000:3000 --env-file .env.local nano-banana
```

### Vercel Deployment
Optimized for the Mumbai region (`bom1`) for optimal performance in India.

## 🧪 DevOps & Reliability

-   **CI/CD**: Automated GitHub Actions for Type Checking, Linting, and Vitest runs.
-   **Validation**: Strict environment variable validation at runtime.
-   **Security**: Bearer token authentication for all API endpoints.
-   **Performance**: Memory-efficient Blob-to-URL image handling and Next.js lazy-loading.

## 📄 License
Private Repository. All Rights Reserved. © 2026.
