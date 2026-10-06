import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(50).optional(),
  service: z.enum(["Lawn care", "Hedge & shrub care", "Garden design", "Grounds maintenance", "Hardscaping", "Seasonal cleanups"]),
  consultationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  consultationTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  projectBrief: z.string().max(10000).optional(),
  website: z.string().max(0),
});

export const Route = createFileRoute("/api/consultations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = bookingSchema.safeParse(body);
        if (!parsed.success) return Response.json({ message: "Please check your contact and appointment details." }, { status: 400 });

        const selected = new Date(`${parsed.data.consultationDate}T${parsed.data.consultationTime}:00`);
        if (Number.isNaN(selected.getTime()) || selected.getTime() < Date.now()) {
          return Response.json({ message: "Choose a consultation time in the future." }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.from("consultations").insert({
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          service: parsed.data.service,
          consultation_date: parsed.data.consultationDate,
          consultation_time: parsed.data.consultationTime,
          project_brief: parsed.data.projectBrief || null,
        }).select("id").single();

        if (error) {
          console.error("Consultation booking failed", error.message);
          return Response.json({ message: "We could not save that appointment. Please try again." }, { status: 500 });
        }

        return Response.json({ id: data.id, emailSent: false }, { status: 201 });
      },
    },
  },
});