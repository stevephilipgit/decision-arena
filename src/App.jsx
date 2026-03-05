import { useState, useEffect, useRef } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const DEBATER_A = {
  id: "A", name: "CATALYST", stance: "FOR", color: "#00f5d4", glow: "rgba(0,245,212,0.18)", avatar: "🚀",
  personality: `You are CATALYST, a bold strategic advisor who argues FOR the given business decision.
Rules: MAX 3 sentences. Lead with your single strongest business argument. Use data/market logic. No fluff. No intro phrases.`,
};
const DEBATER_B = {
  id: "B", name: "SENTINEL", stance: "AGAINST", color: "#f72585", glow: "rgba(247,37,133,0.18)", avatar: "🛡️",
  personality: `You are SENTINEL, a sharp risk analyst who argues AGAINST the given business decision.
Rules: MAX 3 sentences. Lead with the single biggest risk or flaw. Use business logic. No fluff. No intro phrases.`,
};

const ROUNDS = [
  { id: 0, name: "Initial Position", emoji: "🎯", instruction: "State your core position in MAX 3 sentences. Lead with your single strongest argument." },
  { id: 1, name: "Rebuttal",         emoji: "⚡", instruction: "Attack the opponent's weakest point in MAX 3 sentences. Be surgical and specific." },
  { id: 2, name: "Final Verdict",    emoji: "🏁", instruction: "Give your final recommendation in MAX 2 sentences. Be decisive." },
];

const TEMPLATES = [
  { icon: "🌏", label: "Market Expansion",   prompt: "Should we expand our SaaS product into Southeast Asian markets in 2025?" },
  { icon: "🤖", label: "AI Adoption",        prompt: "Should our company replace our customer support team with AI chatbots?" },
  { icon: "🏗️", label: "Build vs Buy",       prompt: "Should we build our own data infrastructure or migrate to a third-party cloud solution?" },
  { icon: "👥", label: "Hire vs Outsource",  prompt: "Should we hire a full-time engineering team or outsource product development?" },
  { icon: "💰", label: "Fundraising",        prompt: "Should we raise a Series A now or continue bootstrapping for another 12 months?" },
  { icon: "🔀", label: "Pivot Decision",     prompt: "Should we pivot our B2C product to a B2B model to improve unit economics?" },
];

// ─── API CALLS ────────────────────────────────────────────────────────────────

function buildTurns() {
  const t = [];
  ROUNDS.forEach((round, ri) => {
    if (ri === 1) { t.push({ round, debater: DEBATER_B }); t.push({ round, debater: DEBATER_A }); }
    else { t.push({ round, debater: DEBATER_A }); t.push({ round, debater: DEBATER_B }); }
  });
  return t;
}

async function callClaude(system, userMsg) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || "API error"); }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function getDebaterResponse({ debater, topic, round, history }) {
  const sys = `${debater.personality}\n\nBusiness Decision: "${topic}"\nYour position: ${debater.stance}`;
  const ctx = history.length > 0
    ? `Debate so far:\n${history.map(h => `${h.speakerName} (${h.stance}): ${h.text}`).join("\n\n")}\n\nYour turn — ${round.instruction}`
    : round.instruction;
  return callClaude(sys, ctx);
}

