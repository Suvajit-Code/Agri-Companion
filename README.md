<div align="center">

# 🌾 KrishiGrowAI

### *Smart Farming Platform Powered by Artificial Intelligence*

<br/>

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<br/>

> **KrishiGrowAI** is a next-generation smart farming companion that empowers Indian farmers with AI-driven crop advice, real-time market intelligence, direct buyer connections, and complete farm management — all in one platform.

<br/>

[🚀 Live Demo](#) &nbsp;|&nbsp; [📸 Screenshots](#-screenshots) &nbsp;|&nbsp; [⚙️ Setup](#-getting-started) &nbsp;|&nbsp; [🤝 Contributing](#-contributing)

---

</div>

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Crop Advisor** | Personalized crop recommendations based on soil, climate & market |
| 🌦️ **Weather Intelligence** | 7-day ag-specific forecasts with smart alerts |
| 📈 **Market Analytics** | Real-time mandi prices & AI-powered price predictions |
| 🛒 **E-Commerce Marketplace** | Buy seeds, fertilizers & farm equipment |
| 🏭 **Storage Solutions** | Book cold storage & warehouses with quality monitoring |
| 🤝 **Farmer-to-Market** | Sell directly to buyers — no middlemen |
| 💬 **AI Chatbot** | Pest identification & instant expert advice |
| 📚 **Knowledge Base** | Modern farming guides, videos & expert articles |
| 💰 **Financial Tools** | ROI calculator, expense tracker & subsidy finder |

---

## 📸 Screenshots

<div align="center">

<img width="1917" height="909" alt="Screenshot 2026-03-07 203443" src="https://github.com/user-attachments/assets/8c07ded4-d57d-414e-b22c-6f6224160375" />

</div>

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** — Component-based UI with type safety
- **Vite 5** — Lightning-fast dev server & build tool
- **Tailwind CSS 3** — Utility-first responsive styling
- **Framer Motion** — Smooth animations & page transitions
- **Three.js** + **@react-three/fiber** — Interactive 3D hero scene
- **shadcn/ui** + **Radix UI** — Accessible, customizable components
- **React Router v6** — Client-side routing
- **TanStack Query** — Server state & data fetching
- **Recharts** — Data visualization & charts

### Backend & Services
- **Supabase** — PostgreSQL database, Auth & Edge Functions
- **Row Level Security (RLS)** — Per-user data isolation
- **Supabase Edge Functions** — AI chat integration (Deno runtime)

### Developer Experience
- **ESLint** + **TypeScript ESLint** — Code linting & quality
- **Vitest** + **Testing Library** — Unit testing
- **PostCSS** + **Autoprefixer** — CSS tooling

---

## 📁 Project Structure

```
krishigrowai/
├── public/
│   ├── models/              # 3D GLB model files
│   └── logo.jpg             # App favicon & branding
├── src/
│   ├── assets/              # Images & static resources
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui primitives (50+ components)
│   │   ├── BrandLogo.tsx    # KrishiGrowAI branded logo
│   │   ├── HeroSection.tsx  # Landing hero with 3D scene
│   │   ├── Hero3DScene.tsx  # Three.js 3D model viewer
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── Navbar.tsx
│   │   └── DashboardLayout.tsx
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # Supabase client & auto-generated types
│   ├── lib/                 # Utility functions
│   └── pages/               # Route-level page components
│       ├── Index.tsx        # Landing page
│       ├── Auth.tsx         # Login / Signup
│       ├── DashboardHome.tsx
│       ├── AIRecommendation.tsx
│       ├── Marketplace.tsx
│       ├── Weather.tsx
│       ├── MarketPrices.tsx
│       ├── Chatbot.tsx
│       ├── Community.tsx
│       ├── KnowledgeBase.tsx
│       ├── FarmerToMarket.tsx
│       ├── Storage.tsx
│       ├── MyFarms.tsx
│       ├── Orders.tsx
│       └── Settings.tsx
├── supabase/
│   ├── config.toml
│   ├── functions/           # Deno Edge Functions
│   │   └── farming-chat/    # AI chatbot backend
│   └── migrations/          # Database schema migrations
└── ...config files
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** — [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Supabase** account — [Sign up free](https://supabase.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/krishigrowai.git
cd krishigrowai

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file in the root directory:
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Get these from: Supabase Dashboard → Your Project → Settings → API

### Run Locally

```bash
# Start development server
npm run dev
# → Opens at http://localhost:8080

# Run tests
npm run test

# Type-check
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 🗺️ Roadmap

- [x] AI Crop Recommendation engine
- [x] Weather intelligence dashboard
- [x] Direct farmer-to-buyer marketplace
- [x] Cold storage booking system
- [x] AI chatbot with pest identification
- [x] Community forum
- [x] Knowledge base with articles
- [x] Financial tools & ROI calculator
- [ ] 📱 Mobile app (React Native)
- [ ] 🌐 Multilingual support (Hindi, Bengali, Tamil, Telugu)
- [ ] 📶 Offline-first PWA mode
- [ ] 🛰️ Satellite imagery integration
- [ ] 📡 IoT sensor dashboard
- [ ] 🏦 Microfinance & loan marketplace

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# 1. Fork the project on GitHub

# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Make your changes & commit
git add .
git commit -m "feat: add AmazingFeature"

# 4. Push to your branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request on GitHub
```

**Commit message format:**
- `feat:` — New feature
- `fix:` — Bug fix
- `style:` — UI/styling changes
- `docs:` — Documentation updates
- `refactor:` — Code refactoring

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for full details.

---

## 👩‍💻 Author

**Sneha** — Building technology for the farmers of India 🇮🇳

<div align="center">

---

### 🌱 *Empowering every farmer with the power of AI*

<br/>

**⭐ If KrishiGrowAI helps you, please give it a star — it means a lot! ⭐**

<br/>

Made with ❤️ for Indian Farmers

</div>
