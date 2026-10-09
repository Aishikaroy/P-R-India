<p align="center">
  <img src="P.-R.-India-Health-Services-main/public/favicon.svg" alt="P. R. India Health Services" width="80" />
</p>

<h1 align="center">P. R. India Health Services</h1>

<p align="center">
  <strong>Professional Critical Care & Home Healthcare Services</strong><br/>
  Bringing hospital-grade care to the comfort of your home across India.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#pages">Pages</a> •
  <a href="#license">License</a>
</p>

---

## 🏥 About

**P. R. India Health Services** is a modern, full-featured web application for a home healthcare company operating in India. The platform connects patients and families with coordinated home healthcare support — including **Home ICU setup**, **Nursing Services**, **Doctor Home Visits**, **Physiotherapy**, **Caregiver/Attendant Services**, and **Medical Equipment** rental.

The website is designed with a premium, responsive UI and serves as both a marketing site and a service request portal.

---

## ✨ Features

- 🏠 **Home ICU Setup** — Hospital-grade ICU care delivered at home with full monitoring equipment
- 👩‍⚕️ **Nursing Services** — Qualified nurses for post-operative, critical, and general care
- 🩺 **Doctor Home Visits** — Specialist and general physician consultations at your doorstep
- 🤝 **Caregiver & Attendant Services** — Trained attendants for daily patient support
- 💪 **Physiotherapy** — In-home physiotherapy and rehabilitation programs
- 🔧 **Medical Equipment** — Rental of hospital beds, oxygen concentrators, monitors, and more
- 📋 **Service Request Form** — Multi-step form with validation for requesting any service
- 👥 **Join Our Team** — Application portal for healthcare professionals
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop
- 🎨 **Animated Dropdown Navigation** — Smooth, responsive services dropdown menu
- 🌙 **Dark Mode UI** — Premium dark theme with glassmorphism effects
- ⚡ **SEO Optimized** — Meta tags, Open Graph data, and semantic HTML on every page

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (file-based) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Backend** | [Supabase](https://supabase.com/) |
| **Testing** | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| **Language** | TypeScript 5.8 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or **bun**)

### Installation

```bash
# Clone the repository
git clone https://github.com/Aishikaroy/P-R-India.git
cd P-R-India

# Install dependencies
cd P.-R.-India-Health-Services-main
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Development

```bash
# Start the dev server (from root)
npm run dev

# Or from the inner project directory
cd P.-R.-India-Health-Services-main
npm run dev
```

The app will be available at **http://localhost:8080**

### Build & Preview

```bash
npm run build      # Production build
npm run preview    # Preview the production build
```

### Testing

```bash
npm run test           # Run tests once
npm run test:watch     # Run tests in watch mode
```

---

## 📁 Project Structure

```
P-R-India/
├── P.-R.-India-Health-Services-main/
│   ├── public/                    # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── assets/                # Images (hero, team, ICU, about)
│   │   ├── components/
│   │   │   ├── site/              # Site-wide components (Header, Footer, CTA)
│   │   │   └── ui/                # Reusable UI primitives (shadcn/ui)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utility functions
│   │   ├── routes/                # File-based routes (TanStack Router)
│   │   │   ├── index.tsx          # Homepage
│   │   │   ├── services.tsx       # Services overview
│   │   │   ├── home-icu.tsx       # Home ICU service page
│   │   │   ├── nursing-services.tsx
│   │   │   ├── doctor-visits.tsx
│   │   │   ├── caregiver-services.tsx
│   │   │   ├── physiotherapy.tsx
│   │   │   ├── medical-equipment.tsx
│   │   │   ├── about.tsx
│   │   │   ├── contact.tsx
│   │   │   ├── request-service.tsx
│   │   │   ├── join-team.tsx
│   │   │   └── ...
│   │   ├── styles.css             # Tailwind config & design tokens
│   │   └── test/                  # Test suites
│   ├── supabase/                  # Supabase migrations & config
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── package.json                   # Root scripts (delegates to inner project)
├── .gitignore
└── README.md
```

---

## 📄 Pages

| Route | Description |
|---|---|
| `/` | Homepage with hero section, services overview, testimonials |
| `/services` | All services at a glance |
| `/home-icu` | Home ICU setup details |
| `/nursing-services` | Nursing care services |
| `/doctor-visits` | Doctor home visit consultations |
| `/caregiver-services` | Attendant & caregiver services |
| `/physiotherapy` | In-home physiotherapy programs |
| `/medical-equipment` | Medical equipment rental catalog |
| `/about` | Company mission, vision & values |
| `/contact` | Contact information & form |
| `/request-service` | Multi-step service request form |
| `/join-team` | Healthcare professional application portal |
| `/healthcare-team` | Meet the team |
| `/privacy-policy` | Privacy policy |
| `/terms` | Terms of service |
| `/medical-disclaimer` | Medical disclaimer |

---

## 🎨 Design Highlights

- **Dark premium theme** with carefully curated color palette using HSL tokens
- **Glassmorphism effects** on cards and navigation elements
- **Micro-animations** — smooth hover transitions, dropdown reveals, and scroll effects
- **Responsive navigation** — animated dropdown on desktop, accordion on mobile
- **Indian-context imagery** — all photographs feature Indian healthcare professionals and patients in authentic home settings

---

## 📬 Contact

For inquiries about P. R. India Health Services:

- 📞 **Phone:** +91 available on the website
- 🌐 **Website:** [Visit Live Site](https://p-r-india.vercel.app)

---

<p align="center">
  Made with ❤️ in India
</p>
