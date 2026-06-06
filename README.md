# ⚡ CapSync: AI-Powered Caption Engine

![CapSync Banner](https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000)

**CapSync** is a premium AI-powered social media caption generator designed for creators who want to stop the scroll. By leveraging advanced Large Language Models (LLMs), CapSync transforms your ideas or images into high-converting, platform-optimized captions in seconds.

---

## ✨ Key Features

- **🤖 Dual-AI Engine**: Powered by **Google Gemini** for text/upload analysis and **CaptionCraft** for image URL analysis.
- **🖼️ Visual Intelligence**: Upload images or provide a URL to get contextually aware captions that match your content perfectly.
- **🎭 Tone Selector**: Choose from various vibes — *Aesthetic, Funny, Professional, Bold, Minimalist, Witty, or Motivational*.
- **🕵️ Agent Mode**: Interact with a virtual "Senior Social Media Strategist" for expert advice and strategic content creation.
- **🌍 Multi-Language Support**: Generate captions in 30+ languages, including English, Spanish, German, Japanese, and more.
- **🎤 Voice Interaction**: Use **Speech-to-Text** to dictate prompts and **Text-to-Speech** (Read Aloud) with multiple voice styles (Podcast, Narrator, Storyteller).
- **📈 Engagement Prediction**: AI-estimated reach scores help you choose the best-performing variation.
- **🏷️ Smart Hashtags**: Automatically suggests 4-6 trending and relevant hashtags for every caption.
- **📲 Platform Optimization**: Tailored formatting and character limits for Instagram, LinkedIn, X (Twitter), and WhatsApp.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)

### Tools & Libraries
- **Routing**: React Router DOM
- **Data Fetching**: TanStack Query (React Query)
- **Validation**: Zod
- **Icons**: Lucide React
- **Notifications**: Sonner & Shadcn Toast

### AI & Services
- **LLM**: Google Gemini AI
- **Image Analysis**: CaptionCraft (via RapidAPI)
- **Analytics**: Vercel Analytics & Speed Insights

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- `npm` or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/callmyselfasaarya/capsync.git
   cd capsync
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_CAPTIONCRAFT_API_KEY=your_rapidapi_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

### Scripts
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run test`: Runs unit tests using Vitest.

---

## ⚡ Performance Optimizations

CapSync features advanced build-time optimizations to ensure fast loading and optimal performance:

- **Code Splitting (Manual Chunks)**:
  - `react-vendor`: Core React dependencies (`react`, `react-dom`, `react-router-dom`)
  - `ui-vendor`: Shadcn UI primitives, Radix UI, Lucide icons, and Tailwind merge utilities
  - `motion-vendor`: Framer Motion animations
  - `chart-vendor`: Recharts visualization library
  - This custom Vite configuration keeps chunk sizes well below the 500 kB limit and prevents circular dependency warnings during the build process.
- **Browserslist Configuration**: Uses an updated `caniuse-lite` database for precise and efficient CSS/JS polyfills (`npx update-browserslist-db@latest`).

---

## 📁 Project Structure

```text
src/
├── assets/         # Images, logos, and static assets
├── components/     # Reusable UI and feature components
│   ├── ui/         # Shadcn base components
│   ├── AgentMode   # AI strategy component
│   └── VoiceInput  # Speech handling component
├── hooks/          # Custom React hooks
├── lib/            # Utility functions (Tailwind merge, etc.)
├── pages/          # Main application views (Index, Generate, Editor)
└── test/           # Test suites and configurations
```

---

## 👨‍💻 Author

Created by **Aarya**  
GitHub: https://github.com/callmyselfasaarya

## 📄 License

Built with ❤️ for creators. © 2026 CapSync. Licensed under the MIT License.
