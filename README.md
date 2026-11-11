# KetikKilat

A minimal, low-latency typing speed test platform focused on raw keyboard telemetry and hardware mechanical switch audio synthesis.

Live Deployment: [ketikkilat.naan.my.id](https://ketikkilat.naan.my.id)

---

## Overview

KetikKilat provides an uninterrupted typing benchmark environment. It calculates real-time typing speed and accuracy metrics per keystroke without reliance on external heavy audio assets, utilizing native browser audio synthesis to simulate mechanical switch tactile feedback.

---

## Core Features

- **Real-Time Telemetry Engine**: Computes Gross WPM, Net WPM, CPM, and instantaneous character accuracy.
- **Synthesized Audio Feedback**: Native Web Audio API implementation generating mechanical click acoustics dynamically at runtime without media file downloads.
- **Configurable Test Modes**: Timed intervals (15s, 30s, 60s) and variable text buffers.
- **Global Leaderboard**: Session score logging with client-server validation to mitigate tampered telemetry submissions.
- **Zero-Distraction Interface**: High-contrast, dark-mode default UI built for optimal readability and rapid key registration.

---

## Architecture & Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Audio Synthesis**: Web Audio API (OscillatorNode & GainNode profiling)
- **State Management & Telemetry**: React Hooks (`useReducer`, custom telemetry dispatcher)
- **Database / API**: Supabase / Serverless Route Handlers
- **Hosting**: Vercel

---

## Project Structure

```text
ketikkilat/
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Route handlers and layout entry points
│   │   ├── api/            # Leaderboard verification and score endpoints
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         # Atomic and compound UI blocks
│   │   ├── Header.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── MetricDisplay.tsx
│   │   └── TypingEngine.tsx
│   ├── hooks/              # Custom execution hooks
│   │   ├── useAudioClick.ts
│   │   └── useTypingTest.ts
│   ├── lib/                # Utility modules, metrics calculation, and clients
│   │   ├── metrics.ts
│   │   └── supabase.ts
│   └── types/              # Telemetry and state interfaces
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hananchaliq/ketikkilat.git
   cd ketikkilat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Provide the required keys if connecting to an external leaderboard database:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

To generate an optimized production bundle:

```bash
npm run build
npm run start
```

---

## License

Distributed under the MIT License. See `LICENSE` for details.