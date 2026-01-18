interface Env {
  N8N_WEBHOOK_URL: string;
}

interface LeadInput {
  businessName: string;
  industry: string;
  ownerName: string;
  phone: string;
  email: string;
  package: string;
  status?: string;
  notes?: string;
}

function validateLead(body: unknown): { valid: true; data: LeadInput } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;
  const required = ["businessName", "industry", "ownerName", "phone", "email", "package"];

  for (const field of required) {
    if (typeof b[field] !== "string" || !b[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  if (!b.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email as string)) {
    return { valid: false, error: "Invalid email format" };
  }

  return {
    valid: true,
    data: {
      businessName: b.businessName as string,
      industry: b.industry as string,
      ownerName: b.ownerName as string,
      phone: b.phone as string,
      email: b.email as string,
      package: b.package as string,
      status: (b.status as string) || "pending",
      notes: b.notes as string | undefined,
    },
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json();
    const result = validateLead(body);

    if (!result.valid) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const lead = result.data;

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
    headers: corsHeaders,
  });
};
