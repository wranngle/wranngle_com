// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Menu, X, Moon, Sun } from 'lucide-react';

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');`;
const LOGO_URL = "https://i.ibb.co/WWFmbjKJ/wranngle-wordmark-4096w.png";
const CONSOLE_LINES = [
  { text: "[INFO] Scanning business processes...", color: "text-green-400" },
  { text: "[WARN] High manual effort detected in Invoice_Processing", color: "text-yellow-400" },
  { text: "> Analyzing operational bleed...", color: "text-gray-300" },
  { text: "> Est. Monthly Loss: $13,475", color: "text-red-400" },
  { text: "> Recommended Action: Deploy n8n Automation Bridge", color: "text-cyan-400" },
  { text: "> Projected ROI: 1,853%", color: "text-green-400" },
  { text: "\n[READY] Awaiting user authorization...", color: "text-gray-100" }
];

const WranngleLanding = () => {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleTheme = () => setIsDark(!isDark);

  useEffect(() => {
    console.group("DIAGNOSTIC: System Init");
    const nav = window.navigator;
    
    // REMOVED: Broken MediaDevices patch that caused Illegal Invocation errors.
    /*
    try {
      const proto = Object.getPrototypeOf(nav.mediaDevices || {});
      const desc = Object.getOwnPropertyDescriptor(proto, 'getUserMedia');
      if (desc && !desc.writable) {
        console.warn("Shadowing read-only MediaDevices API...");
        const shadow = Object.create(nav.mediaDevices);
        Object.defineProperty(shadow, 'getUserMedia', {
          value: nav.mediaDevices.getUserMedia.bind(nav.mediaDevices),
          writable: true, configurable: true
        });
        Object.defineProperty(nav, 'mediaDevices', { value: shadow, configurable: true });
        console.log("Shadow patch successful.");
      }
    } catch (e) { console.error("Patch failure:", e.message); }
    */
    
    const scriptId = 'el-convai-v1';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = "https://unpkg.com/@elevenlabs/convai-widget-embed@beta";
      s.async = true; s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }
    console.groupEnd();
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}>
      <style>{FONTS_CSS}</style>
      <style>{`
        :root { --v500: #cf3c69; --s500: #ff5f00; --n950: #12111a; --lasso: 24px 4px 24px 4px; }
        .brand-font { font-family: 'Bricolage Grotesque', sans-serif; }
        .mono-font { font-family: 'JetBrains Mono', monospace; }
        .bg-page-dark { background: radial-gradient(circle at 50% 0%, #2d0914 0%, var(--n950) 60%); }
        .bg-page-light { background: linear-gradient(to bottom, #fcfaf5, #ebdfc8); }
      `}</style>

      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}>
        <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md h-20 flex items-center px-6">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <img src={LOGO_URL} alt="Wranngle" className={`h-8 w-auto ${!isDark ? 'brightness-0' : ''}`} />
            <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
              <a href="#audit">Services</a><a href="#philosophy">Philosophy</a>
              <ThemeToggle isDark={isDark} toggle={toggleTheme} />
              <button className="px-4 py-2 rounded-lg border border-current text-xs font-bold uppercase">Login</button>
            </nav>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mono-font text-[10px] text-[var(--v500)] mb-6 animate-pulse">SYSTEM_STATUS: ACTIVE</div>
            <h1 className="brand-font text-5xl md:text-7xl font-bold leading-none mb-8">Tame the <br /><span className="text-[var(--s500)]">Wild Frontier</span> <br />of AI.</h1>
            <p className="text-lg opacity-80 mb-10 max-w-md">Counterbalancing reckless innovation with rigorous, ethically grounded automation architectures.</p>
            <div className="flex gap-4"><ButtonPrimary>Initialize</ButtonPrimary><ButtonGhost>Protocols</ButtonGhost></div>
          </motion.div>
          <ConsoleVisual isDark={isDark} lines={CONSOLE_LINES} />
        </main>

        <section id="philosophy" className="py-24 px-6 max-w-7xl mx-auto w-full grid md:grid-cols-3 gap-8">
          <Card isDark={isDark} title="Minimize Bleed" desc="Identifying revenue leaks in manual data pipelines." />
          <Card isDark={isDark} title="No Hallucination" desc="Deterministic guardrails for enterprise LLM outputs." accent />
          <Card isDark={isDark} title="Zero Lock-in" desc="Open standards. You own the code and the infra." />
        </section>

        <footer className="py-12 border-t border-white/10 px-6 text-center text-xs opacity-50 mono-font">
          © 2026 Wranngle Systems LLC // WRN_WEB_V4
        </footer>

        <elevenlabs-convai agent-id="agent_8001kdgp7qbyf4wvhs540be78vew"></elevenlabs-convai>
      </div>
    </div>
  );
};

const ButtonPrimary = ({ children }) => (
  <button className="px-8 py-4 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-lg shadow-lg hover:scale-105 transition-all flex items-center gap-2">
    {children} <ArrowRight size={14} />
  </button>
);

const ButtonGhost = ({ children }) => (
  <button className="px-8 py-4 border border-current font-bold uppercase text-xs rounded-lg hover:bg-white/5 transition-all">{children}</button>
);

const Card = ({ title, desc, accent, isDark }) => (
  <div className={`p-8 rounded-[var(--lasso)] border ${accent ? 'border-[var(--s500)] shadow-xl' : 'border-white/10'} ${isDark ? 'bg-black/20' : 'bg-white/50'}`}>
    <h3 className="brand-font text-xl font-bold mb-2">{title}</h3>
    <p className="text-sm opacity-70 leading-relaxed">{desc}</p>
  </div>
);

const ThemeToggle = ({ isDark, toggle }) => (
  <button onClick={toggle} className="p-2 rounded-full hover:bg-white/10">{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
);

const ConsoleVisual = ({ isDark, lines }) => {
  const [display, setDisplay] = useState([]);
  const idx = useRef(0);

  useEffect(() => {
    setDisplay([]); idx.current = 0;
    const interval = setInterval(() => {
      if (idx.current < lines.length) {
        const line = lines[idx.current];
        if (line) setDisplay(prev => [...prev, line]);
        idx.current++;
      } else clearInterval(interval);
    }, 800);
    return () => clearInterval(interval);
  }, [lines]);

  return (
    <div className={`h-80 w-full rounded-[4px_24px_4px_24px] border border-white/10 p-6 mono-font text-[11px] flex flex-col shadow-2xl overflow-hidden ${isDark ? 'bg-[#0f0f13] text-gray-400' : 'bg-[#1a1a1e] text-gray-400'}`}>
      <div className="flex justify-between border-b border-white/10 pb-2 mb-4">
        <span className="text-white font-bold">WRN_CORE_V4</span>
        <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> LIVE</div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {display.map((l, i) => l && (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={l.color || ''}>
            {l.text || ''}
          </motion.div>
        ))}
        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity }} className="text-[var(--s500)] font-bold">_</motion.span>
      </div>
    </div>
  );
};

export default WranngleLanding;
