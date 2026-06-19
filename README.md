# Raahnuma — رہنما
### AI Benefits Navigator for Pakistan's Social Protection System

> **USAII Global AI Hackathon 2026** | Undergraduate Track | Challenge Brief 4A: Benefits Navigator

Raahnuma (Urdu: رہنما — "guide") is an AI-powered benefits navigator that helps Pakistani citizens understand which government welfare programs they may be eligible for — in plain language, in their own language.

## 🎯 Problem

Over 9 million families receive BISP cash transfers, but millions more qualify and don't know it. Eligibility rules are buried in bureaucratic language, spread across multiple agencies, and change by province. People miss out on support not because they don't want it, but because **the system is too confusing to navigate.**

## 🚀 Features

- **AI Chat Navigator** — Describe your situation in plain language, get matched to programs
- **Hybrid AI Architecture** — Rules engine for hard thresholds + LLM for situation parsing
- **6 Languages** — English, Urdu, Sindhi, Pashto, Punjabi, Balochi (with RTL support)
- **Voice Input** — Speak in your language using Web Speech API
- **Document Upload** — Upload CNIC/B-Form for auto-extraction (Gemini Vision)
- **5 Programs** — Kafaalat, Taleemi Wazaif, Nashonuma, Sehat Card, Ramzan Relief
- **Province-Aware** — Different provinces get different answers (Sehat Card variations)
- **Cross-Program Detection** — "Qualifying for X also unlocks Y"
- **Quick Checker** — Step-by-step wizard for non-chat eligibility check
- **Interactive Province Map** — Click a province, see coverage
- **Resource Center** — FAQs, registration guides, SMS templates, glossary
- **Impact Stories** — Before/after persona walkthroughs
- **Responsible AI** — "May qualify" framing, never "you qualify"

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (3.0 Flash, free tier)
- **Voice**: Web Speech API (STT), ElevenLabs (TTS)
- **Rules Engine**: Deterministic TypeScript eligibility evaluator
- **Deploy**: Vercel

## 🏃 Quick Start

```bash
git clone https://github.com/Fastian-afk/Raahnuma.git
cd Raahnuma
npm install
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── navigator/        # AI Chat interface
│   ├── programs/         # Programs explorer
│   ├── checker/          # Quick eligibility wizard
│   ├── map/              # Interactive province map
│   ├── resources/        # FAQs, guides, glossary
│   ├── stories/          # Impact stories
│   └── api/chat/         # Gemini + Rules Engine API
├── components/
│   └── layout/           # AppShell, Sidebar, Navigation
└── lib/
    ├── rules-engine/     # Programs, Evaluator, Types
    └── i18n/             # Multi-language context
```

## 🏆 Team

Built for USAII Global AI Hackathon 2026 — Challenge Brief 4, Direction A: Benefits Navigator

---

*Raahnuma provides guidance only — not official eligibility determination. Final eligibility is determined by BISP through the NSER Dynamic Survey and PMT scoring system.*
