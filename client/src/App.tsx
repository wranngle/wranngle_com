// @ts-nocheck
import React, {useState, useEffect, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Check, ArrowRight, Menu, X, Moon, Sun, Zap} from 'lucide-react';
import {Link} from 'wouter';
import {useForm} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import {Button} from '@/components/ui/button';
import FAQ from '@/components/FAQ';

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');`;
const LOGO_URL = 'https://i.ibb.co/WWFmbjKJ/wranngle-wordmark-4096w.png';
const CONSOLE_LINES = [
  {text: '[INFO] System initializing...', color: 'text-gray-400'},
  {text: '> Detecting missed calls (Last 24h)...', color: 'text-gray-300'},
  {text: '[WARN] 14 Potential Leads Unanswered', color: 'text-yellow-400'},
  {text: '> Loading HVAC/Plumbing Knowledge Base...', color: 'text-cyan-400'},
  {text: '> Syncing Calendar Availability...', color: 'text-cyan-400'},
  {text: '> Est. Recovered Revenue: $4,200/mo', color: 'text-green-400'},
  {text: '\n[READY] Agent awaiting deployment command.', color: 'text-white'},
];

const IntakeForm = ({selectedPackage, onSuccess}) => {
  const [currentPackage, setCurrentPackage] = useState(selectedPackage);
  const {register, handleSubmit, reset, setValue} = useForm({
    defaultValues: {package: currentPackage},
  });
  const {toast} = useToast();
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    setValue('package', currentPackage);
  }, [currentPackage, setValue]);

  const mutation = useMutation({
    async mutationFn(data) {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit');
      return res.json();
    },
    onSuccess(_, variables) {
      setSuccessData(variables);
      toast({
        title: 'Order Received',
        description: 'Invoice generated successfully.',
      });
      reset();
      onSuccess?.();
    },
    onError(error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (successData) {
    return (
      <div className="bg-[#f0f0f0] p-6 rounded-sm shadow-xl max-w-sm mx-auto font-mono text-black relative border-t-8 border-[var(--s500)]">
        <div className="border-b-2 border-dashed border-gray-400 pb-4 mb-4 text-center">
          <div className="font-bold text-lg tracking-wider">
            WRANNGLE SYSTEMS
          </div>
          <div className="text-xs opacity-60">ORDER CONFIRMATION</div>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span>REF:</span>
            <span>{Math.random().toString(36).slice(2, 11).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>DATE:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="border-b border-dashed border-gray-400 my-2" />
          <div className="flex justify-between font-bold">
            <span>ITEM</span>
            <span>AMT</span>
          </div>
          <div className="flex justify-between">
            <span>
              {successData.package === 'premium'
                ? 'ELITE AGENT'
                : 'STARTER AGENT'}
            </span>
            <span>${successData.package === 'premium' ? '500' : '250'}</span>
          </div>
          <div className="border-b border-dashed border-gray-400 my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL</span>
            <span>
              ${successData.package === 'premium' ? '500.00' : '250.00'}
            </span>
          </div>
        </div>

        <div className="text-center text-xs space-y-2 bg-white/50 p-3 rounded">
          <div className="font-bold text-[var(--s500)]">PAYMENT PENDING</div>
          <div>Invoice sent to:</div>
          <div className="font-bold">{successData.email}</div>
        </div>

        <div className="mt-6 text-[10px] text-center opacity-60">
          THANK YOU FOR YOUR BUSINESS
        </div>

        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-full mt-6 border-black/20 text-black hover:bg-black hover:text-white transition-colors"
          >
            CLOSE RECEIPT
          </Button>
        </DialogClose>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="brand-font text-2xl">
          Agent Intake Form
        </DialogTitle>
        <DialogDescription>
          Tell us about your business to get your agent ready.
        </DialogDescription>
      </DialogHeader>

      {currentPackage === 'basic' && (
        <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/5 rounded-lg flex gap-4 items-start">
          <Zap className="text-[var(--s500)] shrink-0" size={20} />
          <div>
            <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider mb-1">
              Recommended Upgrade
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed mb-2">
              Best Practice: 84% of trade businesses see 2x lead conversion when
              combining <b>Voice Agent</b> with <b>Web Chat</b>.
            </p>
            <button
              type="button"
              onClick={() => {
                setCurrentPackage('premium');
              }}
              className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[var(--s500)] border border-[var(--s500)] px-3 py-1.5 rounded hover:bg-[var(--s500)] hover:text-white transition-all uppercase tracking-wide"
            >
              Upgrade to Elite Agent (+$250/mo) <ArrowRight size={10} />
            </button>
          </div>
        </div>
      )}

      {currentPackage === 'premium' && (
        <div className="mt-4 p-4 border border-[var(--s500)]/30 bg-[var(--s500)]/10 rounded-lg flex gap-4 items-center">
          <div className="w-5 h-5 rounded-full bg-[var(--s500)] flex items-center justify-center text-white shrink-0">
            <Check size={12} strokeWidth={4} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--s500)] uppercase tracking-wider">
              Elite Agent Secured
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Priority 24/7 Coverage + Web Chat Integration included.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => {
          mutation.mutate(data);
        })}
        className="space-y-4 py-4"
      >
        <div className="grid gap-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            className="placeholder:text-white/20 border-l-4 border-l-[var(--s500)]"
            {...register('businessName', {required: true})}
            placeholder="Apex Plumbing"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="industry">Industry / Trade</Label>
          <Input
            id="industry"
            className="placeholder:text-white/20 border-l-4 border-l-[var(--s500)]"
            {...register('industry', {required: true})}
            placeholder="HVAC / Electrical / etc."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ownerName">Contact Person</Label>
          <Input
            id="ownerName"
            className="placeholder:text-white/20 border-l-4 border-l-[var(--s500)]"
            {...register('ownerName', {required: true})}
            placeholder="John Doe"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            className="placeholder:text-white/20 border-l-4 border-l-[var(--s500)]"
            {...register('email', {required: true})}
            placeholder="john@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            className="placeholder:text-white/20 border-l-4 border-l-[var(--s500)]"
            {...register('phone', {required: true})}
            placeholder="(555) 000-0000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="agentName">
            What would you like to name your AI agent? (Optional)
          </Label>
          <Input
            id="agentName"
            className="placeholder:text-white/20 border-l-4 border-l-[var(--s500)]"
            {...register('agentName')}
            placeholder="Sarah, Max, Alex..."
            maxLength={50}
          />
          <p className="text-xs opacity-60">
            This will be the name of your AI assistant
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            className="placeholder:text-white/20 border-l-4 border-l-[var(--s500)] min-h-[100px]"
            {...register('notes')}
            placeholder="AI behavior, specific questions, current phone system details, etc."
          />
        </div>
        <input type="hidden" {...register('package')} value={currentPackage} />
        <Button
          type="submit"
          className="w-full bg-[var(--s500)] hover:bg-[var(--s500)]/90"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? 'Initializing...'
            : `Confirm ${currentPackage === 'premium' ? 'Elite' : 'Starter'} Deployment`}
        </Button>
      </form>
    </>
  );
};

const PricingCard = ({pkg, isDark}) => {
  const factsData =
    pkg.id === 'premium'
      ? {
          tierName: 'Elite',
          discountPercent: 20,
          pricing: {monthly: 500, annualMonthly: 400, addon: 250},
          specs: {
            coverage: '24/7/365',
            ingredients:
              'PREMIUM NEURAL AUDIO (ELEVENLABS), DUAL-AGENT ON-CALL LOGIC, CAL.COM SYNC, 10DLC COMPLIANT SMS, UNIFIED INBOX ENGINE.',
          },
          limits: {minutes: '2,500', sms: '1,500'},
          features: [
            'Triple-channel Voice + Web + SMS AI Agents',
            'Dual-Agent On-Call System',
            'Lead Qualification',
            'Two-Way SMS (Unique Number)',
            'Cal.com Integration',
            'Unified AI Inbox',
            'Priority Support',
          ],
        }
      : {
          tierName: 'Core',
          discountPercent: 15,
          pricing: {monthly: 250, annualMonthly: 212.5, addon: 250},
          specs: {
            coverage: 'After Hours',
            ingredients:
              'NATURAL LANGUAGE PROCESSING, LEAD SCORING ALGORITHM, TWILIO VOICE STACK, SHARED SMS POOL, ONE-WAY NOTIFICATIONS, 100% AUTOMATION.',
          },
          limits: {minutes: '1,000', sms: '500'},
          features: [
            'Voice-only AI Agent',
            'Service Call Detection',
            'Lead Scoring & Scoring',
            'One-Way Shared SMS Notify',
            'Call Forwarding to Mobile',
            'Standard Trade Training Data',
            'Basic Support',
          ],
        };

  return (
    <div className="relative group h-full">
      {/* Main Card */}
      <div
        className={`relative h-full p-8 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${isDark ? 'border-white/10 bg-[#18181b]' : 'border-black/5 bg-white'} flex flex-col noise-overlay overflow-hidden`}
      >
        {/* Most Popular Badge (Top Aligned) */}
        {pkg.id === 'premium' && (
          <div className="absolute top-0 left-8 bg-[var(--v500)] text-[9px] font-bold px-4 py-1.5 rounded-b-lg uppercase tracking-wider shadow-md z-30 border-x border-b border-white/10">
            Most Popular
          </div>
        )}

        {/* AI Agent Facts Tab */}
        <div className="absolute -top-[1px] right-8 z-20">
          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-white text-black text-[11px] font-black uppercase px-6 py-2.5 rounded-b-xl border-x border-b border-black shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:bg-[var(--s500)] hover:text-white transition-all tracking-tighter flex items-center gap-2 group/btn cursor-pointer">
                <span>AI Agent Facts</span>
                <ArrowRight
                  size={12}
                  className="group-hover/btn:translate-x-1 transition-transform"
                />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-fit outline-none">
              <AgentFactsLabel {...factsData} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6 mt-10">
            <h3 className="brand-font text-2xl font-bold">{pkg.name}</h3>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="text-4xl font-bold mb-6">
              ${pkg.price}
              <span className="text-sm font-normal opacity-50">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {factsData.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm opacity-80"
                >
                  <Check size={16} className="text-[var(--s500)]" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className={`w-full ${pkg.id === 'premium' ? 'bg-[var(--v500)] hover:bg-[var(--v500)]/90 hover:scale-[1.02] transition-all' : isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
              >
                Select {pkg.name}
              </Button>
            </DialogTrigger>
            <DialogContent
              className={
                isDark
                  ? 'bg-[#12111a] text-white border-white/10'
                  : 'bg-white text-black border-black/10'
              }
            >
              <IntakeForm selectedPackage={pkg.id} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const PricingSection = ({isDark, onSelect}) => {
  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16">
        <h2 className="brand-font text-4xl font-bold mb-4">
          Scale Your Operations Instantly.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[
          {
            id: 'basic',
            name: 'Core Agent',
            price: '250',
            features: [
              'Voice-only AI Agent',
              'After-hours coverage',
              'SMS Follow-up',
              'Email lead capture',
              'Basic Support',
            ],
          },
          {
            id: 'premium',
            name: 'Elite Agent',
            price: '500',
            features: [
              'Triple-channel Voice + Web + SMS AI Agents',
              '24/7 Priority coverage',
              'Calendar Integration',
              'Direct Transfer capability',
              'Custom Voice Identity',
              'Priority Support',
            ],
          },
        ].map((pkg) => (
          <PricingCard key={pkg.id} pkg={pkg} isDark={isDark} />
        ))}
      </div>
    </section>
  );
};

const WranngleLanding = () => {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    const scriptId = 'el-convai-v1';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@beta';
      s.async = true;
      s.crossOrigin = 'anonymous';
      document.head.append(s);
    }

    const handleOutsideClick = (e) => {
      // Don't trigger if clicking inside a dialog
      if (e.target.closest('[role="dialog"]')) return;

      const widget = document.querySelector('elevenlabs-convai');
      if (widget && !widget.contains(e.target)) {
        const rect = widget.getBoundingClientRect();
        if (rect.height > 80 && widget.shadowRoot) {
          // Only dispatch Escape if no dialog is open to avoid conflicts
          const isDialogOpen = document.querySelector('[role="dialog"]');
          if (!isDialogOpen) {
            widget.dispatchEvent(
              new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true,
              }),
            );
          }

          // 2. Try finding a close/minimize button in Shadow DOM
          const buttons = [...widget.shadowRoot.querySelectorAll('button')];
          const closeBtn = buttons.find((b) => {
            const label = (
              b.ariaLabel ||
              b.title ||
              b.innerText ||
              ''
            ).toLowerCase();
            return (
              label.includes('close') ||
              label.includes('minimize') ||
              label.includes('collapse')
            );
          });

          if (closeBtn) {
            closeBtn.click();
          }
        }
      }
    };

    globalThis.addEventListener('click', handleOutsideClick);
    return () => {
      globalThis.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'dark bg-[#12111a]' : 'bg-[#fcfaf5]'}`}
    >
      <style>{FONTS_CSS}</style>
      <style>{`
        :root { --v500: #cf3c69; --s500: #ff5f00; --n950: #12111a; --lasso: 24px 4px 24px 4px; }
        .brand-font { font-family: 'Bricolage Grotesque', sans-serif; }
        .mono-font { font-family: 'JetBrains Mono', monospace; }
        .bg-page-dark { background: radial-gradient(circle at 50% 0%, #2d0914 0%, var(--n950) 60%); --shadow-card: 0 6px 16px rgba(0, 0, 0, 0.4); }
        .bg-page-light { background: linear-gradient(to bottom, #fcfaf5, #ebdfc8); --shadow-card: 0 6px 16px rgba(18, 17, 26, 0.08); }
        
        .noise-overlay::before {
            content: ''; position: absolute; inset: 0;
            background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            opacity: 0.04; pointer-events: none; z-index: 0;
        }
      `}</style>

      <div
        className={`min-h-screen flex flex-col ${isDark ? 'bg-page-dark text-[#fcfaf5]' : 'bg-page-light text-[#12111a]'}`}
      >
        <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md h-20 flex items-center px-6">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <img src={LOGO_URL} alt="Wranngle" className="h-14 w-auto" />

            <div className="flex items-center gap-8">
              <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
                <a href="#pricing">Pricing</a>
                <a href="#features">Features</a>
                <ThemeToggle isDark={isDark} toggle={toggleTheme} />
              </nav>

              <div className="hidden md:block">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="px-5 py-2.5 bg-[var(--s500)] text-white font-bold uppercase text-[10px] rounded-md shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                      DEPLOY AGENT <ArrowRight size={12} />
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className={
                      isDark
                        ? 'bg-[#12111a] text-white border-white/10'
                        : 'bg-white text-black border-black/10'
                    }
                  >
                    <IntakeForm selectedPackage="premium" />
                  </DialogContent>
                </Dialog>
              </div>

              <button
                className="md:hidden p-2"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{opacity: 0, y: -20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
              className={`fixed inset-0 z-40 md:hidden pt-28 px-6 ${isDark ? 'bg-[#12111a]' : 'bg-[#fcfaf5]'} overflow-y-auto`}
            >
              <nav className="flex flex-col gap-6 text-2xl font-bold brand-font">
                <a
                  href="#pricing"
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                >
                  Pricing
                </a>
                <a
                  href="#features"
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                >
                  Features
                </a>
                <div className="flex items-center justify-between py-6 border-y border-black/10 dark:border-white/10">
                  <span className="text-sm font-medium opacity-60 uppercase tracking-widest">
                    Toggle Appearance
                  </span>
                  <ThemeToggle isDark={isDark} toggle={toggleTheme} />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full py-6 bg-[var(--s500)] text-white font-bold uppercase text-sm rounded-xl shadow-xl flex items-center justify-center gap-3">
                      DEPLOY AGENT <ArrowRight size={18} />
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className={
                      isDark
                        ? 'bg-[#12111a] text-white border-white/10'
                        : 'bg-white text-black border-black/10'
                    }
                  >
                    <IntakeForm selectedPackage="premium" />
                  </DialogContent>
                </Dialog>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
          >
            <h1 className="brand-font text-5xl md:text-7xl font-bold leading-none mb-8">
              Tame the <br />
              <span className="text-[var(--s500)]">Wild Frontier</span> <br />
              of AI.
            </h1>
            <p className="text-lg opacity-80 mb-10 max-w-md">
              The 24/7 AI Voice Agent for small trades businesses. Stop missing
              leads after hours.
            </p>
            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <ButtonPrimary>DEPLOY AGENT</ButtonPrimary>
                </DialogTrigger>
                <DialogContent
                  className={
                    isDark
                      ? 'bg-[#12111a] text-white border-white/10'
                      : 'bg-white text-black border-black/10'
                  }
                >
                  <IntakeForm selectedPackage="premium" />
                </DialogContent>
              </Dialog>
              <ButtonGhost
                onClick={() => {
                  const element = document.querySelector('elevenlabs-convai');
                  element?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                  setTimeout(() => {
                    const btn = element?.shadowRoot?.querySelector('button');
                    if (btn) btn.click();
                  }, 1000);
                }}
              >
                LIVE DEMO
              </ButtonGhost>
            </div>
          </motion.div>
          <ConsoleVisual isDark={isDark} lines={CONSOLE_LINES} />
        </main>

        <PricingSection isDark={isDark} />

        <section
          id="features"
          className="py-32 px-6 max-w-7xl mx-auto w-full relative"
        >
          {/* Section Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,95,0,0.03),transparent_70%)] pointer-events-none" />

          <div className="mb-24 relative z-10">
            <h2 className="brand-font text-5xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight">
              Industrial-Grade <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--s500)] to-[var(--v500)]">
                Defense System
              </span>{' '}
              <br />
              For Your Revenue.
            </h2>
            <p className="opacity-60 max-w-xl text-lg leading-relaxed">
              Manual reception is a vulnerability. Wranngle deploys an
              autonomous, deterministic layer that insulates your business from
              chaos.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {/* Feature 1: The Chrono-Sentinel */}
            <TerminalCard
              isDark={isDark}
              title="TEMPORAL_SENTINEL"
              status="SCANNING"
              index="01"
            >
              <RadarWatchdog />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Total Temporal Coverage
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  A persistent, non-sleeping observer. Whether it's 2 AM or
                  Christmas Day, the sentinel intercepts every signal.
                </p>
              </div>
            </TerminalCard>

            {/* Feature 2: The Spectral Gate */}
            <TerminalCard
              isDark={isDark}
              title="SPECTRAL_GATE"
              status="FILTERING"
              index="02"
            >
              <SpectralAnalyzer />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Signal Validation
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Advanced heuristics analyze caller intent in real-time. Spam
                  is vaporized. Revenue is crystalized.
                </p>
              </div>
            </TerminalCard>

            {/* Feature 3: The Synapse Bridge */}
            <TerminalCard
              isDark={isDark}
              title="SYNAPSE_UPLINK"
              status="CONNECTED"
              index="03"
            >
              <SynapseLink />
              <div className="mt-8 relative z-10">
                <h3 className="brand-font text-2xl font-bold mb-2">
                  Zero-Latency Uplink
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">
                  Valid leads are transmuted into structured data and injected
                  directly into your mobile device via SMS.
                </p>
              </div>
            </TerminalCard>
          </div>
        </section>

        <FAQ isDark={isDark} />

        <footer className="py-12 border-t border-white/10 px-6 text-xs mono-font">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="opacity-50">© 2026 Wranngle Systems LLC</div>
            <div className="flex gap-6 opacity-70">
              <Link href="/terms">
                <a className="hover:text-[var(--s500)] hover:underline transition-colors">
                  Terms of Service
                </a>
              </Link>
              <Link href="/privacy">
                <a className="hover:text-[var(--s500)] hover:underline transition-colors">
                  Privacy Policy
                </a>
              </Link>
            </div>
          </div>
        </footer>

        <elevenlabs-convai agent-id="agent_8001kdgp7qbyf4wvhs540be78vew"></elevenlabs-convai>
      </div>
    </div>
  );
};

const ButtonPrimary = React.forwardRef(({children, ...props}, ref) => (
  <button
    ref={ref}
    {...props}
    className="px-8 py-4 bg-[var(--s500)] text-white font-bold uppercase text-xs rounded-lg shadow-lg hover:scale-105 transition-all flex items-center gap-2"
  >
    {children} <ArrowRight size={14} />
  </button>
));

const ButtonGhost = ({children, ...props}) => (
  <button
    {...props}
    className="px-8 py-4 border border-current font-bold uppercase text-xs rounded-lg hover:bg-white/5 transition-all"
  >
    {children}
  </button>
);

const Card = ({title, desc, accent, isDark}) => (
  <div className="relative group">
    <div
      className={`absolute inset-0 rounded-[var(--lasso)] translate-x-1.5 translate-y-1.5 transition-all duration-300 group-hover:translate-x-3 group-hover:translate-y-3 ${accent ? 'bg-[var(--s500)]' : 'bg-[var(--v500)]'}`}
    />
    <div
      className={`relative h-full p-8 rounded-[var(--lasso)] border border-white/10 ${isDark ? 'bg-[#18181b]' : 'bg-white'} shadow-sm`}
    >
      <h3 className="brand-font text-xl font-bold mb-2">{title}</h3>
      <p
        className={`text-sm opacity-70 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {desc}
      </p>
    </div>
  </div>
);

const ThemeToggle = ({isDark, toggle}) => (
  <button onClick={toggle} className="p-2 rounded-full hover:bg-white/10">
    {isDark ? <Sun size={18} /> : <Moon size={18} />}
  </button>
);

const ConsoleVisual = ({isDark, lines}) => {
  const [display, setDisplay] = useState([]);
  const idx = useRef(0);
  const containerRef = useRef(null);
  const [dim, setDim] = useState({w: 0, h: 0});

  useEffect(() => {
    setDisplay([]);
    idx.current = 0;
    const interval = setInterval(() => {
      if (idx.current < lines.length) {
        const line = lines[idx.current];
        if (line) setDisplay((previous) => [...previous, line]);
        idx.current++;
      } else clearInterval(interval);
    }, 800);
    return () => {
      clearInterval(interval);
    };
  }, [lines]);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDim = () => {
      const {width, height} = containerRef.current.getBoundingClientRect();
      setDim({w: width, h: height});
    };

    updateDim();
    const observer = new ResizeObserver(updateDim);
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Path for rounded-[24px_4px_24px_4px] with 2px stroke (inset 1px)
  // W and H are the full container dimensions.
  // We draw the path along the center of the 2px border, so we inset by 1px.
  // Radius adjustment: outer radius - inset = 24 - 1 = 23 (approx)
  // TL: 24px -> arc from (1, 24) to (24, 1)
  // TR: 4px  -> arc from (W-4, 1) to (W-1, 4)
  // BR: 24px -> arc from (W-1, H-24) to (W-24, H-1)
  // BL: 4px  -> arc from (4, H-1) to (1, H-4)

  const {w} = dim;
  const {h} = dim;
  const pathD =
    w > 0
      ? `
    M 24 1
    L ${w - 4} 1
    Q ${w - 1} 1 ${w - 1} 4
    L ${w - 1} ${h - 24}
    Q ${w - 1} ${h - 1} ${w - 24} ${h - 1}
    L 4 ${h - 1}
    Q 1 ${h - 1} 1 ${h - 4}
    L 1 24
    Q 1 1 24 1
    Z
  `
      : '';

  return (
    <div
      ref={containerRef}
      className={`relative h-80 w-full rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${isDark ? 'border-white/10 bg-[#0f0f13] text-gray-400' : 'border-black/10 bg-[#1a1a1e] text-gray-400'} p-6 mono-font text-[11px] flex flex-col overflow-hidden noise-overlay`}
      style={{boxShadow: 'var(--shadow-card)'}}
    >
      {/* Tracer Border */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <motion.path
            d={pathD}
            fill="none"
            stroke="var(--s500)"
            strokeWidth="2"
            strokeDasharray="100 1500"
            strokeLinecap="round"
            initial={{strokeDashoffset: 0}}
            animate={{strokeDashoffset: -1600}}
            transition={{duration: 4, repeat: Infinity, ease: 'linear'}}
          />
        </svg>
      </div>

      <div className="flex justify-between border-b border-white/10 pb-2 mb-4 relative z-10">
        <span className="text-white font-bold opacity-0">_</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{' '}
          LIVE
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 relative z-10">
        {display.map(
          (l, i) =>
            l && (
              <motion.div
                key={i}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                className={l.color || ''}
              >
                {l.text || ''}
              </motion.div>
            ),
        )}
        <motion.span
          animate={{opacity: [0, 1, 0]}}
          transition={{repeat: Infinity}}
          className="text-[var(--s500)] font-bold"
        >
          _
        </motion.span>
      </div>
    </div>
  );
};

const RadarWatchdog = () => {
  return (
    <div className="h-48 w-full flex items-center justify-center relative overflow-hidden bg-black/20 rounded-lg border border-white/5">
      {/* Radar Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, #fff 1px, transparent 1px), radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      />

      {/* Radar Circles */}
      {[60, 120, 180].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[var(--s500)] opacity-20"
          style={{width: size, height: size}}
        />
      ))}

      {/* Scanning Line */}
      <motion.div
        className="absolute w-1/2 h-1/2 origin-bottom-right bg-gradient-to-tl from-[var(--s500)]/0 to-[var(--s500)]/50"
        style={{top: 0, left: 0, borderRight: '1px solid var(--s500)'}}
        animate={{rotate: 360}}
        transition={{duration: 4, repeat: Infinity, ease: 'linear'}}
      />

      {/* Detected Blips */}
      <motion.div
        className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"
        initial={{opacity: 0, scale: 0, top: '30%', left: '40%'}}
        animate={{opacity: [0, 1, 0], scale: [0, 1.5, 0]}}
        transition={{duration: 2, repeat: Infinity, repeatDelay: 1}}
      />
      <motion.div
        className="absolute w-1.5 h-1.5 bg-[var(--v500)] rounded-full shadow-[0_0_10px_var(--v500)]"
        initial={{opacity: 0, scale: 0, top: '60%', left: '70%'}}
        animate={{opacity: [0, 1, 0], scale: [0, 1.5, 0]}}
        transition={{duration: 3, repeat: Infinity, repeatDelay: 0.5}}
      />

      {/* Center HUD */}
      <div className="absolute z-10 text-[8px] font-mono text-[var(--s500)] flex flex-col items-center">
        <span>TGT_ACQ</span>
        <span className="tabular-nums">34.9023</span>
      </div>
    </div>
  );
};

const SpectralAnalyzer = () => {
  return (
    <div className="h-48 w-full flex flex-col justify-between p-4 bg-black/20 rounded-lg border border-white/5 relative overflow-hidden">
      <div className="flex justify-between text-[10px] font-mono opacity-50 mb-2">
        <span>FREQ: 44.1kHz</span>
        <span>GAIN: +12dB</span>
      </div>

      <div className="flex items-end justify-between h-24 gap-1">
        {Array.from({length: 20}).map((_, i) => (
          <motion.div
            key={i}
            className="w-full bg-[var(--s500)] rounded-t-sm opacity-80"
            animate={{
              height: ['10%', `${Math.random() * 80 + 20}%`, '10%'],
              backgroundColor:
                i > 12 ? ['#cf3c69', '#cf3c69'] : ['#ff5f00', '#ff5f00'], // Red for high freq (spam)
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: i * 0.05,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Analysis Overlay */}
      <div className="mt-2 h-6 w-full bg-black/40 rounded flex items-center px-2 font-mono text-[9px] text-green-400 gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <TypewriterSequence
          sequence={[
            '> VOICE_MATCH_CONFIRMED',
            '> SENTIMENT: POSITIVE',
            '> ROUTING_TO_SALES',
          ]}
        />
      </div>
    </div>
  );
};

const SynapseLink = () => {
  return (
    <div className="h-48 w-full flex items-center justify-center relative bg-black/20 rounded-lg border border-white/5">
      {/* Nodes */}
      <div className="absolute left-8 w-12 h-12 rounded-full border-2 border-[var(--s500)] flex items-center justify-center bg-[var(--s500)]/10 z-10">
        <div className="w-4 h-4 bg-[var(--s500)] rounded-full animate-ping opacity-50" />
      </div>
      <div className="absolute right-8 w-12 h-12 rounded-lg border-2 border-white/20 flex items-center justify-center bg-white/5 z-10">
        <Zap size={18} />
      </div>

      {/* Connection Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d="M 60 96 C 150 96, 250 96, 300 96"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 60 96 C 150 96, 250 96, 300 96"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5 5"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--s500)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Data Packets */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 w-3 h-1.5 bg-white rounded-full shadow-[0_0_10px_var(--s500)]"
          initial={{left: '15%', opacity: 0}}
          animate={{left: '80%', opacity: [0, 1, 1, 0]}}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'linear',
          }}
          style={{marginTop: -3}}
        />
      ))}

      {/* Notification Popup */}
      <motion.div
        className="absolute right-0 top-6 bg-white text-black text-[9px] font-bold px-2 py-1 rounded shadow-lg font-mono"
        animate={{y: [0, -5, 0], opacity: [0.5, 1, 0.5]}}
        transition={{duration: 2, repeat: Infinity}}
      >
        +1 LEAD
      </motion.div>
    </div>
  );
};

const TerminalCard = ({children, title, status, index, isDark}) => (
  <div className="relative group">
    {/* Main Card */}
    <div
      className={`relative h-full p-1 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${isDark ? 'border-white/10 bg-[#12111a]' : 'border-black/10 bg-white'} overflow-hidden noise-overlay`}
      style={{boxShadow: 'var(--shadow-card)'}}
    >
      {/* Holographic Border Effect */}
      <div
        className={`absolute inset-0 border border-white/5 rounded-[24px_4px_24px_4px] bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm transition-colors group-hover:border-[var(--s500)]/50 pointer-events-none z-10`}
      />

      <div className="relative p-6 h-full flex flex-col z-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 font-mono text-[10px] tracking-widest text-[var(--s500)]">
          <span className="border border-[var(--s500)]/30 px-2 py-0.5 rounded bg-[var(--s500)]/5">
            MOD_{index} // {title}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_infinite]" />
            {status}
          </span>
        </div>

        {children}
      </div>
    </div>
  </div>
);

const TypewriterSequence = ({sequence}) => {
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((previous) => (previous + 1) % sequence.length);
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [sequence]);

  return (
    <div className="w-full overflow-hidden whitespace-nowrap">
      <motion.div
        key={currentLine}
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        exit={{opacity: 0}}
      >
        {sequence[currentLine]}
      </motion.div>
    </div>
  );
};

const AgentFactsLabel = ({
  tierName,
  pricing,
  specs,
  limits,
  features,
  discountPercent,
}) => {
  return (
    <div className="bg-white border-2 border-black p-4 w-full max-w-[380px] font-sans text-black shadow-sm mx-auto flex flex-col h-full">
      {/* Main Content Wrapper - Grows to fill space */}
      <div className="flex-grow">
        {/* Header Section */}
        <div className="border-b-[8px] border-black pb-1 mb-1">
          <h1 className="text-4xl font-black leading-none tracking-tighter uppercase italic">
            AI Agent Facts
          </h1>
          <div className="flex justify-between items-baseline font-bold text-sm mt-1">
            <span>Serving Size</span>
            <span>1 Business Location</span>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="border-b-[4px] border-black py-1">
          <div className="text-xs font-bold uppercase tracking-tighter">
            Base Service Price
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-black block leading-none">
                Monthly
              </span>
              <span className="text-[10px] font-bold uppercase">
                No Commitment
              </span>
            </div>
            <span className="text-5xl font-black leading-none">
              ${pricing.monthly}
            </span>
          </div>

          {/* Annual Discount Section */}
          <div className="mt-2 pt-1 border-t border-black border-dashed flex justify-between items-center">
            <div>
              <div className="text-[11px] font-black uppercase">
                {discountPercent}% Discount Price
              </div>
              <div className="text-[9px] leading-tight text-gray-600 font-bold uppercase">
                w/ Annual Commitment
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black">
                ${pricing.annualMonthly}
              </span>
              <span className="text-[10px] block font-bold mt-[-4px]">/mo</span>
            </div>
          </div>
        </div>

        {/* Main Stats / Nutrients Section */}
        <div className="border-b-[4px] border-black">
          <div className="flex justify-end text-[10px] font-bold border-b border-black py-0.5 uppercase tracking-tighter">
            % Fair Use Cap *
          </div>

          {/* Coverage Stat */}
          <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
            <span>
              <span className="font-bold">Voice Coverage</span> {specs.coverage}
            </span>
            <span className="font-bold text-xs italic">ACTIVE</span>
          </div>

          {/* Minutes Stat */}
          <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
            <span>
              <span className="font-bold">Total Voice Minutes</span>
            </span>
            <span className="font-bold">100%</span>
          </div>
          <div className="pl-4 text-xs py-1 border-b border-black">
            Includes {limits.minutes} Monthly Pooled Minutes
          </div>

          {/* SMS Stat */}
          <div className="flex justify-between items-baseline border-b border-black py-1 text-sm">
            <span>
              <span className="font-bold">Total SMS Segments</span>
            </span>
            <span className="font-bold">100%</span>
          </div>
          <div className="pl-4 text-xs py-1 border-b border-black">
            Includes {limits.sms} Monthly Segments
          </div>

          {/* Feature List / Ingredients */}
          <div className="py-2">
            <div className="font-bold text-sm mb-1 uppercase tracking-tighter">
              Included System Features:
            </div>
            <ul className="text-xs space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex justify-between border-b border-gray-200 pb-0.5 last:border-0"
                >
                  <span className="pl-2">• {feature}</span>
                  <span className="font-bold">Yes</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scalability Section */}
        <div className="border-b-[4px] border-black py-1.5 flex justify-between items-baseline text-sm">
          <span className="font-bold">Additional Locations</span>
          <span className="font-bold">${pricing.addon}/mo</span>
        </div>
      </div>

      {/* Footer Wrapper - Pushed to bottom */}
      <div className="mt-auto">
        {/* Ingredients List */}
        <div className="text-[9px] mt-2 leading-tight">
          <span className="font-bold uppercase italic">
            Marketing Ingredients:
          </span>{' '}
          {specs.ingredients}
        </div>

        {/* Footnote */}
        <div className="text-[8px] mt-2 border-t border-black pt-1 leading-[1.2]">
          * The % Fair Use (FU) indicates the capacity included in the base
          price before standard overage rates apply. Mid-annual cancellation of
          the Discount Price is subject to cancellation fees. API access not
          available. White-labeling included. All agents are trade-specific.
        </div>
      </div>
    </div>
  );
};

export default WranngleLanding;
