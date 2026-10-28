/**
 * Cloudflare Worker: Backend de Alta Velocidad para "Fielcito IA"
 * Versión: 2.1.0 (Latencia Ultra Baja < 1.5s, Sanitización de Roles, Timeout y Fallback)
 */

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Endpoint de diagnóstico rápido de velocidad y estado
    if (request.method === "GET" && url.pathname === "/debug") {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: "Falta GEMINI_API_KEY" }), { headers: corsHeaders });
      
      const t0 = Date.now();
      try {
        const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Responde: OK" }] }],
            generationConfig: { maxOutputTokens: 10 }
          }),
          signal: AbortSignal.timeout(5000)
        });
        const elapsed = Date.now() - t0;
        const data = await testRes.json();
        return new Response(JSON.stringify({ status: testRes.status, elapsed_ms: elapsed, data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message, elapsed_ms: Date.now() - t0 }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    if (request.method === "GET") {
      return new Response(
        JSON.stringify({ status: "ok", service: "Fielcito IA Ultra-Fast Backend", version: "2.1.0" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método no permitido. Utiliza POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    try {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: "Falta configurar GEMINI_API_KEY en Cloudflare." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await request.json();
      const messages = body.messages || [];

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "Se requiere un array de 'messages'." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Convertir mensajes al formato de Gemini
      let geminiContents = messages.slice(-5).map(msg => ({
        role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // REGLA CRÍTICA DE GEMINI: El primer mensaje del array 'contents' DEBE ser siempre de rol 'user'
      while (geminiContents.length > 0 && geminiContents[0].role !== "user") {
        geminiContents.shift();
      }

      // Si quedó vacío, insertamos el mensaje del usuario por defecto
      if (geminiContents.length === 0) {
        geminiContents.push({ role: "user", parts: [{ text: "Hola" }] });
      }

      // Fusionar mensajes consecutivos del mismo rol para evitar errores de alternancia en Gemini
      const sanitizedContents = [];
      for (const item of geminiContents) {
        if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === item.role) {
          sanitizedContents[sanitizedContents.length - 1].parts[0].text += `\n${item.parts[0].text}`;
        } else {
          sanitizedContents.push(item);
        }
      }

      const SYSTEM_PROMPT = `
Eres "Fielcito 🍗", el mesero virtual rápido y amigable de "Alitas Fieles" (Av. Marco Polo 1488, San Martín de Porres).
Eslogan: "El sabor que no traiciona". Horario: Lunes a Domingo de 5:30 PM a 12:00 AM. Pagos: Yape, Plin y Efectivo. WhatsApp: +51 987 654 321.

REGLAS DE ORO:
1. Respuestas SÚPER BREVES Y DIRECTAS (máximo 1 o 2 párrafos cortos de 3 líneas).
2. Tono peruano cálido, leal y con buena vibra ("causita", "buenazo", "firme").
3. Emojis moderados (🍗, 🔥, 🍟, 🛵).

Carta resumida:
- Salsas (7): BBQ (no pica, dulce), Acevichadas (cremosa cítrica), Búfalo Picante (bien picante), Anticucheras, Doradas, Broasters, Maracuyá (agridulce).
- Combos y Promos:
  * Soltero.com (S/ 20.00): 5 alitas + gaseosa 1/2L [PRODUCTO:101]
  * Súper Fiel (S/ 36.90): 12 alitas (hasta 3 sabores, ideal 2 personas) [PRODUCTO:102]
  * Combo Traición (S/ 50.00): 20 alitas + Pepsi 750ml (2-3 personas) [PRODUCTO:103]
  * 2 Pa 2 (S/ 90.00): 40 alitas + Pepsi 1.5L (grupos) [PRODUCTO:104]
  * Martes de Fieles (S/ 15.90): 5 alitas (solo martes) [PRODUCTO:110]
  * Jueves de Infiel (S/ 34.90): 15 alitas (solo jueves) [PRODUCTO:111]
  * Promo Duo Hamburguesas (S/ 24.90): 2 hamburguesas + 2 Pepsi [PRODUCTO:112]
  * Promo Duo Salchipapas (S/ 24.90): 2 salchipapas + 2 Pepsi [PRODUCTO:113]
  * Promo Bienvenida (S/ 17.90): 5 alitas + Pepsi + papas [PRODUCTO:114]
- Alitas 8 Unidades (S/ 25.90) [PRODUCTO:1]
- Hamburguesas: La Clásica (S/ 13.90) [PRODUCTO:20], La Simona c/ queso (S/ 16.90) [PRODUCTO:22], La Tramposa c/ huevo y tocino (S/ 22.90) [PRODUCTO:24]
- Salchipapas: La Clásica (S/ 13.90) [PRODUCTO:30], La Incondicional (S/ 18.90) [PRODUCTO:32], La Santa (S/ 21.90) [PRODUCTO:33]
- Bebidas: Chicha Morada 1L (S/ 13.90) [PRODUCTO:60], Refrescos Frozen (S/ 16.90), Gaseosas desde S/ 5.00.

IMPORTANTE: Siempre que recomiendes un producto pon al final de la mención su código exacto [PRODUCTO:ID]. Sé muy conciso.
`;

      // Modelos ordenados por velocidad y disponibilidad
      const candidateModels = [
        "gemini-flash-latest",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash"
      ];

      let lastError = null;
      let reply = null;

      for (const model of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          
          // Timeout estricto de 4.5 segundos por modelo para que nunca se cuelgue
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              },
              contents: sanitizedContents,
              generationConfig: {
                thinkingConfig: {
                  thinkingBudget: 0
                },
                temperature: 0.6,
                maxOutputTokens: 280
              }
            }),
            signal: AbortSignal.timeout(4500)
          });

          if (res.ok) {
            const geminiData = await res.json();
            reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) break;
          } else {
            // Reintento rápido simplificado
            const errBody = await res.text();
            lastError = `Modelo ${model} (${res.status}): ${errBody}`;
          }
        } catch (e) {
          lastError = `Error con ${model}: ${e.message}`;
        }
      }

      if (!reply) {
        return new Response(
          JSON.stringify({ error: "No se pudo obtener respuesta rápida de Gemini", details: lastError }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ reply }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message || "Error interno del servidor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
};
