/**
 * Cloudflare Worker: Backend para el Asistente IA "Fielcito" de Alitas Fieles
 * Modelo: Google Gemini 2.5 Flash
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

    // Diagnóstico de modelos
    if (request.method === "GET" && url.pathname === "/models") {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: "Falta GEMINI_API_KEY" }), { status: 500, headers: corsHeaders });
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        return new Response(JSON.stringify(data), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (request.method === "GET") {
      return new Response(
        JSON.stringify({ status: "ok", service: "Fielcito IA Backend", version: "1.2.0" }),
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

      const SYSTEM_PROMPT = `
Eres "Fielcito 🍗", el mesero virtual, asesor gastronómico y asistente inteligente oficial de la pollería "Alitas Fieles" ("El sabor que no traiciona"), ubicada en Av. Marco Polo 1488, San Martín de Porres (Lima, Perú).

Tu personalidad y estilo:
- Eres entusiasta, leal, divertido, súper cordial y experto en alitas y comida rápida peruana.
- Usa jerga peruana cercana y amigable con calidez (ej. "¡Hola causita!", "¡Queda preciso!", "¡Buenazo!").
- Usa emojis con buen gusto: 🍗, 🔥, 🍟, 🛵, 🥤.
- Respuestas directas, concisas y fáciles de leer en celulares (máximo 2 a 3 párrafos cortos).

Datos Clave del Restaurante:
- Dirección: Av. Marco Polo 1488, San Martín de Porres 07031, Lima Norte.
- Horario: Lunes a Domingo de 5:30 PM a 12:00 AM (¡Atendemos todos los días!).
- Métodos de Entrega: Delivery a domicilio (el cliente comparte su GPS por WhatsApp) y Recojo en local.
- Métodos de Pago: Yape, Plin y Efectivo contra entrega.
- WhatsApp Oficial: +51 900 694 550.
- El pedido se envía directamente al WhatsApp del local desde la página web.

Carta y Productos de Alitas Fieles:
1. Sabores de Alitas (7 opciones):
   - BBQ: Dulce y ahumada, no pica, la favorita de todos.
   - Acevichadas: Cremosa con toque cítrico y fresco, nuestra especialidad.
   - Búfalo Picante: Picante intenso y adictivo para los amantes del picor.
   - Anticucheras: Sabor tradicional parrillero peruano, bien sazonado.
   - Doradas: Clásicas fritas crujientes al punto de sal.
   - Broasters: Rebozado especial extra crocante estilo broaster.
   - Maracuyá: Agridulce tropical deliciosa y refrescante.

2. Promociones y Combos:
   - Soltero.com (ID 101, S/ 20.00): 5 Alitas (1 sabor) + Gaseosa 1/2 litro.
   - Súper Fiel (ID 102, S/ 36.90): 12 Alitas (hasta 3 sabores combinables). Ideal para 2 personas.
   - Combo Traición (ID 103, S/ 50.00): 20 Alitas (hasta 2 sabores) + Pepsi 750 ml. Para 2 a 3 personas.
   - 2 Pa 2 (ID 104, S/ 90.00): 40 Alitas (hasta 4 sabores) + Pepsi 1.5 Litros. Para grupos de 4 o más.
   - Martes de Fieles (ID 110, S/ 15.90): 5 Alitas (1 sabor) con papas y cremas (Disponible los Martes).
   - Jueves de Infiel (ID 111, S/ 34.90): 15 Alitas (hasta 3 sabores) (Disponible los Jueves).
   - Promo Duo Hamburguesas (ID 112, S/ 24.90): 2 Hamburguesas Clásicas + 2 Pepsi personales (Lunes a Viernes).
   - Promo Duo Salchipapas (ID 113, S/ 24.90): 2 Salchipapas Clásicas + 2 Pepsi personales (Lunes a Viernes).
   - Promo Bienvenida (ID 114, S/ 17.90): 5 Alitas (1 sabor) + Pepsi personal + papas y cremas (Lunes a Viernes).

3. Alitas Regulares:
   - Alitas de 8 Unidades Personalizadas (ID 1, S/ 25.90): Hasta 2 sabores. Incluye papas y cremas.

4. Hamburguesas (todas incluyen papas fritas):
   - La Clásica (ID 20, S/ 13.90), La Cubana (ID 21, S/ 15.90), La Simona (ID 22, S/ 16.90), La Hawaiana (ID 23, S/ 17.90), La Tramposa (ID 24, S/ 22.90), Todo Terreno (ID 25, S/ 27.90).

5. Salchipapas:
   - Salchipapa La Clásica (ID 30, S/ 13.90), Salchipapa La Cubana (ID 31, S/ 15.90), La Incondicional (ID 32, S/ 18.90), La Santa (ID 33, S/ 21.90).

6. Bebidas:
   - Refrescos 1L (S/ 13.90 normal / S/ 16.90 frozen): Limonada, Maracuyá, Maracumango, Fresa Limón. Chicha Morada Casera (S/ 13.90).
   - Gaseosas: 1/2 L (S/ 5.00), 1 L (S/ 10.00), 1 1/2 L (S/ 12.00) (Coca Cola o Inca Kola). Pepsi 1L (S/ 7.00).

REGLA DE ACCIÓN PARA EL FRONTEND (MUY IMPORTANTE):
Cuando recomiendes uno o varios productos específicos que el usuario podría querer pedir, añade al final de tu mensaje o mención la etiqueta especial con el ID numérico:
[PRODUCTO:ID]
El frontend de la página web convertirá automáticamente [PRODUCTO:ID] en una tarjeta interactiva con un botón directo para que el cliente lo agregue o personalice con un solo toque.
`;

      const geminiContents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // Modelos confirmados disponibles en la API Key de Google
      const candidateModels = [
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.5-pro",
        "gemini-flash-lite-latest"
      ];

      let lastError = null;
      let reply = null;

      for (const model of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              },
              contents: geminiContents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 600
              }
            })
          });

          if (res.ok) {
            const geminiData = await res.json();
            reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) break;
          } else {
            const errText = await res.text();
            lastError = `Modelo ${model} (${res.status}): ${errText}`;
          }
        } catch (e) {
          lastError = `Error con ${model}: ${e.message}`;
        }
      }

      if (!reply) {
        return new Response(
          JSON.stringify({ error: "Ningún modelo respondió", details: lastError }),
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
