<<<<<<< HEAD
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
   git clone https://github.com/your-username/capsync.git
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

## 📄 License

Built with ❤️ for creators. © 2026 CapSync.
=======
# CapSync

CapSync is a quick and lightweight synchronization application designed to synchronize any data from the clipboard or file across multiple devices efficiently. It offers a user-friendly interface with a high level of performance for both developers and everyday users.

## ✨ Features

- Real-time synchronization
- Efficient performance and lightweight nature
- Compatible with various platforms
- Data security while transferring
- Easy setup and configuration process

## 📦 Installation

```bash
git clone https://github.com/callmyselfasaarya/capsync.git
cd capsync
npm install
```

## 🚀 Usage

Run the application:

```bash
npm start
```

## 📂 Project Structure

```bash
capsync/
│── src/
│── config/
│── tests/
│── README.md
```

## 🤝 Contributing

Any contributions are welcome. Fork the repo, checkout a new branch and create a pull request.

## 📄 License

Licensed under the MIT License

## 👨‍💻 Author

Created by **Aarya**  
GitHub: https://github.com/callmyselfasaarya

## ⭐ Support

Please show your support for this project with a ⭐.
>>>>>>> 904b3ab7b79aded8dcd511ab3974aa9d2dc4eecb
