import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AgentPayload {
  agentId?: string;
  vapiAssistantId?: string;
  name: string;
  businessType: string;
  description?: string;
  greeting?: string;
  systemPrompt?: string;
  language: string;
  voice: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const VAPI_API_KEY = Deno.env.get("VAPI_PRIVATE_API_KEY");

    if (!VAPI_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "VAPI_PRIVATE_API_KEY is not configured. Please add it as a server-side secret in your Supabase project settings.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const method = req.method;
    const body: AgentPayload = method !== "DELETE" ? await req.json() : await req.json();

    // ============================================
    // POST: Create a new Vapi Assistant
    // ============================================
    if (method === "POST") {
      // Verify the agent belongs to the user's org
      if (body.agentId) {
        const { data: agent, error: agentError } = await supabase
          .from("ai_agents")
          .select("organization_id")
          .eq("id", body.agentId)
          .maybeSingle();

        if (agentError || !agent || agent.organization_id !== profile.organization_id) {
          return new Response(
            JSON.stringify({ error: "Agent not found in your organization" }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      const systemPromptText = body.systemPrompt || `You are an AI voice agent for a ${body.businessType} business. ${body.description || ""} Your goal is to assist callers professionally and efficiently. Be concise, friendly, and helpful.`;

      const vapiPayload: Record<string, unknown> = {
        name: body.name,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: body.language,
        },
        voice: {
          provider: "11labs",
          voiceId: body.voice,
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: systemPromptText,
            },
            ...(body.greeting
              ? [{ role: "assistant", content: body.greeting }]
              : []),
          ],
          temperature: 0.7,
        },
        firstMessage: body.greeting || `Hello! Thanks for calling. How can I help you today?`,
      };

      const vapiResponse = await fetch("https://api.vapi.ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VAPI_API_KEY}`,
        },
        body: JSON.stringify(vapiPayload),
      });

      if (!vapiResponse.ok) {
        const vapiError = await vapiResponse.json().catch(() => ({}));
        return new Response(
          JSON.stringify({
            error: vapiError.message || vapiError.error || "Failed to create Vapi assistant",
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const vapiAssistant = await vapiResponse.json();

      return new Response(
        JSON.stringify({
          vapiAssistantId: vapiAssistant.id,
          message: "Vapi assistant created successfully",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // PATCH: Update an existing Vapi Assistant
    // ============================================
    if (method === "PATCH") {
      if (!body.vapiAssistantId) {
        return new Response(
          JSON.stringify({ error: "Missing vapiAssistantId" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify ownership
      const { data: agent, error: agentError } = await supabase
        .from("ai_agents")
        .select("organization_id")
        .eq("vapi_assistant_id", body.vapiAssistantId)
        .maybeSingle();

      if (agentError || !agent || agent.organization_id !== profile.organization_id) {
        return new Response(
          JSON.stringify({ error: "Agent not found in your organization" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const systemPromptText = body.systemPrompt || `You are an AI voice agent for a ${body.businessType} business. ${body.description || ""}`;

      const vapiPayload: Record<string, unknown> = {
        name: body.name,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: body.language,
        },
        voice: {
          provider: "11labs",
          voiceId: body.voice,
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: systemPromptText,
            },
            ...(body.greeting
              ? [{ role: "assistant", content: body.greeting }]
              : []),
          ],
          temperature: 0.7,
        },
        firstMessage: body.greeting || `Hello! Thanks for calling. How can I help you today?`,
      };

      const vapiResponse = await fetch(
        `https://api.vapi.ai/assistant/${body.vapiAssistantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${VAPI_API_KEY}`,
          },
          body: JSON.stringify(vapiPayload),
        }
      );

      if (!vapiResponse.ok) {
        const vapiError = await vapiResponse.json().catch(() => ({}));
        return new Response(
          JSON.stringify({
            error: vapiError.message || vapiError.error || "Failed to update Vapi assistant",
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ message: "Vapi assistant updated successfully" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // DELETE: Remove a Vapi Assistant
    // ============================================
    if (method === "DELETE") {
      if (!body.vapiAssistantId) {
        return new Response(
          JSON.stringify({ error: "Missing vapiAssistantId" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify ownership
      const { data: agent, error: agentError } = await supabase
        .from("ai_agents")
        .select("organization_id")
        .eq("vapi_assistant_id", body.vapiAssistantId)
        .maybeSingle();

      if (agentError || !agent || agent.organization_id !== profile.organization_id) {
        return new Response(
          JSON.stringify({ error: "Agent not found in your organization" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const vapiResponse = await fetch(
        `https://api.vapi.ai/assistant/${body.vapiAssistantId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`,
          },
        }
      );

      if (!vapiResponse.ok) {
        const vapiError = await vapiResponse.json().catch(() => ({}));
        return new Response(
          JSON.stringify({
            error: vapiError.message || vapiError.error || "Failed to delete Vapi assistant",
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ message: "Vapi assistant deleted successfully" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