async function generateDecisionReport(topic, transcript) {
  const sys = `You are a senior management consultant generating a structured decision brief. Be concise, direct, and actionable. Always respond in valid JSON only.`;
  const prompt = `Business Decision: "${topic}"

Debate transcript:
${transcript.map(h => `${h.speakerName} (${h.stance}): ${h.text}`).join("\n\n")}

Generate a JSON decision report with exactly this structure:
{
  "summary": "One sentence describing what this decision is about",
  "forArguments": ["strongest point 1", "strongest point 2", "strongest point 3"],
  "againstArguments": ["biggest risk 1", "biggest risk 2", "biggest risk 3"],
  "keyRisks": ["risk to watch 1", "risk to watch 2"],
  "recommendation": "One clear sentence: what should the team do?",
  "confidenceScore": <number 0-100 representing confidence in proceeding>,
  "verdict": "PROCEED" | "AVOID" | "PROCEED WITH CAUTION"
}`;
  const raw = await callClaude(sys, prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function LandingPage({ onEnter }) {
  return (
    <div style={L.root}>
      {/* Nav */}
      <nav style={L.nav}>
        <div style={L.navInner}>
          <div style={L.brand}>
            <span style={L.brandIcon}>⚖️</span>
            <span style={L.brandName}>DecisionArena</span>
          </div>
          <div style={L.navLinks}>
            <span style={L.navTag}>AI-Powered</span>
            <span style={L.navTag}>For Teams</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={L.hero}>
        <div style={L.heroInner}>
          <div style={L.heroBadge}>🚀 Built with Claude AI</div>
          <h1 style={L.heroTitle}>
            Every Big Decision<br/>
            <span style={L.heroAccent}>Deserves a Devil's Advocate</span>
          </h1>
          <p style={L.heroSub}>
            Two AI advisors argue both sides of your business decision — so your team sees every angle before committing. Get a structured Decision Report in minutes, not days.
          </p>
          <div style={L.heroCTA}>
            <button style={L.ctaPrimary} onClick={onEnter}>⚡ Try It Free — Enter Arena</button>
            <span style={L.ctaNote}>No sign-up · No credit card · Works instantly</span>
          </div>

          {/* Social proof */}
          <div style={L.proof}>
            {["Market Entry","Build vs Buy","Hire vs Outsource","Fundraising Timing","Product Pivot"].map(t => (
              <span key={t} style={L.proofTag}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={L.how}>
        <div style={L.howInner}>
          <h2 style={L.sectionTitle}>How It Works</h2>
          <div style={L.steps}>
            {[
              { n:"01", icon:"✍️", title:"State Your Decision", desc:"Type any business decision you're wrestling with. Use a template or write your own." },
              { n:"02", icon:"⚔️", title:"Watch AI Advisors Debate", desc:"CATALYST argues FOR. SENTINEL argues AGAINST. 3 structured rounds of sharp, focused arguments." },
              { n:"03", icon:"📋", title:"Get Your Decision Report", desc:"A structured 1-page brief: best arguments, key risks, and a clear AI recommendation." },
            ].map(s => (
              <div key={s.n} style={L.step}>
                <div style={L.stepNum}>{s.n}</div>
                <div style={L.stepIcon}>{s.icon}</div>
                <div style={L.stepTitle}>{s.title}</div>
                <div style={L.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={L.features}>
        <div style={L.featInner}>
          <h2 style={L.sectionTitle}>Why Teams Use DecisionArena</h2>
          <div style={L.featGrid}>
            {[
              { icon:"🧠", title:"Eliminates HiPPO Effect",     desc:"No more loudest-person-wins. AI gives every angle equal weight." },
              { icon:"⚡", title:"10× Faster Than Consultants", desc:"Get a structured brief in 2 minutes. Not 2 weeks." },
              { icon:"📋", title:"Exportable Decision Report",  desc:"Share a clean 1-pager with your team or board instantly." },
              { icon:"🔒", title:"Unbiased by Design",          desc:"AI has no agenda, no politics, no career risk. Pure logic." },
              { icon:"🎯", title:"Decision Templates",           desc:"Market entry, build vs buy, hire vs outsource — ready to go." },
              { icon:"🤝", title:"Built for Teams",             desc:"Share debates, align stakeholders, document decisions." },
            ].map(f => (
              <div key={f.title} style={L.featCard}>
                <span style={L.featIcon}>{f.icon}</span>
                <div style={L.featTitle}>{f.title}</div>
                <div style={L.featDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={L.finalCTA}>
        <div style={L.finalInner}>
          <h2 style={L.finalTitle}>Ready to make better decisions?</h2>
          <p style={L.finalSub}>Enter your toughest business question. Get clarity in minutes.</p>
          <button style={L.ctaPrimary} onClick={onEnter}>⚡ Enter the Arena</button>
        </div>
      </section>

      <footer style={L.footer}>
        <span>Built with Claude AI · DecisionArena © 2025</span>
      </footer>
    </div>
  );
}

function DecisionReport({ report, topic, scores, onNewDebate, onBack }) {
  const verdictColor = report.verdict === "PROCEED" ? "#00f5d4" : report.verdict === "AVOID" ? "#f72585" : "#f7b731";
  const confColor = report.confidenceScore >= 60 ? "#00f5d4" : report.confidenceScore >= 40 ? "#f7b731" : "#f72585";

  return (
    <div style={R.root}>
      {/* Header */}
      <div style={R.header}>
        <div style={R.headerTop}>
          <button onClick={onBack} style={R.backBtn}>← Back to Debate</button>
          <div style={R.reportBadge}>📋 Decision Report</div>
        </div>
        <div style={R.topicRow}>
          <h2 style={R.topicTitle}>"{topic}"</h2>
        </div>
      </div>

      {/* Verdict banner */}
      <div style={{...R.verdictBanner, background: `${verdictColor}18`, border:`1px solid ${verdictColor}44`}}>
        <div style={{...R.verdictLabel, color: verdictColor}}>AI VERDICT</div>
        <div style={{...R.verdictText, color: verdictColor}}>{report.verdict}</div>
        <div style={R.verdictRec}>{report.recommendation}</div>
      </div>

      {/* Confidence */}
      <div style={R.confRow}>
        <span style={R.confLabel}>CONFIDENCE SCORE</span>
        <div style={R.confBarWrap}>
          <div style={R.confBar}>
            <div style={{...R.confFill, width:`${report.confidenceScore}%`, background: confColor}}/>
          </div>
          <span style={{...R.confNum, color: confColor}}>{report.confidenceScore}%</span>
        </div>
      </div>

      {/* Arguments grid */}
      <div style={R.argsGrid}>
        <div style={{...R.argCard, borderColor:"rgba(0,245,212,0.3)", background:"rgba(0,245,212,0.04)"}}>
          <div style={{...R.argTitle, color:"#00f5d4"}}>🚀 Arguments FOR</div>
          {report.forArguments.map((a, i) => (
            <div key={i} style={R.argItem}>
              <span style={{...R.argDot, background:"#00f5d4"}}/>
              <span style={R.argText}>{a}</span>
            </div>
          ))}
        </div>
        <div style={{...R.argCard, borderColor:"rgba(247,37,133,0.3)", background:"rgba(247,37,133,0.04)"}}>
          <div style={{...R.argTitle, color:"#f72585"}}>🛡️ Arguments AGAINST</div>
          {report.againstArguments.map((a, i) => (
            <div key={i} style={R.argItem}>
              <span style={{...R.argDot, background:"#f72585"}}/>
              <span style={R.argText}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Risks */}
      <div style={R.risksCard}>
        <div style={R.risksTitle}>⚠️ Key Risks to Mitigate</div>
        <div style={R.risksList}>
          {report.keyRisks.map((r, i) => (
            <div key={i} style={R.riskItem}>
              <span style={R.riskNum}>{String(i+1).padStart(2,"0")}</span>
              <span style={R.argText}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scores */}
      <div style={R.scoresRow}>
        {[DEBATER_A, DEBATER_B].map(d => (
          <div key={d.id} style={{...R.scoreCard, borderColor: d.color}}>
            <span style={{fontSize:22}}>{d.avatar}</span>
            <span style={{...R.scoreName, color:d.color}}>{d.name}</span>
            <span style={{...R.scoreNum, color:d.color}}>{scores[d.id]}</span>
            <span style={R.scoreLabel}>debate points</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={R.actions}>
        <button style={R.newBtn} onClick={onNewDebate}>⚡ New Decision</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | arena | report
  const [topicInput, setTopicInput] = useState("");
  const [topic, setTopic] = useState("");
  const [phase, setPhase] = useState("setup"); // setup | debate | voting | results
  const [transcript, setTranscript] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDot, setLoadingDot] = useState(0);
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [votes, setVotes] = useState({ A: 0, B: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [votingTimer, setVotingTimer] = useState(60);
  const [summaries, setSummaries] = useState({ A: "", B: "" });
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const transcriptRef = useRef(null);
  const timerRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript, isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const iv = setInterval(() => setLoadingDot(d => (d + 1) % 4), 350);
    return () => clearInterval(iv);
  }, [isLoading]);

  const runDebate = async (t) => {
    if (runningRef.current) return;
    runningRef.current = true;
    const turns = buildTurns();
    let hist = [];
    for (let i = 0; i < turns.length; i++) {
      const { round, debater } = turns[i];
      setCurrentSpeaker(debater.id); setCurrentRound(round); setIsLoading(true); setError("");
      try {
        const text = await getDebaterResponse({ debater, topic: t, round, history: hist });
        const entry = { id: i, speakerId: debater.id, speakerName: debater.name, stance: debater.stance, color: debater.color, roundName: round.name, roundEmoji: round.emoji, text };
        hist = [...hist, entry];
        setTranscript([...hist]);
        setScores(s => ({ ...s, [debater.id]: s[debater.id] + Math.floor(Math.random() * 6) + 10 }));
        setIsLoading(false);
        await new Promise(r => setTimeout(r, 400));
      } catch (e) { setError(e.message); setIsLoading(false); runningRef.current = false; return; }
    }
    runningRef.current = false; setIsLoading(false); setCurrentSpeaker(null);

    // Get summaries
    try {
      const s = await callClaude(
        "You are a neutral summarizer. Be extremely concise.",
        `Topic: "${t}"\n\n${hist.map(h=>`${h.speakerName}: ${h.text}`).join("\n\n")}\n\nGive one sentence for each:\nFOR: <sentence>\nAGAINST: <sentence>`
      );
      const fa = s.match(/FOR:\s*(.+)/)?.[1]?.trim() || "";
      const ag = s.match(/AGAINST:\s*(.+)/)?.[1]?.trim() || "";
      setSummaries({ A: fa, B: ag });
    } catch (_) { setSummaries({ A: "Strong strategic case made", B: "Significant risks identified" }); }

    setPhase("voting");
    setVotingTimer(60);
    timerRef.current = setInterval(() => {
      setVotingTimer(p => { if (p <= 1) { clearInterval(timerRef.current); setPhase("results"); return 0; } return p - 1; });
    }, 1000);
  };

  const startDebate = () => {
    if (!topicInput.trim()) { setError("Enter a decision first!"); return; }
    const t = topicInput.trim();
    setTopic(t); setTranscript([]); setScores({ A: 0, B: 0 }); setVotes({ A: 0, B: 0 });
    setHasVoted(false); setError(""); setReport(null); setSummaries({ A: "", B: "" });
    setPhase("debate"); setActiveTab("all");
    setTimeout(() => runDebate(t), 100);
  };

  const castVote = (side) => {
    if (hasVoted) return;
    setHasVoted(true);
    setVotes(v => ({ ...v, [side]: v[side] + 1 }));
    clearInterval(timerRef.current);
    setTimeout(() => setPhase("results"), 800);
  };

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const r = await generateDecisionReport(topic, transcript);
      setReport(r);
      setScreen("report");
    } catch (e) { setError("Report generation failed: " + e.message); }
    setReportLoading(false);
  };

  const reset = () => {
    clearInterval(timerRef.current); runningRef.current = false;
    setPhase("setup"); setTranscript([]); setTopic(""); setTopicInput("");
    setVotes({ A: 0, B: 0 }); setHasVoted(false); setScores({ A: 0, B: 0 });
    setCurrentSpeaker(null); setError(""); setSummaries({ A: "", B: "" });
    setReport(null); setActiveTab("all"); setScreen("arena");
  };

  const filtered = activeTab === "all" ? transcript : transcript.filter(e => e.speakerId === activeTab);
  const winner = scores.A !== scores.B ? (scores.A > scores.B ? DEBATER_A : DEBATER_B) : null;
  const dotStr = ".".repeat(loadingDot);

  if (screen === "landing") return <LandingPage onEnter={() => setScreen("arena")} />;
  if (screen === "report" && report) return (
    <DecisionReport report={report} topic={topic} scores={scores}
      onNewDebate={reset} onBack={() => setScreen("arena")} />
  );

  // ── ARENA SCREEN ──
  return (
    <div style={A.root}>
      <div style={A.bg}><div style={A.grid}/><div style={A.g1}/><div style={A.g2}/></div>

      <header style={A.header}>
        <div style={A.hInner}>
          <button onClick={() => setScreen("landing")} style={A.logoBtn}>
            <span>⚖️</span><span style={A.logoTxt}>DecisionArena</span>
          </button>
          {phase !== "setup" && (
            <div style={{display:"flex",gap:10}}>
              {phase === "results" && (
                <button onClick={generateReport} disabled={reportLoading}
                  style={{...A.actionBtn, background:"linear-gradient(135deg,#00f5d4,#00b4d8)", color:"#000", border:"none"}}>
                  {reportLoading ? "Generating..." : "📋 Get Decision Report"}
                </button>
              )}
              <button onClick={reset} style={A.actionBtn}>↩ New Decision</button>
            </div>
          )}
        </div>
      </header>

      <main style={A.main}>
        {/* SETUP */}
        {phase === "setup" && (
          <div style={A.center}>
            <div style={A.setupCard}>
              <div style={A.setupTop}>
                <h1 style={A.setupTitle}>What decision are you wrestling with?</h1>
                <p style={A.setupSub}>Two AI advisors will argue both sides so your team sees every angle.</p>
              </div>

              <div style={A.advisors}>
                <div style={{...A.advisorCard, borderColor: DEBATER_A.color, background:"rgba(0,245,212,0.03)"}}>
                  <span style={{fontSize:28}}>{DEBATER_A.avatar}</span>
                  <span style={{...A.advName, color:DEBATER_A.color}}>{DEBATER_A.name}</span>
                  <span style={{...A.advBadge, background:DEBATER_A.color}}>FOR</span>
                  <span style={A.advDesc}>Strategic optimist · Finds opportunity</span>
                </div>
                <div style={A.vsCircle}>VS</div>
                <div style={{...A.advisorCard, borderColor: DEBATER_B.color, background:"rgba(247,37,133,0.03)"}}>
                  <span style={{fontSize:28}}>{DEBATER_B.avatar}</span>
                  <span style={{...A.advName, color:DEBATER_B.color}}>{DEBATER_B.name}</span>
                  <span style={{...A.advBadge, background:DEBATER_B.color}}>AGAINST</span>
                  <span style={A.advDesc}>Risk analyst · Finds the flaws</span>
                </div>
              </div>

              <div style={A.inputWrap}>
                <label style={A.label}>YOUR DECISION</label>
                <textarea style={A.textarea}
                  placeholder="e.g. Should we expand our product into Southeast Asian markets in 2025?"
                  value={topicInput} onChange={e => setTopicInput(e.target.value)} rows={3} />
              </div>

              <div style={A.templatesWrap}>
                <div style={A.templatesLabel}>Or pick a template:</div>
                <div style={A.templates}>
                  {TEMPLATES.map(t => (
                    <button key={t.label} style={A.templateBtn} onClick={() => setTopicInput(t.prompt)}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={A.errBox}>{error}</div>}
              <button style={A.startBtn} onClick={startDebate}>⚡ Start Analysis</button>
            </div>
          </div>
        )}

        {/* DEBATE + VOTING + RESULTS */}
        {phase !== "setup" && (
          <div style={A.arena}>
            {/* Scorebar */}
            <div style={A.scorebar}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {currentSpeaker==="A" && isLoading && <span style={{...A.pulse, background:DEBATER_A.color}}/>}
                <span style={{...A.sName, color:DEBATER_A.color}}>{DEBATER_A.avatar} {DEBATER_A.name}</span>
                <span style={{...A.sPts, color:DEBATER_A.color}}>{scores.A}</span>
              </div>
              <div style={A.roundPill}>
                {phase==="debate" ? (currentRound ? `${currentRound.emoji} ${currentRound.name}` : "Debate") :
                 phase==="voting" ? `🗳️ Your Verdict · ${votingTimer}s` : "📊 Results"}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{...A.sPts, color:DEBATER_B.color}}>{scores.B}</span>
                <span style={{...A.sName, color:DEBATER_B.color}}>{DEBATER_B.name} {DEBATER_B.avatar}</span>
                {currentSpeaker==="B" && isLoading && <span style={{...A.pulse, background:DEBATER_B.color}}/>}
              </div>
            </div>

            <div style={A.topicChip}>📌 {topic}</div>

            {/* Tabs */}
            <div style={A.tabs}>
              {[["all","All"],["A",`${DEBATER_A.avatar} ${DEBATER_A.name}`],["B",`${DEBATER_B.avatar} ${DEBATER_B.name}`]].map(([id,label]) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  ...A.tab,
                  ...(activeTab===id ? {background:"rgba(255,255,255,0.07)", color:"#ddd",
                    borderColor: id==="A" ? DEBATER_A.color : id==="B" ? DEBATER_B.color : "rgba(255,255,255,0.2)"} : {})
                }}>{label}</button>
              ))}
            </div>

            {/* Transcript */}
            <div style={A.transcript} ref={transcriptRef}>
              {filtered.map(entry => (
                <div key={entry.id} style={{
                  ...A.bubble,
                  alignSelf: entry.speakerId==="A" ? "flex-start" : "flex-end",
                  borderLeft: entry.speakerId==="A" ? `3px solid ${DEBATER_A.color}` : "1px solid rgba(247,37,133,0.2)",
                  borderRight: entry.speakerId==="B" ? `3px solid ${DEBATER_B.color}` : "1px solid rgba(0,245,212,0.2)",
                  borderTop: `1px solid ${entry.speakerId==="A" ? "rgba(0,245,212,0.15)" : "rgba(247,37,133,0.15)"}`,
                  borderBottom: `1px solid ${entry.speakerId==="A" ? "rgba(0,245,212,0.15)" : "rgba(247,37,133,0.15)"}`,
                  background: entry.speakerId==="A" ? "rgba(0,245,212,0.04)" : "rgba(247,37,133,0.04)",
                }}>
                  <div style={A.bubbleHead}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>{entry.speakerId==="A" ? DEBATER_A.avatar : DEBATER_B.avatar}</span>
                      <span style={{color:entry.color, fontWeight:800, fontSize:13, letterSpacing:2, fontFamily:"'Bebas Neue',sans-serif"}}>{entry.speakerName}</span>
                      <span style={{...A.stanceBadge, background:entry.color}}>{entry.stance}</span>
                    </div>
                    <span style={{...A.roundTag, color:entry.color, background:`${entry.color}15`}}>{entry.roundEmoji} {entry.roundName}</span>
                  </div>
                  <p style={A.bubbleText}>{entry.text}</p>
                </div>
              ))}

              {isLoading && currentSpeaker && (
                <div style={{
                  ...A.bubble,
                  alignSelf: currentSpeaker==="A" ? "flex-start" : "flex-end",
                  borderLeft: currentSpeaker==="A" ? `3px solid ${DEBATER_A.color}` : "1px solid rgba(247,37,133,0.2)",
                  borderRight: currentSpeaker==="B" ? `3px solid ${DEBATER_B.color}` : "1px solid rgba(0,245,212,0.2)",
                  borderTop:`1px solid rgba(255,255,255,0.06)`, borderBottom:`1px solid rgba(255,255,255,0.06)`,
                  background: currentSpeaker==="A" ? "rgba(0,245,212,0.04)" : "rgba(247,37,133,0.04)",
                }}>
                  <div style={A.bubbleHead}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>{currentSpeaker==="A" ? DEBATER_A.avatar : DEBATER_B.avatar}</span>
                      <span style={{color: currentSpeaker==="A"?DEBATER_A.color:DEBATER_B.color, fontWeight:800, fontSize:13, letterSpacing:2, fontFamily:"'Bebas Neue',sans-serif"}}>
                        {currentSpeaker==="A"?DEBATER_A.name:DEBATER_B.name}
                      </span>
                    </div>
                    <span style={{fontSize:11, color:currentSpeaker==="A"?DEBATER_A.color:DEBATER_B.color, letterSpacing:1}}>● Analyzing{dotStr}</span>
                  </div>
                  <div style={{display:"flex",gap:5,padding:"8px 0"}}>
                    {[0,1,2].map(i=><span key={i} style={{...A.dot, animationDelay:`${i*0.2}s`}}/>)}
                  </div>
                </div>
              )}
              {error && <div style={{...A.errBox, margin:"4px 0"}}>{error}</div>}
            </div>

            {/* Voting */}
            {phase==="voting" && (
              <div style={A.votingBox}>
                <div style={A.summaryRow}>
                  {[{d:DEBATER_A,sum:summaries.A},{d:DEBATER_B,sum:summaries.B}].map(({d,sum})=>(
                    <div key={d.id} style={{...A.sumCard, borderColor:d.color, background:`${d.color}08`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:18}}>{d.avatar}</span>
                        <span style={{color:d.color,fontWeight:800,fontSize:13,letterSpacing:2,fontFamily:"'Bebas Neue',sans-serif"}}>{d.name}</span>
                      </div>
                      <p style={{fontSize:13,color:"#bbb",lineHeight:1.65}}>{sum || "Analyzing..."}</p>
                    </div>
                  ))}
                </div>
                <div style={{textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:4,color:"#666"}}>WHO MADE THE STRONGER CASE?</div>
                <div style={A.voteBtns}>
                  {[DEBATER_A,DEBATER_B].map(d=>(
                    <button key={d.id} onClick={()=>castVote(d.id)} disabled={hasVoted}
                      style={{...A.voteBtn, borderColor:d.color, color:d.color,
                        background:hasVoted&&votes[d.id]>0?`${d.color}15`:"transparent",
                        opacity:hasVoted&&votes[d.id]===0?0.4:1}}>
                      <span style={{fontSize:26}}>{d.avatar}</span>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:3}}>{d.name}</span>
                      {hasVoted&&votes[d.id]>0&&<span style={{...A.stanceBadge,background:d.color,fontSize:11}}>✓ YOUR VOTE</span>}
                    </button>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <div style={A.timerBar}><div style={{...A.timerFill,width:`${(votingTimer/60)*100}%`}}/></div>
                  <span style={{fontSize:11,color:"#333",letterSpacing:2,textAlign:"center"}}>AUTO-CLOSES IN {votingTimer}s</span>
                </div>
              </div>
            )}

            {/* Results */}
            {phase==="results" && (
              <div style={A.resultsBox}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:5,color:"#fff"}}>
                    {winner ? `🏆 ${winner.name} WINS` : "⚖️ TIED DEBATE"}
                  </div>
                  <p style={{color:"#555",fontSize:13,marginTop:4}}>Ready to turn this into a decision?</p>
                </div>
                <div style={A.resultsRow}>
                  {[DEBATER_A,DEBATER_B].map(d=>{
                    const isW = winner?.id===d.id;
                    return (
                      <div key={d.id} style={{...A.resCard, borderColor:d.color, boxShadow:isW?`0 0 40px ${d.glow}`:"none", transform:isW?"scale(1.02)":"scale(1)"}}>
                        {isW&&<div style={{...A.winBanner,background:d.color}}>WINNER</div>}
                        <span style={{fontSize:36}}>{d.avatar}</span>
                        <span style={{...A.sName,color:d.color,fontSize:18}}>{d.name}</span>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:40,color:"#fff",lineHeight:1}}>{scores[d.id]}</span>
                        <span style={{fontSize:11,color:"#444",letterSpacing:2}}>POINTS</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={generateReport} disabled={reportLoading}
                  style={{...A.startBtn, background:"linear-gradient(135deg,#00f5d4,#00b4d8)", width:"100%"}}>
                  {reportLoading ? "⏳ Generating Decision Report..." : "📋 Generate Decision Report →"}
                </button>
                {error&&<div style={A.errBox}>{error}</div>}
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#060609}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#222;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes glow{0%,100%{opacity:0.3}50%{opacity:1}}
        textarea:focus,input:focus{outline:none;border-color:rgba(0,245,212,0.4)!important}
        textarea{resize:vertical}
      `}</style>
    </div>
  );
}

// ─── LANDING STYLES ───────────────────────────────────────────────────────────
const L = {
  root:{minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",background:"#060609",color:"#e0e0e0"},
  nav:{borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(6,6,9,0.95)",backdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:100},
  navInner:{maxWidth:1100,margin:"0 auto",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  brand:{display:"flex",alignItems:"center",gap:10,cursor:"default"},
  brandIcon:{fontSize:22},
  brandName:{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:4,background:"linear-gradient(90deg,#00f5d4,#f72585)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  navLinks:{display:"flex",gap:8},
  navTag:{fontSize:11,padding:"4px 12px",borderRadius:20,border:"1px solid rgba(255,255,255,0.1)",color:"#555",letterSpacing:1},
  hero:{padding:"90px 24px 80px",textAlign:"center",position:"relative",overflow:"hidden",background:"radial-gradient(ellipse at 50% 0%, rgba(0,245,212,0.06) 0%, transparent 60%)"},
  heroInner:{maxWidth:760,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:24},
  heroBadge:{fontSize:12,padding:"6px 16px",borderRadius:20,border:"1px solid rgba(0,245,212,0.3)",color:"#00f5d4",letterSpacing:2,background:"rgba(0,245,212,0.06)"},
  heroTitle:{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(42px,7vw,80px)",letterSpacing:4,lineHeight:1.05,color:"#fff"},
  heroAccent:{background:"linear-gradient(135deg,#00f5d4,#f72585)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  heroSub:{fontSize:18,color:"#666",lineHeight:1.7,maxWidth:560},
  heroCTA:{display:"flex",flexDirection:"column",alignItems:"center",gap:12},
  ctaPrimary:{background:"linear-gradient(135deg,#00f5d4,#00b4d8)",border:"none",color:"#000",padding:"16px 40px",borderRadius:12,cursor:"pointer",fontSize:16,fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:0.5},
  ctaNote:{fontSize:12,color:"#444",letterSpacing:1},
  proof:{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"},
  proofTag:{fontSize:12,padding:"5px 14px",borderRadius:20,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#555"},
  how:{padding:"80px 24px",borderTop:"1px solid rgba(255,255,255,0.05)"},
  howInner:{maxWidth:960,margin:"0 auto"},
  sectionTitle:{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:4,textAlign:"center",color:"#fff",marginBottom:48},
  steps:{display:"flex",gap:24},
  step:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:12,padding:"28px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16},
  stepNum:{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:3,color:"#333"},
  stepIcon:{fontSize:32},
  stepTitle:{fontSize:16,fontWeight:700,color:"#e0e0e0"},
  stepDesc:{fontSize:14,color:"#555",lineHeight:1.65},
  features:{padding:"80px 24px",background:"rgba(255,255,255,0.01)",borderTop:"1px solid rgba(255,255,255,0.05)"},
  featInner:{maxWidth:960,margin:"0 auto"},
  featGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16},
  featCard:{padding:"24px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14},
  featIcon:{fontSize:26,display:"block",marginBottom:12},
  featTitle:{fontSize:15,fontWeight:700,color:"#e0e0e0",marginBottom:8},
  featDesc:{fontSize:13,color:"#555",lineHeight:1.65},
  finalCTA:{padding:"100px 24px",textAlign:"center",background:"radial-gradient(ellipse at 50% 100%, rgba(247,37,133,0.06) 0%, transparent 60%)"},
  finalInner:{maxWidth:560,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:20},
  finalTitle:{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,letterSpacing:4,color:"#fff"},
  finalSub:{fontSize:16,color:"#555",lineHeight:1.7},
  footer:{padding:"24px",textAlign:"center",borderTop:"1px solid rgba(255,255,255,0.05)",fontSize:12,color:"#333",letterSpacing:1},
};

// ─── ARENA STYLES ─────────────────────────────────────────────────────────────
const A = {
  root:{minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#e0e0e0",position:"relative"},
  bg:{position:"fixed",inset:0,zIndex:0,background:"#060609"},
  grid:{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"40px 40px"},
  g1:{position:"absolute",top:"-10%",left:"-5%",width:"40%",height:"40%",background:"radial-gradient(circle,rgba(0,245,212,0.07) 0%,transparent 70%)",borderRadius:"50%"},
  g2:{position:"absolute",bottom:"-10%",right:"-5%",width:"40%",height:"40%",background:"radial-gradient(circle,rgba(247,37,133,0.07) 0%,transparent 70%)",borderRadius:"50%"},
  header:{position:"relative",zIndex:10,borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(6,6,9,0.9)",backdropFilter:"blur(20px)"},
  hInner:{maxWidth:960,margin:"0 auto",padding:"13px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  logoBtn:{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:18},
  logoTxt:{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:4,background:"linear-gradient(90deg,#00f5d4,#f72585)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  actionBtn:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#888",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif"},
  main:{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"24px 18px"},
  center:{display:"flex",justifyContent:"center"},
  setupCard:{width:"100%",maxWidth:640,display:"flex",flexDirection:"column",gap:22},
  setupTop:{display:"flex",flexDirection:"column",gap:8},
  setupTitle:{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:3,color:"#fff",lineHeight:1.1},
  setupSub:{fontSize:14,color:"#555",lineHeight:1.6},
  advisors:{display:"flex",alignItems:"center",gap:12},
  advisorCard:{flex:1,border:"1px solid",borderRadius:12,padding:"18px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:8},
  advName:{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:3},
  advBadge:{fontSize:10,padding:"2px 9px",borderRadius:20,color:"#000",fontWeight:800,letterSpacing:2},
  advDesc:{fontSize:11,color:"#444",textAlign:"center",lineHeight:1.4},
  vsCircle:{width:40,height:40,borderRadius:"50%",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#333",flexShrink:0},
  inputWrap:{display:"flex",flexDirection:"column",gap:8},
  label:{fontSize:10,letterSpacing:3,color:"#444",fontWeight:700},
  textarea:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"14px 16px",color:"#fff",fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",width:"100%",lineHeight:1.6,transition:"border-color 0.2s"},
  templatesWrap:{display:"flex",flexDirection:"column",gap:10},
  templatesLabel:{fontSize:11,color:"#444",letterSpacing:2},
  templates:{display:"flex",flexWrap:"wrap",gap:8},
  templateBtn:{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",color:"#666",padding:"7px 14px",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all 0.2s"},
  errBox:{background:"rgba(247,37,133,0.08)",border:"1px solid rgba(247,37,133,0.2)",borderRadius:8,padding:"11px 15px",color:"#f72585",fontSize:13},
  startBtn:{background:"linear-gradient(135deg,#00f5d4,#00b4d8)",border:"none",color:"#000",padding:"15px 32px",borderRadius:10,cursor:"pointer",fontSize:16,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700},
  arena:{display:"flex",flexDirection:"column",gap:14},
  scorebar:{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"12px 20px"},
  sName:{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:2},
  sPts:{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,lineHeight:1},
  pulse:{width:8,height:8,borderRadius:"50%",display:"inline-block",animation:"glow 0.8s infinite"},
  roundPill:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"7px 16px",fontSize:12,color:"#888",textAlign:"center",minWidth:200},
  topicChip:{fontSize:13,color:"#444",fontStyle:"italic",textAlign:"center",padding:"2px 0"},
  tabs:{display:"flex",gap:8},
  tab:{background:"transparent",border:"1px solid rgba(255,255,255,0.07)",color:"#444",padding:"6px 16px",borderRadius:20,cursor:"pointer",fontSize:12,transition:"all 0.2s"},
  transcript:{minHeight:260,maxHeight:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,paddingBottom:8,scrollBehavior:"smooth"},
  bubble:{maxWidth:"76%",borderRadius:10,padding:"14px 16px",animation:"fadeUp 0.35s ease"},
  bubbleHead:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9},
  stanceBadge:{fontSize:9,padding:"2px 8px",borderRadius:20,color:"#000",fontWeight:800,letterSpacing:1},
  roundTag:{fontSize:10,padding:"3px 9px",borderRadius:12,letterSpacing:1,fontWeight:600},
  bubbleText:{fontSize:14,lineHeight:1.8,color:"#ccc",whiteSpace:"pre-wrap"},
  dot:{width:8,height:8,borderRadius:"50%",background:"#2a2a2a",display:"inline-block",animation:"bounce 1.3s infinite ease-in-out both"},
  votingBox:{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"22px",display:"flex",flexDirection:"column",gap:16},
  summaryRow:{display:"flex",gap:12},
  sumCard:{flex:1,border:"1px solid",borderRadius:10,padding:"14px 16px"},
  voteBtns:{display:"flex",gap:12},
  voteBtn:{flex:1,border:"2px solid",borderRadius:12,padding:"20px 16px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:7,transition:"all 0.25s",background:"transparent"},
  timerBar:{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"},
  timerFill:{height:"100%",background:"linear-gradient(90deg,#00f5d4,#f72585)",transition:"width 1s linear"},
  resultsBox:{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"28px",display:"flex",flexDirection:"column",gap:20},
  resultsRow:{display:"flex",gap:16},
  resCard:{flex:1,border:"2px solid",borderRadius:12,padding:"24px 16px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,background:"rgba(255,255,255,0.02)",position:"relative",transition:"all 0.3s"},
  winBanner:{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",padding:"3px 16px",borderRadius:20,fontSize:11,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#000",whiteSpace:"nowrap"},
};

// ─── REPORT STYLES ────────────────────────────────────────────────────────────
const R = {
  root:{minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",background:"#060609",color:"#e0e0e0",maxWidth:860,margin:"0 auto",padding:"32px 24px",display:"flex",flexDirection:"column",gap:20},
  header:{display:"flex",flexDirection:"column",gap:12},
  headerTop:{display:"flex",alignItems:"center",justifyContent:"space-between"},
  backBtn:{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#666",padding:"7px 16px",borderRadius:8,cursor:"pointer",fontSize:13},
  reportBadge:{fontSize:12,padding:"5px 14px",border:"1px solid rgba(0,245,212,0.3)",borderRadius:20,color:"#00f5d4",background:"rgba(0,245,212,0.06)",letterSpacing:1},
  topicRow:{},
  topicTitle:{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,color:"#fff",lineHeight:1.2},
  verdictBanner:{borderRadius:14,padding:"22px 28px",textAlign:"center",display:"flex",flexDirection:"column",gap:8},
  verdictLabel:{fontSize:11,letterSpacing:4,fontWeight:700},
  verdictText:{fontFamily:"'Bebas Neue',sans-serif",fontSize:42,letterSpacing:6,lineHeight:1},
  verdictRec:{fontSize:16,color:"#ccc",lineHeight:1.6,maxWidth:600,margin:"0 auto"},
  confRow:{display:"flex",alignItems:"center",gap:16,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"14px 20px"},
  confLabel:{fontSize:11,letterSpacing:3,color:"#444",whiteSpace:"nowrap",fontWeight:700},
  confBarWrap:{flex:1,display:"flex",alignItems:"center",gap:12},
  confBar:{flex:1,height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"},
  confFill:{height:"100%",borderRadius:3,transition:"width 1s ease"},
  confNum:{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,lineHeight:1,minWidth:50},
  argsGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},
  argCard:{border:"1px solid",borderRadius:12,padding:"18px 20px",display:"flex",flexDirection:"column",gap:12},
  argTitle:{fontSize:14,fontWeight:700,letterSpacing:1},
  argItem:{display:"flex",gap:10,alignItems:"flex-start"},
  argDot:{width:6,height:6,borderRadius:"50%",flexShrink:0,marginTop:7},
  argText:{fontSize:13,color:"#bbb",lineHeight:1.65},
  risksCard:{background:"rgba(247,183,49,0.04)",border:"1px solid rgba(247,183,49,0.2)",borderRadius:12,padding:"18px 20px"},
  risksTitle:{fontSize:14,fontWeight:700,color:"#f7b731",marginBottom:14,letterSpacing:1},
  risksList:{display:"flex",flexDirection:"column",gap:10},
  riskItem:{display:"flex",gap:12,alignItems:"flex-start"},
  riskNum:{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#f7b731",minWidth:28,letterSpacing:1},
  scoresRow:{display:"flex",gap:14},
  scoreCard:{flex:1,border:"1px solid",borderRadius:10,padding:"16px",display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.02)"},
  scoreName:{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,flex:1},
  scoreNum:{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,lineHeight:1},
  scoreLabel:{fontSize:10,color:"#444",letterSpacing:1},
  actions:{display:"flex",justifyContent:"center",paddingTop:8},
  newBtn:{background:"linear-gradient(135deg,#00f5d4,#00b4d8)",border:"none",color:"#000",padding:"14px 36px",borderRadius:10,cursor:"pointer",fontSize:15,fontWeight:700,letterSpacing:0.5},
};
