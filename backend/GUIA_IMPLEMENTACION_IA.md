# 🍗 Guía de Implementación: Asistente IA "Fielcito" (Alitas Fieles)

Esta guía te explica cómo activar el agente de inteligencia artificial **Fielcito** en tu página web utilizando **Google Gemini 1.5 Flash** (100% gratuito) y **Cloudflare Workers**.

---

## 🔑 Paso 1: Obtener tu API Key gratuita de Gemini (1 minuto)

1. Ingresa a **[Google AI Studio](https://aistudio.google.com/)** e inicia sesión con cualquier cuenta de Google.
2. Haz clic en el botón azul **"Get API key"** (o "Crear clave de API").
3. Haz clic en **"Create API key in new project"**.
4. Copia tu clave generada (se verá como `AIzaSy...`).

---

## ☁️ Paso 2: Desplegar el Backend en Cloudflare Workers (Gratis)

Tienes dos formas muy sencillas de poner a funcionar tu backend:

### Opción A (La más fácil - Desde el navegador web):
1. Inicia sesión en tu cuenta de [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. En el menú lateral izquierdo, ve a **Compute (Workers) -> Workers & Pages**.
3. Haz clic en **"Create application"** -> pestaña **"Workers"** -> **"Create Worker"**.
4. Dale de nombre `alitas-fieles-ai` y pulsa **"Deploy"**.
5. Ahora pulsa **"Edit code"**:
   - Borra el código de ejemplo que viene en `worker.js`.
   - Copia y pega todo el contenido de nuestro archivo local [`backend/cloudflare-worker/worker.js`](./cloudflare-worker/worker.js).
   - Haz clic en **"Deploy"** (arriba a la derecha).
6. Configurar la clave secreta:
   - Regresa a la configuración del Worker (`Settings` -> `Variables and Secrets`).
   - En **Variables and Secrets**, pulsa **"Add"**.
   - Nombre: `GEMINI_API_KEY`
   - Tipo: **Secret** (o texto encriptado).
   - Valor: Pega tu clave de Gemini del Paso 1.
   - Pulsa **Save and deploy**.
7. ¡Listo! Copia la URL pública de tu Worker (ejemplo: `https://alitas-fieles-ai.tu-usuario.workers.dev`).

---

### Opción B (Desde la terminal con Wrangler):
Si tienes instalado Node.js:
```bash
cd backend/cloudflare-worker
npx wrangler secret put GEMINI_API_KEY
# (Escribe o pega tu clave de Gemini cuando te lo pida)

npx wrangler deploy
```

---

## 🔗 Paso 3: Conectar el Worker a tu Página Web

Abre el archivo [`index.html`](../index.html) y en la sección del script busca la variable:

```javascript
// Reemplaza esta URL por la URL pública que te dio Cloudflare:
const AI_WORKER_URL = "https://alitas-fieles-ai.tu-usuario.workers.dev";
```

¡Y listo! Al subir los cambios a GitHub, cualquier cliente que visite tu página web podrá chatear con **Fielcito**, recibir sugerencias de combos y añadir los productos directamente a su carrito.

> [!NOTE]
> Mientras no configures la URL del Worker o si estás sin conexión, el chat incluye un **Modo Inteligente Offline** de respaldo que responde instantáneamente dudas sobre salsas, ubicación, horarios y promociones sin romperse.
