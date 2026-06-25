'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle, ChevronDown, Shield, MessageCircle, Zap, Clock, CreditCard, Wrench, Lightbulb, Wind, Phone, Gift, Users, TrendingUp } from 'lucide-react';
import { Logo } from '@/components/logo';


function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ChatBubble({ children, side, delay = 0 }: { children: React.ReactNode; side: 'user' | 'agent'; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: side === 'user' ? 30 : -30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: side === 'user' ? 30 : -30, scale: 0.95 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={side === 'user' ? 'flex justify-end' : 'flex justify-start'}
    >
      <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 text-sm sm:text-base ${
        side === 'user'
          ? 'bubble-user bg-primary text-primary-foreground'
          : 'bubble-agent bg-card border border-border shadow-sm text-foreground'
      }`}>
        {children}
      </div>
    </motion.div>
  );
}

const CONVERSATIONS: { title: string; lang: string; messages: { side: 'user' | 'agent'; text: string }[] }[] = [
  {
    title: 'Airtime Purchase',
    lang: 'Pidgin',
    messages: [
      { side: 'user', text: 'Abeg recharge my phone with 2k airtime' },
      { side: 'agent', text: 'Na MTN 0803****789? ₦2,000 airtime. I go do am?' },
      { side: 'user', text: 'Yes, sharp sharp' },
      { side: 'agent', text: 'Done ✓ ₦2,000 airtime don land. Balance updated.' },
    ],
  },
  {
    title: 'Plumber Request',
    lang: 'English',
    messages: [
      { side: 'user', text: 'I need a plumber in Lekki urgently' },
      { side: 'agent', text: 'Found a verified plumber — 4.8★ rating. ₦18,000 estimate. Book now?' },
      { side: 'user', text: 'Yes please' },
      { side: 'agent', text: 'Booked ✓ He arrives in 25 mins. Payment held in escrow until you confirm.' },
    ],
  },
  {
    title: 'Hair Stylist',
    lang: 'Pidgin',
    messages: [
      { side: 'user', text: 'I dey find hairstylist wey sabi do knotless braids for Surulere' },
      { side: 'agent', text: 'I get one — Aunty Bimpe, 4.9★, ₦25,000 for knotless braids. She fit come house.' },
      { side: 'user', text: 'Shebi e go tey? How many hours?' },
      { side: 'agent', text: '4-5 hours. She fit start by 10am tomorrow. I go book am?' },
      { side: 'user', text: 'Book am jare' },
      { side: 'agent', text: 'Done ✓ Aunty Bimpe go come 10am. Money dey escrow till you happy.' },
    ],
  },
  {
    title: 'Fresh Fish Market',
    lang: 'Pidgin',
    messages: [
      { side: 'user', text: 'I wan buy fresh catfish, like 5kg. Who get for Ajah side?' },
      { side: 'agent', text: 'Mama Fish Farm dey Ajah — 5kg catfish na ₦12,500. Fresh today. You want?' },
      { side: 'user', text: 'E too cost o. Anything around 10k?' },
      { side: 'agent', text: 'Oga Tunde Fish dey offer 5kg for ₦10,000. Delivery free. Confirm?' },
      { side: 'user', text: 'Ehen! Na this one. Confirm am' },
      { side: 'agent', text: 'Confirmed ✓ Delivery before 4pm today. Pay when fish land.' },
    ],
  },
  {
    title: 'Electrician',
    lang: 'Hausa',
    messages: [
      { side: 'user', text: 'Ina son electrician a Garki, Abuja. Wutar gidana ta lalace' },
      { side: 'agent', text: 'Mun sami Musa Electricals — verified, 4.7★. ₦15,000 estimate. Za ka yarda?' },
      { side: 'user', text: 'To, na yarda' },
      { side: 'agent', text: 'An shirya ✓ Zai iso cikin minti 40. Kudin ka yana cikin escrow.' },
    ],
  },
  {
    title: 'Data Bundle',
    lang: 'Yoruba',
    messages: [
      { side: 'user', text: 'Mo fẹ́ ra data 10GB fún phone mi' },
      { side: 'agent', text: 'MTN 10GB — ₦3,000 tabi Airtel 10GB — ₦2,800. Èwo lo fẹ́?' },
      { side: 'user', text: 'Airtel, ó din owo ju' },
      { side: 'agent', text: 'Ó ti ṣe ✓ 10GB ti activate lori 0802****456. Ọjọ́ 30 validity.' },
    ],
  },
  {
    title: 'Generator Repair',
    lang: 'English',
    messages: [
      { side: 'user', text: 'My generator is making a loud noise and shutting off. Need a repair person.' },
      { side: 'agent', text: 'Found 3 verified generator technicians near you. Top rated: EmmaFix — ₦12,000 diagnostic. Proceed?' },
      { side: 'user', text: 'Yes, send EmmaFix' },
      { side: 'agent', text: 'Scheduled ✓ EmmaFix arrives tomorrow 9am. You only pay after repair is confirmed.' },
    ],
  },
  {
    title: 'Electricity Bill',
    lang: 'Pidgin',
    messages: [
      { side: 'user', text: 'Abeg help me pay light bill. IKEDC, prepaid meter' },
      { side: 'agent', text: 'I see your meter — ₦8,500 outstanding. You wan pay all?' },
      { side: 'user', text: 'Pay 5k first' },
      { side: 'agent', text: 'Paid ✓ Token: 6293-4017-8852-1134. ₦5,000 credited to your meter.' },
    ],
  },
  {
    title: 'Tailor / Fashion',
    lang: 'Yoruba',
    messages: [
      { side: 'user', text: 'Mo nilo tailor to dara fun agbada. Ọjọ́ Saturday ni party mi' },
      { side: 'agent', text: 'Tailor Kọ́lá ni Ìkẹjà — 4.9★, ó le ṣe agbada ni ọjọ́ mẹ́ta. ₦45,000. Ṣé o fẹ́?' },
      { side: 'user', text: 'Bẹ́ẹ̀ni, jọ̀wọ́ book fún mi' },
      { side: 'agent', text: 'Ó ti book ✓ Tailor Kọ́lá yóò pè ọ́ lọ́la fún measurement. Owó wà ní escrow.' },
    ],
  },
  {
    title: 'AC Repair',
    lang: 'Hausa',
    messages: [
      { side: 'user', text: 'AC dina ba ta aiki. Ina bukatar wanda zai gyara ta a Wuse' },
      { side: 'agent', text: 'Ibrahim Cooling Services — verified, 4.8★. ₦10,000 don dubawa. Ko ka yarda?' },
      { side: 'user', text: 'I, na yarda. Yaushe zai zo?' },
      { side: 'agent', text: 'Zai zo yau da karfe 3. Kudin ka yana lafiya cikin escrow ✓' },
    ],
  },
];

function LiveConversation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const hasStarted = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentConvo = CONVERSATIONS[activeIndex];

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;
    startConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  function startConversation() {
    setVisibleCount(0);
    setIsTyping(true);
    timeoutRef.current = setTimeout(() => showNextMessage(0), 1500);
  }

  function showNextMessage(idx: number) {
    setIsTyping(false);
    setVisibleCount(idx + 1);

    const convo = CONVERSATIONS[activeIndex];
    if (idx + 1 < convo.messages.length) {
      setIsTyping(true);
      const nextIsAgent = convo.messages[idx + 1]?.side === 'agent';
      timeoutRef.current = setTimeout(() => showNextMessage(idx + 1), nextIsAgent ? 2800 : 2000);
    } else {
      // Conversation done — wait then cycle to next
      timeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % CONVERSATIONS.length);
      }, 5000);
    }
  }

  // When activeIndex changes, start the new conversation
  useEffect(() => {
    if (!hasStarted.current) return;
    startConversation();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount]);

  return (
    <div ref={sectionRef} className="bg-card border border-border rounded-2xl shadow-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-xs font-medium text-muted-foreground">{currentConvo.title}</p>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{currentConvo.lang}</span>
      </div>
      <div ref={containerRef} className="px-4 py-5 space-y-3 min-h-[220px]">
        {currentConvo.messages.slice(0, visibleCount).map((msg, idx) => (
          <motion.div
            key={`${activeIndex}-${idx}`}
            initial={{ opacity: 0, x: msg.side === 'user' ? 30 : -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={msg.side === 'user' ? 'flex justify-end' : 'flex justify-start'}
          >
            <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 text-sm sm:text-base ${
              msg.side === 'user'
                ? 'bubble-user bg-primary text-primary-foreground'
                : 'bubble-agent bg-card border border-border shadow-sm text-foreground'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="px-4 py-3 bubble-agent bg-card border border-border shadow-sm">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </motion.div>
        )}
      </div>
      {/* Conversation indicators */}
      <div className="px-4 py-3 border-t border-border bg-secondary/20 flex justify-center gap-1.5">
        {CONVERSATIONS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i === activeIndex ? 'bg-primary' : 'bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown
          size={18}
          className={`text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function Homepage() {
  // Live counter — starts at a base and ticks up
  const [jobsCompleted, setJobsCompleted] = useState(1247);
  const [activeVendors, setActiveVendors] = useState(312);

  useEffect(() => {
    const interval = setInterval(() => {
      setJobsCompleted((c) => c + Math.floor(Math.random() * 3));
      setActiveVendors((v) => v + (Math.random() > 0.7 ? 1 : 0));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-clip">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Logo />
          <nav className="hidden sm:flex items-center gap-6">
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition">How it works</a>
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition">Services</a>
            <a href="/vendor/login" className="text-sm text-muted-foreground hover:text-foreground transition">For Vendors</a>
            <a href="/admin/login" className="text-sm text-muted-foreground hover:text-foreground transition">Admin</a>
          </nav>
          <a href="/chat" className="relative px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:scale-105 active:scale-95 transition-transform">
            <span className="relative z-10 flex items-center gap-1.5">
              <MessageCircle size={14} /> Chat Now
            </span>
          </a>
        </div>
      </header>

      {/* Hero — Conversational */}
      <section className="relative gradient-hero">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Trusted by 1,000+ Nigerians daily
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-4 tracking-tight"
          >
            Just say it.<br />
            <span className="text-gradient">We&apos;ll handle it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-6"
          >
            Fix, pay, or book anything — no apps, no stress.<br className="hidden sm:block" />
            Send a WhatsApp message. We take it from there.
          </motion.p>

          {/* Suggestion Chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {[
              'Fix my AC',
              'Pay my electricity',
              'I need a plumber in Lekki',
              'Recharge ₦1,000 MTN',
              'Book a hairstylist',
            ].map((chip) => (
              <a
                key={chip}
                href="/chat"
                className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5 transition-colors"
              >
                {chip}
              </a>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
          >
            <a href="/chat" className="group relative px-7 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-105 active:scale-95 transition-transform inline-flex items-center justify-center gap-2 shadow-elevated">
              <MessageCircle size={18} />
              Start on WhatsApp
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-full shimmer pointer-events-none" />
            </a>
            <a href="#demo" className="px-7 py-3.5 border border-border text-foreground rounded-full font-semibold hover:bg-secondary transition inline-flex items-center justify-center gap-2">
              See how it works
            </a>
          </motion.div>

          {/* Hero Chat Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl shadow-float overflow-hidden">
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-secondary/50">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">SpringUpAI</p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>
              {/* Chat messages */}
              <div className="px-4 py-5 space-y-3">
                <div className="flex justify-end">
                  <div className="bubble-user bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                    I need a plumber in Ikeja
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bubble-agent bg-secondary border border-border px-4 py-2.5 text-sm">
                    Got it! Verified plumber available in 30 mins.<br />₦15,000 estimate. Proceed? ✓
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bubble-user bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                    Yes please
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bubble-agent bg-secondary border border-border px-4 py-2.5 text-sm">
                    Done! Connecting you now 🔗
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works — Timeline */}
      <section id="how" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">Simple as chatting</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Three messages. That&apos;s all.</h2>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-0.5 bg-linear-to-r from-primary/20 via-primary/40 to-primary/20" />

            {[
              { num: '1', icon: MessageCircle, title: 'Tell us what you need', desc: '"Fix my AC", "Pay my light bill", "I need a plumber now"' },
              { num: '2', icon: Zap, title: 'We handle everything', desc: 'We find verified providers, negotiate price, and coordinate the job' },
              { num: '3', icon: CheckCircle, title: 'You pay when done', desc: 'Safe escrow payment. No risk. No stress. Just results.' },
            ].map((step, i) => (
              <Section key={step.num} delay={i * 0.15}>
                <div className="relative text-center group">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl gradient-primary flex items-center justify-center shadow-elevated group-hover:scale-110 transition-transform duration-300">
                    <step.icon size={28} className="text-white" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">STEP {step.num}</div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Services — Card Grid */}
      <section id="services" className="py-20 sm:py-28 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">What you can do</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Everything you usually stress about</h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-14">One WhatsApp message handles all of these. No separate apps. No negotiations.</p>
          </Section>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: CreditCard, label: 'Electricity Bills' },
              { icon: Phone, label: 'Airtime & Data' },
              { icon: CreditCard, label: 'Cable TV' },
              { icon: CreditCard, label: 'Internet' },
              { icon: Wrench, label: 'Plumbing' },
              { icon: Wind, label: 'AC Repair' },
              { icon: Lightbulb, label: 'Electrical' },
              { icon: Wrench, label: 'Appliances' },
            ].map((service, i) => (
              <Section key={service.label} delay={i * 0.05}>
                <div className="group bg-card border border-border rounded-xl p-5 text-center hover:shadow-float hover:-translate-y-1 transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <service.icon size={22} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium">{service.label}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* Conversation Demo — The Heart */}
      <section id="demo" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">See it in action</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Real conversations. Real results.</h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-14">This is what it actually looks like when you message SpringUpAI.</p>
          </Section>

          <div className="max-w-lg mx-auto">
            <LiveConversation />
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 sm:py-28 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">Watch it work</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">What it feels like</h2>
          </Section>
          <Section delay={0.2}>
            <div className="max-w-3xl mx-auto rounded-2xl shadow-float overflow-hidden border border-border" style={{ position: 'relative', paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://e2b.x-pilot.ai/share/OMjFScR49dPiv6eXjtyrS/preview"
                title="SpringUpAI Demo - How to fix, pay, or book anything via WhatsApp in Nigeria"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Section>
        </div>
      </section>

      {/* Why People Trust Us */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">Built for trust</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">Safe by design</h2>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: Shield, text: 'Money held until work is verified' },
              { icon: CheckCircle, text: 'Only verified professionals' },
              { icon: MessageCircle, text: 'Support if anything goes wrong' },
              { icon: CreditCard, text: 'You approve every payment' },
              { icon: Shield, text: 'NDPR compliant — your data is private' },
              { icon: MessageCircle, text: 'Dispute? We mediate until you\'re satisfied' },
            ].map((item, i) => (
              <Section key={item.text} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-elevated transition-shadow duration-300">
                  <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-primary/5 flex items-center justify-center">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{item.text}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <p className="text-sm font-medium text-primary text-center mb-2 tracking-wide uppercase">Common questions</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Good to know</h2>
          </Section>
          <Section delay={0.1}>
            <div className="max-w-2xl mx-auto divide-y divide-border">
              <FaqItem
                q="Is my money safe?"
                a="Yes. We hold your payment in escrow from the moment you agree to a price. It's only released to the vendor after you confirm the job is done. If nothing happens, you get a full refund."
              />
              <FaqItem
                q="What if the vendor doesn't show up?"
                a="You get a full refund, no questions asked. We'll also flag or suspend the vendor from the platform."
              />
              <FaqItem
                q="Is there VAT on transactions?"
                a="Yes — 7.5% VAT applies to all transactions in line with FIRS requirements. It will be shown clearly before you confirm any payment."
              />
              <FaqItem
                q="What content is allowed?"
                a="Only legal, lawful services. We don't support adult content, illegal items, financial fraud, or anything that violates Nigerian law or our content policy."
              />
              <FaqItem
                q="How do I raise a dispute?"
                a="Just message us through the chat. We aim to mediate and resolve all disputes within 24 hours."
              />
            </div>
          </Section>
        </div>
      </section>

      {/* Live Service Counter */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="bg-card border border-border rounded-2xl shadow-elevated p-8 sm:p-12">
              <p className="text-sm font-medium text-primary text-center mb-6 tracking-wide uppercase">Live right now</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp size={20} className="text-primary" />
                    <motion.p
                      key={jobsCompleted}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl sm:text-4xl font-bold"
                    >
                      {jobsCompleted.toLocaleString()}
                    </motion.p>
                  </div>
                  <p className="text-sm text-muted-foreground">Jobs completed</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users size={20} className="text-primary" />
                    <motion.p
                      key={activeVendors}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl sm:text-4xl font-bold"
                    >
                      {activeVendors}+
                    </motion.p>
                  </div>
                  <p className="text-sm text-muted-foreground">Active vendors</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Zap size={20} className="text-green-500" />
                    <p className="text-3xl sm:text-4xl font-bold">30 min</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Avg. response time</p>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* Referral Program */}
      <section className="py-20 sm:py-28 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="max-w-3xl mx-auto">
              <div className="bg-card border border-border rounded-2xl shadow-float overflow-hidden">
                <div className="gradient-primary p-8 sm:p-10 text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Gift size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Refer &amp; Earn ₦500</h2>
                  <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto">
                    Share your unique link. When someone signs up and completes their first service or bill payment, you both earn ₦500 credit.
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                      { step: '1', text: 'Copy your referral link from your dashboard' },
                      { step: '2', text: 'Share on WhatsApp, TikTok, or Instagram' },
                      { step: '3', text: 'Earn ₦500 when they complete a task' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-3 sm:flex-col sm:text-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{item.step}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="/vendor/signup"
                      className="flex-1 px-6 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform inline-flex items-center justify-center gap-2 shadow-elevated"
                    >
                      <Users size={18} /> Sign Up as Vendor
                    </a>
                    <a
                      href="/vendor/login"
                      className="flex-1 px-6 py-3.5 border border-border text-foreground rounded-full font-semibold hover:bg-secondary transition inline-flex items-center justify-center gap-2"
                    >
                      Get Your Referral Link →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* Why SpringUpAI Exists */}
      <section className="py-20 sm:py-28 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Why this exists</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                People are tired of jumping between apps, chasing unreliable service providers, and payment confusion.
              </p>
              <p className="text-lg font-semibold text-foreground">
                We remove all of that. One message. Everything handled.
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(1_0_0/0.05),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Section>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Tell us once.<br />We handle everything.
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of Nigerians who stopped stressing about everyday tasks.
            </p>
            <a href="/chat" className="group inline-flex px-8 py-4 bg-white text-primary rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform items-center gap-2 shadow-float">
              <MessageCircle size={20} />
              Start on WhatsApp
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            <Logo />
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <a href="/vendor/signup" className="hover:text-foreground transition">For Vendors</a>
              <a href="/admin/login" className="hover:text-foreground transition">Admin Radio</a>
              <a href="/chat" className="hover:text-foreground transition">Contact</a>
              <a href="/privacy-policy" className="hover:text-foreground transition">Privacy Policy</a>
              <a href="/terms-and-conditions" className="hover:text-foreground transition">Terms &amp; Conditions</a>
              <a href="/refund-policy" className="hover:text-foreground transition">Refund Policy</a>
              <a href="/return-policy" className="hover:text-foreground transition">Return Policy</a>
              <a href="/datadeletion" className="hover:text-foreground transition">Data Deletion</a>
            </div>
            <p className="text-xs text-muted-foreground">&copy; 2026 SpringUpAI. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/60 text-center max-w-lg">
              Payments subject to 7.5% VAT (FIRS). Personal data handled under NDPR. Content policy applies — lawful requests only.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
