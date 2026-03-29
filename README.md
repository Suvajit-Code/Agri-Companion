<div align="center">

<a href="https://agri-companion.vercel.app/" target="_blank">
  <img src="https://github.com/Snehasish-tech/Agri-Companion/assets/80269820/58320b1a-0553-425c-a1d2-8f4f1139c89d" alt="KrishiGrowAI Logo" width="120" />
</a>

# 🌾 KrishiGrowAI

### *AI-Powered Smart Farming for the Modern Indian Farmer*

<br/>

<p>
  <a href="https://agri-companion.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Vercel-Live_Demo-black?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://github.com/Snehasish-tech/Agri-Companion/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/github/license/Snehasish-tech/Agri-Companion?style=for-the-badge&color=blue" alt="License" />
  </a>
  <a href="https://github.com/Snehasish-tech/Agri-Companion/stargazers" target="_blank">
    <img src="https://img.shields.io/github/stars/Snehasish-tech/Agri-Companion?style=for-the-badge&color=yellow" alt="Stars" />
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</p>

> **KrishiGrowAI** is a next-generation smart farming companion that empowers Indian farmers with AI-driven crop advice, real-time market intelligence, direct buyer connections, and complete farm management — all in one platform.

<br/>

[🚀 Live Demo](https://agri-companion.vercel.app/) &nbsp;|&nbsp; [📸 Screenshots](#-screenshots) &nbsp;|&nbsp; [⚙️ Setup](#-getting-started) &nbsp;|&nbsp; [🤝 Contributing](#-contributing)

---

</div>

## 🤔 Why KrishiGrowAI?

Indian agriculture is the backbone of our nation, yet farmers face immense challenges: unpredictable weather, volatile market prices, soil degradation, and a lack of access to modern technology.

**KrishiGrowAI** was built to bridge this gap. Our mission is to put the power of data and artificial intelligence directly into the hands of every farmer. We provide actionable insights and tools that help:

-   ✅ **Increase Yields:** By recommending the right crop for the right soil and climate.
-   ✅ **Boost Profits:** Through real-time market price tracking and direct-to-buyer sales.
-   ✅ **Reduce Risks:** With accurate weather forecasts and timely pest alerts.
-   ✅ **Promote Sustainability:** By encouraging modern, efficient farming practices.

This platform is more than just an app; it's a commitment to a more prosperous and sustainable future for Indian agriculture.

---

## ✨ Core Features

| Icon | Feature | Description |
| :---: | --- | --- |
| 🤖 | **AI Crop Advisor** | Personalized crop recommendations based on soil type, local climate, and market demand. |
| 🌦️ | **Hyperlocal Weather** | 7-day agricultural forecasts with alerts for rain, frost, and extreme heat. |
| 📈 | **Market Price Analytics** | Live *mandi* prices from across the country with AI-powered future price trend predictions. |
| 🛒 | **E-Commerce Marketplace** | Buy certified seeds, fertilizers, and equipment directly from verified sellers. |
| 🏭 | **Smart Storage Solutions** | Find and book nearby cold storage and warehouses with real-time quality monitoring. |
| 🤝 | **Farmer-to-Market Connect** | A community-driven platform to sell produce directly to businesses and consumers, cutting out middlemen. |
| 💬 | **AI Farming Assistant** | An intelligent chatbot for instant pest/disease identification, soil advice, and government scheme information. |
| 📚 | **Digital Knowledge Base** | A rich library of modern farming guides, tutorial videos, and expert articles in multiple languages. |
| 💰 | **Farm Finance Tools** | Easy-to-use ROI calculators, expense trackers, and a directory of available government subsidies. |
| 👥 | **Community Forum** | A social hub for farmers to ask questions, share knowledge, and build a supportive network. |

---

## 📸 Screenshots

*A picture is worth a thousand words. Here's a glimpse of KrishiGrowAI in action.*

<div align="center">

<img width="1917" height="909" alt="KrishiGrowAI Dashboard" src="https://github.com/user-attachments/assets/8c07ded4-d57d-414e-b22c-6f6224160375" />
*The main dashboard, providing a complete overview of your farm.*

<!-- Add more screenshots here! -->
<!-- e.g., <img src="path/to/market_prices.png" width="48%" alt="Market Prices"> -->
<!-- e.g., <img src="path/to/community_forum.png" width="48%" alt="Community Forum"> -->

</div>

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework:** **React 18** with **TypeScript** for a robust, type-safe, and component-based architecture.
- **Build Tool:** **Vite 5** provides a lightning-fast development server and optimized production builds.
- **Styling:** **Tailwind CSS 3** for a utility-first, responsive design system.
- **UI Components:** **shadcn/ui** & **Radix UI** for a library of accessible, themeable, and unstyled components.
- **Animation:** **Framer Motion** for fluid animations and page transitions.
- **3D Graphics:** **Three.js** & **@react-three/fiber** for the interactive 3D hero scene.
- **Routing:** **React Router v6** for declarative client-side routing.
- **Data Fetching:** **TanStack Query (React Query)** for efficient server state management, caching, and data synchronization.
- **Data Visualization:** **Recharts** for creating beautiful and informative charts.

### Backend & Services
- **Backend-as-a-Service (BaaS):** **Supabase** is used for its powerful suite of tools:
  - **PostgreSQL Database:** A scalable, relational database for all application data.
  - **Authentication:** Secure user management with email/password and social logins.
  - **Row Level Security (RLS):** Fine-grained data access control, ensuring users only see their own data.
  - **Edge Functions:** Serverless Deno functions for running backend logic, such as the AI chat integration.

### Developer Experience
- **Linting:** **ESLint** & **TypeScript ESLint** to enforce code quality and consistency.
- **Testing:** **Vitest** & **React Testing Library** for fast and effective unit/integration testing.
- **CSS Tooling:** **PostCSS** & **Autoprefixer** for modern CSS processing.

---

## 📁 Project Structure

```
agri-companion/
├── public/
│   ├── models/              # 3D GLB model files for the hero scene
│   └── robots.txt           # SEO instructions for web crawlers
├── src/
│   ├── assets/              # Static images, icons, and other resources
│   ├── components/          # Reusable React components (e.g., Navbar, Footer)
│   │   ├── ui/              # Core shadcn/ui primitives (Button, Card, etc.)
│   │   └── ...
│   ├── contexts/            # React Context for global state (e.g., AuthContext)
│   ├── hooks/               # Custom React hooks for shared logic
│   ├── integrations/        # Supabase client setup and auto-generated types
│   ├── lib/                 # Utility functions (e.g., date formatting)
│   └── pages/               # Top-level components for each route/page
│       ├── Index.tsx        # The main landing page
│       ├── Auth.tsx         # Login / Signup page
│       └── ...              # All other feature pages
├── supabase/
│   ├── config.toml          # Supabase project configuration
│   ├── functions/           # Deno Edge Functions (e.g., AI chatbot)
│   └── migrations/          # Database schema changes and versioning
└── ...                      # Root config files (vite, tsconfig, tailwind, etc.)
```

---

## 🚀 Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites

-   **Node.js:** Version 18.x or higher. [Download here](https://nodejs.org/).
-   **npm:** Should be included with your Node.js installation.
-   **Git:** For cloning the repository.
-   A **Supabase** account: [Sign up for a free account](https://supabase.com/).

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Snehasish-tech/Agri-Companion.git
    cd Agri-Companion
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up your Supabase project:**
    -   Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
    -   Navigate to the **SQL Editor**.
    -   Open each file in the `supabase/migrations/` directory of this repository, copy the SQL content, and run it in the Supabase SQL Editor. This will create all the necessary tables and policies.

4.  **Configure Environment Variables:**
    -   Create a new file named `.env` in the root of your project.
    -   Go to your Supabase project's **Settings > API**.
    -   Copy the **Project URL** and the **`anon` public key**.
    -   Paste them into your `.env` file like this:

    ```env
    # Supabase Credentials
    VITE_SUPABASE_URL="YOUR_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_ANON_PUBLIC_KEY"

    # Other API Keys (Optional)
    # VITE_GROQ_API_KEY="your_groq_api_key"
    # VITE_OPENWEATHERMAP_API_KEY="your_openweathermap_api_key"
    ```

### Running the Application

```bash
# Start the development server (usually on http://localhost:5173)
npm run dev

# Run unit tests
npm run test

# Check for TypeScript errors
npm run build

# Build the application for production
npm run build

# Preview the production build locally
npm run preview
```

---

## ☁️ Deployment

This project is optimized for deployment on **Vercel**.

1.  **Push your code to a GitHub repository.**
2.  **Import your project on Vercel.** Vercel will automatically detect that it's a Vite project.
3.  **Add your environment variables** (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the Vercel project settings.
4.  **Deploy!** Vercel will automatically build and deploy your site. Any subsequent pushes to your main branch will trigger new deployments.

---

## 🗺️ Roadmap

- [x] AI Crop Recommendation Engine
- [x] Weather Intelligence Dashboard
- [x] Direct Farmer-to-Buyer Marketplace
- [x] Cold Storage Booking System
- [x] AI Chatbot with Pest Identification
- [x] Community Forum with Posts, Comments & Likes
- [x] Knowledge Base with Articles
- [x] Farm Financial Tools & ROI Calculator
- [ ] 📱 **Mobile App:** Develop a cross-platform mobile app using React Native.
- [ ] 🌐 **Multilingual Support:** Add support for major Indian languages (Hindi, Bengali, Tamil, Telugu).
- [ ] 📶 **Offline-First Mode:** Implement Progressive Web App (PWA) capabilities for offline access.
- [ ] 🛰️ **Satellite Imagery:** Integrate satellite data for crop health monitoring.
- [ ] 📡 **IoT Sensor Dashboard:** Allow farmers to connect and monitor on-field IoT devices.
- [ ] 🏦 **Microfinance Integration:** Partner with financial institutions to offer microloans.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  **Fork the Project** on GitHub.
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit your Changes** (`git commit -m 'feat: Add some AmazingFeature'`).
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`).
5.  **Open a Pull Request**.

Please adhere to the following commit message format:
- `feat:` A new feature
- `fix:` A bug fix
- `style:` UI, styling, or formatting changes
- `docs:` Documentation updates
- `refactor:` Code refactoring without changing functionality
- `chore:` Build process or auxiliary tool changes

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for full details.

---

## 👩‍💻 Author

**Snehasish Dey, Suvajit Ghosh** — *Building technology for the farmers of India 🇮🇳*

<div align="center">

---

### 🌱 *Empowering every farmer with the power of AI*

<br/>

**⭐ If KrishiGrowAI helps you, please give it a star — it means a lot! ⭐**

<br/>

Made with ❤️ for all Indian Farmers

</div>

