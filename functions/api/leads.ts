import { type } from "arktype";

const insertLeadSchema = type({
  businessName: "string",
  industry: "string",
  ownerName: "string",
  phone: "string",
  email: "string.email",
  package: "string",
  "status?": "string",
  "notes?": "string",
});

interface Env {
  N8N_WEBHOOK_URL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = await context.request.json();
    const result = insertLeadSchema(body);

    if (result instanceof type.errors) {
      return new Response(JSON.stringify({ error: result.summary }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const lead = { ...result, status: result.status ?? "pending" };

    // Forward to n8n webhook for processing
    const webhookUrl = context.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    }

    return new Response(JSON.stringify({ success: true, lead }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};
