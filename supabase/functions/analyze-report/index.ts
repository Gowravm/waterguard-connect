import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { title, description, pollutionCategory, imageUrl } = await req.json();

    if (!title && !description) {
      return new Response(
        JSON.stringify({ error: "Title or description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are an environmental pollution analysis assistant for a water body conservation platform called BlueGuard.

Analyze this pollution report and classify it:

Title: ${title || "Not provided"}
Description: ${description || "Not provided"}
User-selected category: ${pollutionCategory || "Not specified"}
${imageUrl ? `Image URL: ${imageUrl}` : "No image provided"}

Based on the information provided, respond with your analysis.`;

    const messages: any[] = [
      {
        role: "system",
        content:
          "You are a pollution analysis AI for BlueGuard. Analyze reports and classify waste type, severity, and urgency. All your outputs are AI-assisted suggestions, not ground truth.",
      },
      {
        role: "user",
        content: imageUrl
          ? [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ]
          : prompt,
      },
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          tools: [
            {
              type: "function",
              function: {
                name: "classify_pollution",
                description:
                  "Classify a pollution report with waste type, severity, urgency, and recommended action",
                parameters: {
                  type: "object",
                  properties: {
                    predicted_waste_type: {
                      type: "string",
                      enum: [
                        "plastic",
                        "mixed",
                        "construction",
                        "sewage",
                        "foam",
                        "organic",
                        "ewaste",
                        "hazardous",
                        "cloth",
                        "glass",
                      ],
                      description: "The primary type of waste detected",
                    },
                    predicted_tags: {
                      type: "array",
                      items: { type: "string" },
                      description:
                        "Additional tags like 'single-use', 'industrial', 'household', 'biomedical'",
                    },
                    confidence_score: {
                      type: "number",
                      description: "Confidence 0.0 to 1.0",
                    },
                    severity_score: {
                      type: "integer",
                      enum: [1, 2, 3, 4, 5],
                      description: "Severity from 1 (minimal) to 5 (critical)",
                    },
                    severity_reason: {
                      type: "string",
                      description:
                        "Brief explanation of why this severity was assigned",
                    },
                    urgency_flag: {
                      type: "boolean",
                      description:
                        "True if this needs immediate attention (health hazard, toxic, etc.)",
                    },
                    suggested_action: {
                      type: "string",
                      enum: [
                        "notify_ngo",
                        "notify_ward_office",
                        "schedule_cleanup",
                        "inspect_urgently",
                        "monitor_recurrence",
                      ],
                      description: "Recommended next step",
                    },
                  },
                  required: [
                    "predicted_waste_type",
                    "predicted_tags",
                    "confidence_score",
                    "severity_score",
                    "severity_reason",
                    "urgency_flag",
                    "suggested_action",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "classify_pollution" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("AI did not return structured analysis");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Optionally save to database if report_id provided
    const url = new URL(req.url);
    const reportId = url.searchParams.get("report_id");

    if (reportId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("report_ai_analysis").insert({
        report_id: reportId,
        predicted_waste_type: analysis.predicted_waste_type,
        predicted_tags: analysis.predicted_tags,
        confidence_score: analysis.confidence_score,
        severity_score: analysis.severity_score,
        severity_reason: analysis.severity_reason,
        urgency_flag: analysis.urgency_flag,
        suggested_action: analysis.suggested_action,
        model_version: "gemini-2.5-flash",
      });

      // Update the report's ai_severity
      await supabase
        .from("pollution_reports")
        .update({ ai_severity: analysis.severity_score })
        .eq("id", reportId);
    }

    return new Response(
      JSON.stringify({
        ...analysis,
        _meta: {
          model: "gemini-2.5-flash",
          disclaimer: "AI-assisted suggestion — not ground truth",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-report error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
