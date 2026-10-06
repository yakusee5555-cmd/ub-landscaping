import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayResponseHeaders } from "@/lib/ai-gateway-run-id";

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const detailsSchema = z.object({
  description: z.string().trim().min(20).max(2000),
  propertyType: z.enum(["Home", "Rental", "Commercial", "Other"]),
  priority: z.enum(["Low maintenance", "Family friendly", "More privacy", "Better curb appeal", "Entertaining", "Not sure"]),
  budget: z.enum(["Under $2,500", "$2,500–$7,500", "$7,500–$20,000", "$20,000+", "Not sure"]),
});

function safeErrorMessage(status: number, body: string) {
  try {
    const parsed = JSON.parse(body) as { message?: unknown; error?: { message?: unknown } };
    const message = typeof parsed.message === "string" ? parsed.message : typeof parsed.error?.message === "string" ? parsed.error.message : "";
    if (message) return message;
  } catch {
    // Upstream may return plain text.
  }
  if (status === 402) return "AI planning credits are currently unavailable. Please try again later or request a standard quote.";
  if (status === 429) return "The yard planner is busy right now. Please wait a moment and try again.";
  return "The yard planner could not create a brief right now. Your description and photo have been kept on this page.";
}

export const Route = createFileRoute("/api/yard-plan")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData().catch(() => null);
        if (!form) return Response.json({ message: "Please provide your yard details and one photo." }, { status: 400 });

        const parsed = detailsSchema.safeParse({
          description: form.get("description"),
          propertyType: form.get("propertyType"),
          priority: form.get("priority"),
          budget: form.get("budget"),
        });
        if (!parsed.success) return Response.json({ message: "Please complete each field and add at least 20 characters about your yard." }, { status: 400 });

        const image = form.get("image");
        if (!(image instanceof File) || image.size === 0) return Response.json({ message: "Add a clear photo of the yard you want to improve." }, { status: 400 });
        if (!allowedImageTypes.has(image.type)) return Response.json({ message: "Use a JPG, PNG, or WebP photo." }, { status: 400 });
        if (image.size > MAX_IMAGE_BYTES) return Response.json({ message: "Choose a photo smaller than 6 MB." }, { status: 413 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ message: "The AI yard planner is not configured yet." }, { status: 500 });

        const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
        const imageUrl = `data:${image.type};base64,${base64}`;
        const prompt = `You are the experienced project planner for U&B Landscaping and Tree Service. Study the supplied yard photo and the customer's notes. Create a useful preliminary landscaping brief, not a sales pitch. Do not claim certainty about dimensions, drainage, soil, plant health, safety, boundaries, permits, or hidden conditions that cannot be confirmed from one photo. Never diagnose tree safety from the photo; recommend an on-site assessment where appropriate.

Customer details:
- Property: ${parsed.data.propertyType}
- Main priority: ${parsed.data.priority}
- Indicative budget: ${parsed.data.budget}
- Description: ${parsed.data.description}

Return concise Markdown using exactly these headings:
## Your project direction
A two-to-three sentence vision grounded in visible details and the notes.
## What stands out
- 3 to 5 observations, clearly distinguishing visible facts from assumptions.
## Recommended services
- 3 to 5 recommendations selected where relevant from Lawn care, Hedge & shrub care, Garden design, Grounds maintenance, Hardscaping, Seasonal cleanups, Tree care, or Lawn installation. Bold each service name and explain why it fits.
## Suggested project sequence
1. 3 to 5 practical stages, beginning with an on-site check.
## Questions for the site visit
- 3 focused questions needed to refine the quote.
## Before work begins
A short note that this is an AI-assisted preliminary brief, not a quote, safety assessment, or substitute for an in-person survey. Keep the full response under 650 words.`;

        const gateway = createLovableAiGatewayRunIdFetch(request.headers.get("X-Lovable-AIG-Run-ID") ?? undefined);
        try {
          const upstream = await gateway.fetch("https://ai.gateway.lovable.dev/v1/responses", {
            method: "POST",
            signal: request.signal,
            headers: {
              "Content-Type": "application/json",
              "Lovable-API-Key": apiKey,
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "openai/gpt-6-astra",
              stream: true,
              store: false,
              reasoning: { effort: "low", summary: "auto" },
              include: ["reasoning.encrypted_content"],
              input: [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: imageUrl }] }],
            }),
          });
          if (!upstream.ok) {
            const body = await upstream.text();
            return Response.json({ message: safeErrorMessage(upstream.status, body) }, { status: upstream.status });
          }
          return new Response(upstream.body, { status: upstream.status, headers: getLovableAiGatewayResponseHeaders(upstream.headers) });
        } catch (error) {
          if (request.signal.aborted && error instanceof Error && error.name === "AbortError") return new Response(null, { status: 499 });
          console.error("Yard planner request failed", error);
          return Response.json({ message: "The yard planner could not connect right now. Please try again shortly." }, { status: 500 });
        }
      },
    },
  },
});