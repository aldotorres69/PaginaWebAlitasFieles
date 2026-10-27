/**
 * Vercel Serverless Function: api/chat.js
 * Compatible con despliegue en Vercel
 */
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ status: "ok", service: "Fielcito IA Vercel API" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY en variables de entorno." });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Se requiere array 'messages'." });
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
- WhatsApp Oficial: +51 987 654 321.
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
Cuando recomiendes uno o varios productos específicos que el usuario podría querer pedir, añade al final de tu mensaje la etiqueta especial con el ID numérico:
[PRODUCTO:ID]
`;

    const geminiContents = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: geminiContents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
      })
    });

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text();
      return res.status(geminiResponse.status).json({ error: "Gemini Error", details: err });
    }

    const geminiData = await geminiResponse.json();
    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No pude responder en este momento.";

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
