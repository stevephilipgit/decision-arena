# ⚖️ DecisionArena

> Two AI advisors argue both sides of any business decision — so your team sees every angle before committing.

🔗 **Live Demo:** [your-vercel-url.vercel.app](https://decision-arena-git-main-steve-philips-projects.vercel.app/)

---

## What It Does

Most teams make bad decisions because no one argues the other side hard enough. DecisionArena fixes that.

1. **Enter** any business decision
2. **Watch** two AI advisors debate it in structured rounds
3. **Get** a Decision Report with risks, arguments & AI verdict

---

## Demo

| Landing | Arena | Decision Report |
|---|---|---|
| ![landing](demo/decision-arena.png)  | ![report](demo/p2.png) | ![arena](demo/decision-arena2.png) |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Deployment | Vercel |
| Backend | Vercel Serverless Functions |
| AI Model | Groq API — LLaMA 3.3 70B |
| Styling | Inline CSS + Google Fonts |

---

## Architecture

```
React UI (Vercel)
     │
     ▼
Vercel Serverless /api/chat.js   ← hides API key, fixes CORS
     │
     ▼
Groq API — LLaMA 3.3 70B
     │
     ├── CATALYST (FOR)  — Strategic optimist
     └── SENTINEL (AGAINST) — Risk analyst
```

---

## Key Concepts

- **Multi-agent orchestration** — two LLM personas share conversation history and argue in turns
- **Prompt engineering** — structured system prompts enforce debate format and response length
- **Serverless proxy** — Vercel function proxies Groq API to avoid CORS and hide keys
- **Decision Report** — third LLM call synthesizes the debate into a structured brief

---

## Run Locally

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/decision-arena.git
cd decision-arena

# Install
npm install

# Add env variable
echo "GROQ_API_KEY=gsk_your_key_here" > .env

# Start
npm run dev
```

Open `http://localhost:5173`

---

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Get free key at [console.groq.com](https://console.groq.com) |

---

## Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Fork this repo
2. Import into Vercel
3. Add `GROQ_API_KEY` in Environment Variables
4. Deploy ✅

---

## What I Learned

- Why AI APIs can't be called directly from the browser (CORS) and how serverless proxies solve it
- Prompt engineering — how constraints and persona design shape LLM output quality
- Multi-agent design — orchestrating sequential AI calls with shared context
- Full product thinking — landing page → core feature → structured output

---

## Author

**Steve Philip** — [LinkedIn](www.linkedin.com/in/steve-p-25459021a) · [GitHub](https://github.com/stevephilipgit/)

---

*Built in one night as a proof-of-concept. Star ⭐ if you found it useful!*
