// ═══════════════════════════════════════════════════════════════
// API /api/ai — Endpoint seguro para OpenAI
// La clave OPENAI_API_KEY vive solo en el servidor (no NEXT_PUBLIC_).
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // deploy en Vercel Edge para baja latencia

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: Message[];
  context?: {
    clones?: { name: string; estado: string; ingresos: number; score: number }[];
    totalIngresos?: number;
    activosCount?: number;
    renovacionesUrgentes?: string[];
  };
}

export async function POST(req: NextRequest) {
  // ── Verificar que la API key está configurada ──────────────
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "IA no configurada. Añade OPENAI_API_KEY en las variables de entorno." },
      { status: 503 }
    );
  }

  // ── Parsear el body ────────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { messages = [], context } = body;
  if (!messages.length) {
    return NextResponse.json({ error: "Sin mensajes" }, { status: 400 });
  }

  // ── Construir el system prompt con contexto del sistema ───
  const contextStr = context
    ? `
Estado actual del ecosistema:
- Clones activos: ${context.activosCount ?? "?"}
- Ingresos totales: ${context.totalIngresos ?? 0}€
- Clones: ${JSON.stringify(context.clones ?? [])}
- Renovaciones urgentes: ${context.renovacionesUrgentes?.join(", ") || "ninguna"}
`
    : "";

  const systemPrompt = `Eres el asistente de inteligencia artificial de EL JEFAZO OS, el sistema de control maestro de apps.
Tu rol es analizar el ecosistema de clones, detectar problemas, sugerir mejoras y responder preguntas sobre el negocio.
Responde siempre en español, de forma directa y concisa. Usa emojis cuando sea útil.
No repitas el contexto completo en tus respuestas, solo la información relevante para la pregunta.
${contextStr}`;

  // ── Llamar a OpenAI ────────────────────────────────────────
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // máximo 10 mensajes de historia
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[AI] OpenAI error:", err);
      return NextResponse.json(
        { error: "Error en OpenAI. Comprueba tu clave y saldo." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sin respuesta";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[AI] Fetch error:", e);
    return NextResponse.json({ error: "Error de conexión con OpenAI" }, { status: 500 });
  }
}
