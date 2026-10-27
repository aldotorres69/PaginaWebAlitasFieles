# 🍗 Alitas Fieles - Plataforma E-commerce con Agente de IA Conversacional (LLM)

[![Demo en Vivo](https://img.shields.io/badge/Demo_en_Vivo-Ver_Web_Online-orange?style=for-the-badge&logo=githubpages&logoColor=white)](https://aldotorres69.github.io/PaginaWebAlitasFieles/)
[![LLM Engine](https://img.shields.io/badge/LLM-Google_Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Backend](https://img.shields.io/badge/Backend-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Tailwind_CSS_%2B_Vanilla_JS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Plataforma web comercial y menú digital interactivo para restaurante de comida rápida, potenciado por **Fielcito IA**, un **agente conversacional autónomo basado en Large Language Models (LLM)** capaz de asesorar clientes en tiempo real, recomendar promociones según preferencias y presupuesto, e interactuar directamente con el carrito de compras mediante ejecución de acciones en la interfaz (*Tool / Action Invocation*).

---

## 🌐 Enlaces del Proyecto

* **🚀 Aplicación Desplegada (Live Demo):** [https://aldotorres69.github.io/PaginaWebAlitasFieles/](https://aldotorres69.github.io/PaginaWebAlitasFieles/)
* **⚡ Backend API (Cloudflare Serverless Edge):** `https://alitasfielesai.aldokeller077.workers.dev`
* **📁 Repositorio GitHub:** [https://github.com/aldotorres69/PaginaWebAlitasFieles](https://github.com/aldotorres69/PaginaWebAlitasFieles)

---

## 🧠 Características del Agente de Inteligencia Artificial

### 1. Agente Asesor de Ventas Autónomo (*Conversational Commerce*)
* **Comprensión Semántica:** Procesa lenguaje natural y jerga local peruana ("*algo que no pique*", "*somos 3 causitas*", "*combo para mi bajón*").
* **Asesoramiento Guiado:** Analiza restricciones presupuestarias, nivel de picor y número de comensales para sugerir la combinación óptima de productos.

### 2. Invocación de Acciones en la UI (*Function Calling / Action Tags*)
* El agente no se limita a responder texto; emite directivas estructuradas `[PRODUCTO:ID]`.
* El frontend captura estas directivas y **renderiza tarjetas interactivas de compra dentro del chat**.
* Al hacer clic en **"Pedir"**, el sistema invoca dinámicamente las funciones del carrito (`handleAddButton(id)`), abriendo el personalizador de sabores y sincronizando el estado global del pedido.

### 3. Optimización de Latencia Ultra Baja (*Thinking Budget Tuning*)
* En modelos de razonamiento como **Gemini 2.5 Flash**, se optimizó la llamada a la API configurando `thinking_budget: 0` en el payload JSON.
* Esto elimina el tiempo de razonamiento interno de 10 segundos, reduciendo la latencia de respuesta a **menos de 1.5 segundos** en dispositivos móviles.

### 4. Arquitectura Serverless Segura (Edge Computing)
* La API Key de Google Gemini nunca se expone en el cliente; reside de forma encriptada en las variables de entorno de **Cloudflare Workers**.
* Manejo estricto de encabezados **CORS**, preflight `OPTIONS` y poda automática de contexto (envío de los últimos turnos de diálogo para evitar explosión de tokens y reducir costos).

### 5. Resiliencia y Modo Respaldo (*Dual-Engine Failover*)
* La arquitectura incluye un **motor de respaldo heurístico offline**. Si la conexión de red falla o la API alcanza cuotas máximas, el asistente continúa respondiendo consultas frecuentes sobre salsas, ubicación, métodos de pago y cartas sin interrumpir la experiencia de usuario.

---

## 🏗️ Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────┐
│           Cliente Web (Browser / Mobile)               │
│  - Landing Page Comercial + Menú Interactivo           │
│  - Widget de Chat "Fielcito IA"                        │
│  - Renderizador de Tarjetas & Gestor de Estado Carrito │
└──────────────────────────┬─────────────────────────────┘
                           │ 
             HTTP POST / JSON (CORS Seguro)
                           │ 
┌──────────────────────────▼─────────────────────────────┐
│          Cloudflare Worker (Edge Serverless)           │
│  - Proxy seguro de API Key (Secret Vault)              │
│  - Inyección de System Prompt y Reglas de Negocio      │
│  - Podado de Contexto Histórico                        │
│  - Latency Tuning (thinking_budget: 0)                 │
└──────────────────────────┬─────────────────────────────┘
                           │ 
                    REST API (v1beta)
                           │ 
┌──────────────────────────▼─────────────────────────────┐
│            Google Gemini 2.5 Flash LLM                 │
│  - Razonamiento, extracción de intención de compra     │
│  - Generación de respuestas y tags [PRODUCTO:ID]       │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **LLM & IA** | Google Gemini 2.5 Flash, Google AI Studio REST API |
| **Backend & Edge** | Cloudflare Workers (JavaScript V8 Isolates), Serverless API |
| **Frontend** | HTML5 semántico, Vanilla JavaScript (ES6+), Tailwind CSS |
| **Iconos & Tipografía** | Lucide Icons, Google Fonts (*Poppins*) |
| **Integraciones** | WhatsApp Business Click-to-Chat API, Google Maps Iframe Embed |
| **Hosting & CI/CD** | GitHub Pages, Cloudflare Workers CI |

---

## 📂 Estructura del Repositorio

```text
PaginaWebAlitasFieles/
├── index.html                           # Single Page Application y Widget de IA
├── styles.css                           # Estilos personalizados, chat container y badges
├── img/                                 # Assets visuales y logotipo oficial
│   ├── fondo-principal.jpeg
│   └── logo.png
├── backend/
│   ├── GUIA_IMPLEMENTACION_IA.md        # Documentación de despliegue
│   └── cloudflare-worker/
│       ├── worker.js                    # Código del Serverless Worker con Gemini
│       └── wrangler.toml                # Configuración de despliegue con Wrangler
└── api/
    └── chat.js                          # Endpoint Serverless alternativo para Vercel
```

---

## 💻 Ejecución y Pruebas Locales

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/aldotorres69/PaginaWebAlitasFieles.git
   cd PaginaWebAlitasFieles
   ```

2. **Abrir la web localmente:**
   Puedes abrir directamente `index.html` en tu navegador o servirlo con cualquier servidor local:
   ```bash
   # Con Python
   python -m http.server 8080
   
   # O con Node / npx
   npx serve .
   ```

3. **Desplegar tu propio Worker (Opcional):**
   ```bash
   cd backend/cloudflare-worker
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler deploy
   ```

---

## 👨‍💻 Autor

* **Aldo Torres** - *Desarrollo Full Stack & Soluciones de Inteligencia Artificial*
* **GitHub:** [@aldotorres69](https://github.com/aldotorres69)
* **LinkedIn / Portafolio:** Disponible para contacto
